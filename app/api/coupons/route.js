import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db.js';
import { authenticateToken } from '../../../lib/auth.js';

// GET /api/coupons — list all (auth required)
export async function GET(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  return new Promise((resolve) => {
    db.all('SELECT * FROM coupons ORDER BY id DESC', [], (err, rows) => {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      resolve(NextResponse.json(rows));
    });
  });
}

// POST /api/coupons — create coupon (auth required)
export async function POST(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  const { code, discount_type, discount_value, usage_limit, valid_from, valid_until } = await request.json();
  const limitVal = usage_limit ? Number(usage_limit) : null;
  const fromVal = valid_from || null;
  const untilVal = valid_until || null;

  return new Promise((resolve) => {
    db.run(
      'INSERT INTO coupons (code, discount_type, discount_value, usage_limit, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?)',
      [code, discount_type, discount_value, limitVal, fromVal, untilVal],
      function (err) {
        if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        resolve(NextResponse.json({ id: this.lastID, code, discount_type, discount_value, usage_limit: limitVal, valid_from: fromVal, valid_until: untilVal, times_used: 0, is_active: 1 }));
      }
    );
  });
}
