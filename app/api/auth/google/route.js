import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_zvon';
const ALLOWED_ADMINS = (process.env.ADMIN_EMAILS || 'petmatejda@gmail.com,peta.matejickova@gmail.com,simon.simanski@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase());
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const { credential } = await request.json();
    const ticket = await oAuth2Client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if (!ALLOWED_ADMINS.includes(payload.email.toLowerCase())) {
      console.warn(`Neoprávněný pokus o přihlášení: ${payload.email}`);
      return NextResponse.json({ error: 'Přihlášení zamítnuto: Nemáte oprávnění k administraci.' }, { status: 403 });
    }

    const token = jwt.sign({ email: payload.email, admin: true }, JWT_SECRET, { expiresIn: '8h' });
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Google verify error:', error.message);
    return NextResponse.json({ error: 'Neplatný přihlašovací token.' }, { status: 401 });
  }
}
