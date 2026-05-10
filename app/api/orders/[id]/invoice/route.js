import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db-drizzle.js';
import { orders, order_items, products } from '../../../../../lib/schema.js';
import { authenticateToken } from '../../../../../lib/auth.js';
import { eq, inArray } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import qrcode from 'qrcode';
import { join } from 'path';

const FONTS_DIR = join(process.cwd(), 'fonts');

// GET /api/orders/[id]/invoice — generuje fakturu PDF na vyžádání
export async function GET(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    const orderId = parseInt(id);

    // Načteme objednávku
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return NextResponse.json({ error: 'Objednávka nenalezena' }, { status: 404 });

    // Načteme položky
    const items = await db.select().from(order_items).where(eq(order_items.orderId, orderId));
    const productIds = items.map(i => i.productId).filter(Boolean);

    let itemDetails = [];
    if (productIds.length > 0) {
      const productsData = await db.select({ id: products.id, name: products.name, price: products.price })
        .from(products)
        .where(inArray(products.id, productIds));
      itemDetails = items.map(item => {
        const product = productsData.find(r => r.id === item.productId);
        return { ...item, name: product ? product.name : 'Neznámý produkt', price: product ? product.price : 0 };
      });
    }

    const amount = (Number(order.totalAmount) / 100).toFixed(2);
    const bankAccountIban = process.env.BANK_ACCOUNT_IBAN || '';
    const bankAccountDisplay = process.env.BANK_ACCOUNT || '';
    const spaydStr = `SPD*1.0*ACC:${bankAccountIban}*AM:${amount}*CC:CZK*X-VS:${orderId}*MSG:Objednavka%20${orderId}%20Zeleny%20Zvon`;
    const qrCodeDataUrl = await qrcode.toDataURL(spaydStr, { margin: 2, scale: 5 });

    // Generujeme PDF
    const pdfBuffer = await new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        doc.registerFont('Roboto', join(FONTS_DIR, 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', join(FONTS_DIR, 'Roboto-Bold.ttf'));

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Hlavička
        doc.font('Roboto-Bold').fontSize(26).fillColor('#765a17').text('Zelený Zvon', { align: 'center' });
        doc.moveDown(0.5);
        doc.font('Roboto').fontSize(16).fillColor('#1b1c19').text('Zálohová faktura / Výzva k platbě', { align: 'center' });
        doc.moveDown(2);

        // Dodavatel / Odběratel
        const topY = doc.y;
        doc.font('Roboto-Bold').fontSize(12).text('Dodavatel:');
        doc.font('Roboto').text('Zelený Zvon\nE-mail: info@zelenyzvon.cz');
        doc.y = topY;
        doc.x = 300;
        doc.font('Roboto-Bold').fontSize(12).text('Odběratel:');
        doc.font('Roboto').text(order.customerName || 'Neznámý zákazník');
        if (order.address) doc.text(order.address, { width: 200 });
        else doc.text(order.email);
        doc.x = 50;
        doc.moveDown(3);

        // Číslo objednávky
        doc.font('Roboto-Bold').fontSize(14).fillColor('#765a17').text(`Číslo objednávky: ${orderId}`);
        doc.moveDown(1);

        // Tabulka položek
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
          doc.text(`${(item.quantity * item.price).toLocaleString('cs-CZ')} Kč`, 450, currentY);
          currentY += 20;
          doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).lineWidth(0.5).strokeOpacity(0.2).stroke();
        });
        doc.y = currentY + 20;

        // Celková částka
        const displayAmount = parseFloat(amount);
        doc.font('Roboto-Bold').fontSize(14).fillColor('#765a17').text(`Celková částka: ${displayAmount} Kč`, { align: 'right' });
        doc.moveDown(3);

        // Platební box
        const boxY = doc.y;
        doc.rect(50, boxY, 500, 150).lineWidth(1).strokeOpacity(1).strokeColor('#765a17').stroke();
        doc.x = 70;
        doc.y = boxY + 20;
        doc.font('Roboto-Bold').fontSize(12).fillColor('#1b1c19').text('Platební údaje:');
        doc.moveDown(0.5);
        doc.font('Roboto').text(`Prosíme o úhradu převodem.\n\nČíslo účtu: ${bankAccountDisplay}\nVariabilní symbol: ${orderId}\nČástka k úhradě: ${displayAmount} Kč`);

        // QR kód
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        doc.image(qrBuffer, 380, boxY + 15, { width: 120 });

        // Patička
        doc.x = 50;
        doc.y = doc.page.height - 70;
        doc.fontSize(10).fillColor('grey').text('Děkujeme za váš nákup u Zelený Zvon!', { align: 'center' });

        doc.end();
      } catch (e) {
        reject(e);
      }
    });

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Faktura_${orderId}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Chyba při generování faktury:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
