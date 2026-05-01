import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db.js';
import { authenticateToken } from '../../../lib/auth.js';
import qrcode from 'qrcode';
import nodemailer from 'nodemailer';
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
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        if (transporter.options.host === 'smtp.ethereal.email' && !process.env.SMTP_USER) {
          const testAccount = await nodemailer.createTestAccount();
          transporter.options.auth = { user: testAccount.user, pass: testAccount.pass };
        }

        const fromAddress = process.env.SMTP_FROM || '"Zelený Zvon" <zelenyzvon@gmail.com>';
        const qrBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrBufferEmail = Buffer.from(qrBase64, 'base64');

        const htmlTemplate = `
          <div style="font-family: Arial, sans-serif; color: #1b1c19; max-width: 600px; margin: 0 auto; border: 1px solid #765a17; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #765a17; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-style: italic;">Zelený Zvon</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="margin-top: 0; color: #1b1c19;">Děkujeme za vaši objednávku!</h2>
              <p>Vážený/á zákazníku,</p>
              <p>vaše objednávka číslo <strong>${orderId}</strong> byla úspěšně zpracována. V příloze tohoto e-mailu najdete zálohovou fakturu k proplacení ve formátu PDF.</p>
              <div style="background-color: #f6f5f1; border-radius: 8px; padding: 20px;">
                <h3 style="color: #765a17; border-bottom: 2px solid #765a17; padding-bottom: 8px; margin-top: 0;">Výzva k úhradě</h3>
                <p>Prosíme o laskavou úhradu částky: <strong style="font-size: 18px;">${amount} Kč</strong></p>
                <ul style="list-style-type: none; padding-left: 0; line-height: 1.8;">
                  <li>Číslo účtu: <strong>1570560063/0800</strong></li>
                  <li>Variabilní symbol: <strong>${orderId}</strong></li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Pro rychlou a snadnou platbu přes mobilní bankovnictví naskenujte tento QR kód:</p>
                <img src="cid:qrcode_image" alt="QR Platba" style="width: 200px; height: 200px; display: inline-block; border: 2px solid #765a17; border-radius: 10px; padding: 10px;" />
              </div>
            </div>
            <div style="background-color: #f6f5f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              Zelený Zvon | Zpět k přírodě<br/>Pokud máte jakékoliv dotazy, jednoduše odpovězte na tento e-mail.
            </div>
          </div>
        `;

        const info = await transporter.sendMail({
          from: fromAddress, to: email,
          subject: `Zálohová faktura - objednávka č. ${orderId} - Zelený Zvon`,
          html: htmlTemplate,
          attachments: [
            { filename: `Zalohova_faktura_${orderId}.pdf`, content: pdfData },
            { filename: 'qrcode.png', content: qrBufferEmail, cid: 'qrcode_image' },
          ],
        });

        if (transporter.options.host === 'smtp.ethereal.email') {
          console.log('Náhled testovacího emailu:', nodemailer.getTestMessageUrl(info));
        } else {
          console.log('Email úspěšně odeslán na:', email);
        }
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
