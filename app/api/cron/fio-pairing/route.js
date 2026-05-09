import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db-drizzle.js';
import { orders } from '../../../../lib/schema.js';
import { eq, and, inArray } from 'drizzle-orm';
import { sendEmail } from '../../../../lib/email.js';

export async function GET(request) {
  try {
    // 1. Authorization
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const tokenParam = url.searchParams.get('token');
    
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET is not configured on server.' }, { status: 500 });
    }

    const isAuthorized = (authHeader === `Bearer ${cronSecret}`) || (tokenParam === cronSecret);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fioToken = process.env.FIO_API_TOKEN?.trim();
    if (!fioToken) {
      return NextResponse.json({ error: 'FIO_API_TOKEN is not configured on server.' }, { status: 500 });
    }

    // 2. Fetch Fio API
    const fioUrl = `https://fioapi.fio.cz/v1/rest/last/${fioToken}/transactions.json`;
    const fioResponse = await fetch(fioUrl, { cache: 'no-store' });

    // Rate Limit handling
    if (fioResponse.status === 409) {
      return NextResponse.json({ status: 'rate_limited', message: 'Fio API rate limit exceeded (1 req/min). Skipping.' }, { status: 200 });
    }

    if (!fioResponse.ok) {
      return NextResponse.json({ error: `Fio API error: ${fioResponse.status} ${fioResponse.statusText}` }, { status: 500 });
    }

    const rawText = await fioResponse.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      return NextResponse.json({ 
        error: "Odpověď z Fio API není validní JSON.", 
        raw_response_snippet: rawText.substring(0, 200) 
      }, { status: 500 });
    }

    const transactionList = data?.accountStatement?.transactionList?.transaction || [];

    const results = {
      processed: 0,
      matched_exact: 0,
      matched_error_amount: 0,
      details: []
    };

    // 3. Optimalizované zpracování transakcí (Ochrana proti N+1 databázovému problému)
    // Nejdříve si vytáhneme všechny VS z Fia
    const validTransactions = new Map();
    for (const tx of transactionList) {
      if (!tx || !tx.column1 || !tx.column5) continue;
      
      const amountVal = tx.column1.value;
      const vsVal = tx.column5.value;

      if (amountVal > 0 && vsVal) {
        results.processed++;
        const vsNum = parseInt(vsVal, 10);
        if (!isNaN(vsNum)) {
          validTransactions.set(vsNum, tx);
        }
      }
    }

    const vsArray = Array.from(validTransactions.keys());

    // Pokud existují nějaké relevantní platby, uděláme POUZE JEDEN databázový dotaz
    if (vsArray.length > 0) {
      const matchingOrders = await db.select().from(orders).where(
        and(
          inArray(orders.id, vsArray),
          eq(orders.status, 'Nová')
        )
      );

      // 4. Párování nalezených objednávek
      for (const order of matchingOrders) {
        const tx = validTransactions.get(order.id);
        const amountVal = tx.column1.value;
        const vsVal = tx.column5.value;
        const fioAmountInCents = Math.round(parseFloat(amountVal) * 100);

        if (fioAmountInCents === order.totalAmount) {
          // Perfect match
          await db.update(orders).set({ status: 'Zaplacená' }).where(eq(orders.id, order.id));
          results.matched_exact++;
          results.details.push({ id: order.id, vs: vsVal, status: 'Zaplacená', expected: order.totalAmount, received: fioAmountInCents });
        } else {
          // Amount mismatch
          await db.update(orders).set({ status: 'Chybná částka' }).where(eq(orders.id, order.id));
          results.matched_error_amount++;
          results.details.push({ id: order.id, vs: vsVal, status: 'Chybná částka', expected: order.totalAmount, received: fioAmountInCents });
          
          // Notify Admin
          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail) {
            const htmlContent = `
              <h2>Chybná částka u platby objednávky #${order.id}</h2>
              <p>Zákazník <strong>${order.customerName}</strong> zaplatil odlišnou částku, než byla požadována.</p>
              <ul>
                <li><strong>Očekáváno (v DB):</strong> ${(order.totalAmount / 100).toFixed(2)} Kč</li>
                <li><strong>Přijato z banky:</strong> ${(fioAmountInCents / 100).toFixed(2)} Kč</li>
                <li><strong>Variabilní symbol:</strong> ${vsVal}</li>
              </ul>
              <p>Status objednávky byl automaticky změněn na "Chybná částka". Prosím, zkontrolujte to v administraci.</p>
            `;
            try {
              await sendEmail({
                to: adminEmail,
                subject: `VAROVÁNÍ: Chybná částka - Objednávka #${order.id}`,
                htmlContent
              });
            } catch (e) {
              console.error('Failed to send admin email about payment mismatch:', e);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'success', results });
  } catch (error) {
    console.error('CRON fio-pairing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
