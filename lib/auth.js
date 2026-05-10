import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_zvon';

export function authenticateToken(request) {
  const authHeader = request.headers.get('authorization');
  // Fallback: token může být předán i jako query parametr (pro PDF endpointy otevírané přes window.open)
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  const token = (authHeader && authHeader.split(' ')[1]) || queryToken;

  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return { error: null, user };
  } catch {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null };
  }
}
