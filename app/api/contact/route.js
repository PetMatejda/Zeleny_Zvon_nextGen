import { NextResponse } from 'next/server';
import { sendEmail } from '../../../lib/email.js';
import { escapeHtml, textToSafeHtml } from '../../../lib/utils.js';

export async function POST(request) {
  const { name, email, message } = await request.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Uveďte jméno, e-mail a zprávu.' }, { status: 400 });
  }

  try {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = textToSafeHtml(message);

    const htmlContent = `
      <h2 style="margin-top: 0; color: #558266; font-size: 22px; font-weight: normal; border-bottom: 1px solid #e1ebe4; padding-bottom: 15px;">
          Nová zpráva z webu
      </h2>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #444444;">
          <tr>
              <td width="70" style="padding-bottom: 5px; color: #666666;">Jméno:</td>
              <td style="padding-bottom: 5px;"><strong style="color: #333333;">${safeName}</strong></td>
          </tr>
          <tr>
              <td style="color: #666666;">E-mail:</td>
              <td><a href="mailto:${safeEmail}" style="color: #558266; text-decoration: none; font-weight: bold;">${safeEmail}</a></td>
          </tr>
      </table>

      <p style="margin: 0 0 10px 0; font-size: 13px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">
          Znění zprávy:
      </p>

      <div style="background-color: #f4f7f5; border-left: 4px solid #558266; border-radius: 0 4px 4px 0; padding: 20px; color: #333333; line-height: 1.6; font-size: 15px;">
          ${safeMessage}
      </div>
    `;

    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'zelenyzvon@gmail.com',
      replyTo: email,
      subject: `Nová zpráva od ${name} - Zelený Zvon`,
      htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Nepodařilo se odeslat kontaktní e-mail:', err);
    return NextResponse.json({ error: 'Zprávu se nepodařilo odeslat. Zkuste to prosím později.' }, { status: 500 });
  }
}
