import nodemailer from 'nodemailer';
import { db } from './db-drizzle.js';
import { settings } from './schema.js';
import { eq } from 'drizzle-orm';

// Singleton transporter
let transporterInstance = null;

async function getTransporter() {
  if (transporterInstance) return transporterInstance;

  const options = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
  };

  if (process.env.SMTP_USER) {
    options.auth = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS };
  }

  transporterInstance = nodemailer.createTransport(options);

  if (transporterInstance.options.host === 'smtp.ethereal.email' && !process.env.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance.options.auth = { user: testAccount.user, pass: testAccount.pass };
  }

  return transporterInstance;
}

export async function getBaseTemplate() {
  try {
    const result = await db.select().from(settings).where(eq(settings.key, 'email_base_template'));
    if (result && result.length > 0) {
      return result[0].value;
    }
  } catch (error) {
    console.error('Failed to fetch email_base_template from DB:', error);
  }
  
  // Fallback if DB fails
  return `
    <div style="font-family: Arial, sans-serif; color: #1b1c19; max-width: 600px; margin: 0 auto; border: 1px solid #765a17; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #765a17; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-style: italic;">Zelený Zvon</h1>
      </div>
      <div style="padding: 30px;">
        {{{CONTENT}}}
      </div>
      <div style="background-color: #f6f5f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        Zelený Zvon | Zpět k přírodě<br/>Pokud máte jakékoliv dotazy, jednoduše odpovězte na tento e-mail.
      </div>
    </div>
  `;
}

export async function sendEmail({ to, subject, htmlContent, textContent, replyTo, attachments }) {
  const transporter = await getTransporter();
  const baseTemplate = await getBaseTemplate();
  
  const finalHtml = baseTemplate.replace('{{{CONTENT}}}', htmlContent);
  const fromAddress = process.env.SMTP_FROM || '"Zelený Zvon" <zelenyzvon@gmail.com>';

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    html: finalHtml,
  };

  if (textContent) mailOptions.text = textContent;
  if (replyTo) mailOptions.replyTo = replyTo;
  if (attachments) mailOptions.attachments = attachments;

  const info = await transporter.sendMail(mailOptions);

  if (transporter.options.host === 'smtp.ethereal.email') {
    console.log('Náhled testovacího emailu:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}
