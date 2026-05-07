import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db.js';
import { authenticateToken } from '../../../lib/auth.js';
import qrcode from 'qrcode';
import { sendEmail } from '../../../lib/email.js';
import PDFDocument from 'pdfkit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '../../../../fonts');

// GET /api/orders — list all (auth required)
export async function GET(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  return new Promise((resolve) => {
    db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      resolve(NextResponse.json(rows));
    });
  });
}

// POST /api/orders — create order
export async function POST(request) {
  const db = getDb();
  const { customerName, email, address, totalAmount, items, couponCode } = await request.json();

  return new Promise((resolve) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const finalizeOrder = (cId, fAmount) => {
        db.run(
          'INSERT INTO orders (customerName, email, address, totalAmount, coupon_id) VALUES (?, ?, ?, ?, ?)',
          [customerName, email, address || '', fAmount, cId],
          async function (err) {
            if (err) {
              db.run('ROLLBACK');
              return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            }
            const orderId = this.lastID;

            const stmt = db.prepare('INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)');
            items.forEach(item => stmt.run(orderId, item.productId, item.quantity));
            stmt.finalize();

            if (cId) db.run('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [cId]);
            db.run('COMMIT');

            // Generate SPAYD QR code
            const formattedAmount = Number(fAmount).toFixed(2);
            const spaydStr = `SPD*1.0*ACC:CZ5108000000001570560063*AM:${formattedAmount}*CC:CZK*X-VS:${orderId}*MSG:Objednavka%20${orderId}%20Zeleny%20Zvon`;
            const qrCodeDataUrl = await qrcode.toDataURL(spaydStr, { margin: 2, scale: 5 });

            resolve(NextResponse.json({ id: orderId, status: 'Nová', totalAmount: fAmount, qrCode: qrCodeDataUrl }));

            // Async: generate invoice & send email (non-blocking)
            setTimeout(() => generateAndSendInvoice(orderId, customerName, email, address, fAmount, items, qrCodeDataUrl), 50);
          }
        );
      };

      if (couponCode) {
        db.get('SELECT id, discount_type, discount_value FROM coupons WHERE code = ? AND is_active = 1', [couponCode], (err, row) => {
          if (row) {
            let finalAmount = row.discount_type === 'percent'
              ? totalAmount * (1 - row.discount_value / 100)
              : totalAmount - row.discount_value;
            if (finalAmount < 0) finalAmount = 0;
            finalizeOrder(row.id, Math.round(finalAmount));
          } else {
            finalizeOrder(null, Math.round(totalAmount));
          }
        });
      } else {
        finalizeOrder(null, Math.round(totalAmount));
      }
    });
  });
}

async function generateAndSendInvoice(orderId, name, email, address, amount, items, qrCodeDataUrl) {
  const db = getDb();
  try {
    const itemDetails = await new Promise((resolve, reject) => {
      const productIds = items.map(i => i.productId).join(',');
      if (!productIds) return resolve([]);
      db.all(`SELECT id, name, price FROM products WHERE id IN (${productIds})`, (err, rows) => {
        if (err) reject(err);
        else {
          const enrichedItems = items.map(item => {
            const product = rows.find(r => r.id === item.productId);
            return { ...item, name: product ? product.name : 'Neznámý produkt', price: product ? product.price : 0 };
          });
          resolve(enrichedItems);
        }
      });
    });

    const doc = new PDFDocument({ margin: 50 });
    doc.registerFont('Roboto', join(FONTS_DIR, 'Roboto-Regular.ttf'));
    doc.registerFont('Roboto-Bold', join(FONTS_DIR, 'Roboto-Bold.ttf'));

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      console.log(`Faktura vygenerována pro ${email}. Připravuji odeslání e-mailu...`);
      try {
        const qrBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrBufferEmail = Buffer.from(qrBase64, 'base64');

        const htmlContent = `
          <h2 style="margin-top: 0; color: #558266; font-size: 24px; font-weight: normal;">Děkujeme za vaši objednávku!</h2>
          <p style="margin-top: 0; margin-bottom: 15px;">Vážený/á zákazníku,</p>
          <p style="margin-top: 0; margin-bottom: 25px;">vaše objednávka číslo <strong style="color: #333333;">${orderId}</strong> byla úspěšně zpracována. V příloze tohoto e-mailu najdete zálohovou fakturu k proplacení ve formátu PDF.</p>

          <!-- Zvýrazněný blok pro platbu -->
          <div style="background-color: #f4f7f5; border-left: 4px solid #558266; border-radius: 4px; padding: 25px; margin-bottom: 30px;">
              <h3 style="color: #558266; border-bottom: 1px solid #dcebdc; padding-bottom: 10px; margin-top: 0; margin-bottom: 15px; font-size: 18px; font-weight: normal;">Výzva k úhradě</h3>
              
              <p style="margin-top: 0; margin-bottom: 20px;">Prosíme o laskavou úhradu částky: <strong style="font-size: 20px; color: #333333;">${amount} Kč</strong></p>
              
              <!-- Tabulka pro dokonalé zarovnání platebních údajů -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 16px; line-height: 1.6; color: #444444;">
                  <tr>
                      <td width="140" style="padding-bottom: 8px; color: #666666;">Číslo účtu:</td>
                      <td style="padding-bottom: 8px;"><strong style="color: #333333; font-size: 17px;">1570560063/0800</strong></td>
                  </tr>
                  <tr>
                      <td style="color: #666666;">Variabilní symbol:</td>
                      <td><strong style="color: #333333;">${orderId}</strong></td>
                  </tr>
              </table>
          </div>

          <!-- Sekce pro QR kód -->
          <div style="text-align: center; margin: 30px 0 10px 0; background-color: #ffffff; border: 1px solid #e1ebe4; border-radius: 8px; padding: 25px;">
              <p style="font-size: 14px; color: #666666; margin-top: 0; margin-bottom: 15px;">
                  Pro rychlou a snadnou platbu přes mobilní bankovnictví<br>můžete naskenovat tento QR kód:
              </p>
              <img src="cid:qrcode_image" alt="QR Platba" width="180" height="180" style="width: 180px; height: 180px; display: inline-block; border: 1px solid #e1ebe4; border-radius: 8px; padding: 10px; background-color: #ffffff;" />
          </div>
        `;

        await sendEmail({
          to: email,
          subject: `Zálohová faktura - objednávka č. ${orderId} - Zelený Zvon`,
          htmlContent,
          attachments: [
            { filename: `Zalohova_faktura_${orderId}.pdf`, content: pdfData },
            { filename: 'qrcode.png', content: qrBufferEmail, cid: 'qrcode_image' },
          ],
        });

        console.log('Email úspěšně odeslán na:', email);
      } catch (err) {
        console.error('Nepodařilo se odeslat e-mail:', err);
      }
    });

    // Build PDF (same as before)
    doc.font('Roboto-Bold').fontSize(26).fillColor('#765a17').text('Zelený Zvon', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Roboto').fontSize(16).fillColor('#1b1c19').text('Zálohová faktura / Výzva k platbě', { align: 'center' });
    doc.moveDown(2);
    const topY = doc.y;
    doc.font('Roboto-Bold').fontSize(12).text('Dodavatel:');
    doc.font('Roboto').text('Zelený Zvon\nE-mail: info@zelenyzvon.cz');
    doc.y = topY;
    doc.x = 300;
    doc.font('Roboto-Bold').fontSize(12).text('Odběratel:');
    doc.font('Roboto').text(name || 'Neznámý zákazník');
    if (address) doc.text(address, { width: 200 });
    else doc.text(email);
    doc.x = 50;
    doc.moveDown(3);
    doc.font('Roboto-Bold').fontSize(14).fillColor('#765a17').text(`Číslo objednávky: ${orderId}`);
    doc.moveDown(1);
    doc.rect(50, doc.y, 500, 20).fill('#f6f5f1');
    doc.fillColor('#1b1c19').font('Roboto-Bold').fontSize(10);
    doc.text('Položka', 60, doc.y + 5);
    doc.text('Množství', 350, doc.y - 12);
    doc.text('Cena celkem', 450, doc.y - 12);
    doc.moveDown(1.5);
    let currentY = doc.y;
    doc.font('Roboto').fontSize(10);
    itemDetails.forEach((item) => {
      doc.text(item.name, 60, currentY);
      doc.text(`${item.quantity} ks`, 350, currentY);
      doc.text(`${item.quantity * item.price} Kč`, 450, currentY);
      currentY += 20;
      doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).lineWidth(0.5).strokeOpacity(0.2).stroke();
    });
    doc.y = currentY + 20;
    doc.font('Roboto-Bold').fontSize(14).fillColor('#765a17').text(`Celková částka: ${amount} Kč`, { align: 'right' });
    doc.moveDown(3);
    const boxY = doc.y;
    doc.rect(50, boxY, 500, 150).lineWidth(1).strokeOpacity(1).strokeColor('#765a17').stroke();
    doc.x = 70;
    doc.y = boxY + 20;
    doc.font('Roboto-Bold').fontSize(12).fillColor('#1b1c19').text('Platební údaje:');
    doc.moveDown(0.5);
    doc.font('Roboto').text(`Prosíme o úhradu převodem.\n\nČíslo účtu: 1570560063/0800\nVariabilní symbol: ${orderId}\nČástka k úhradě: ${amount} Kč`);
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');
    doc.image(qrBuffer, 380, boxY + 15, { width: 120 });
    doc.x = 50;
    doc.y = doc.page.height - 70;
    doc.fontSize(10).fillColor('grey').text('Děkujeme za váš nákup u Zelený Zvon!', { align: 'center' });
    doc.end();
  } catch (e) {
    console.error('Došlo k chybě při generování faktury:', e);
  }
}
