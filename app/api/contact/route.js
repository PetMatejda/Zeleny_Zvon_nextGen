import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { name, email, message } = await request.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Uveďte jméno, e-mail a zprávu.' }, { status: 400 });
  }

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

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #765a17;">Nová zpráva z kontaktního formuláře</h2>
        <p><strong>Napsal:</strong> ${name} (${email})</p>
        <p><strong>Zpráva:</strong></p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #765a17;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Zelený Zvon" <zelenyzvon@gmail.com>',
      to: process.env.ADMIN_EMAIL || 'zelenyzvon@gmail.com',
      replyTo: email,
      subject: `Nová zpráva od ${name} - Zelený Zvon`,
      html: htmlTemplate,
    });

    if (transporter.options.host === 'smtp.ethereal.email') {
      console.log('Náhled testovací kontaktní zprávy:', nodemailer.getTestMessageUrl(info));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Nepodařilo se odeslat kontaktní e-mail:', err);
    return NextResponse.json({ error: 'Zprávu se nepodařilo odeslat. Zkuste to prosím později.' }, { status: 500 });
  }
}
