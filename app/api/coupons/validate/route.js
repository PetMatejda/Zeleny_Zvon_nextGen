import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db.js';

// GET /api/coupons/validate?code=CODE
export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  return new Promise((resolve) => {
    db.get(
      'SELECT id, discount_type, discount_value, usage_limit, times_used, valid_from, valid_until FROM coupons WHERE code = ? AND is_active = 1',
      [code],
      (err, row) => {
        if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        if (!row) return resolve(NextResponse.json({ error: 'Kupón nenalezen nebo vypršel' }, { status: 404 }));
        if (row.usage_limit && row.times_used >= row.usage_limit) {
          return resolve(NextResponse.json({ error: 'Kupón byl vyčerpán' }, { status: 400 }));
        }
        const now = new Date();
        if (row.valid_from && new Date(row.valid_from) > now) {
          return resolve(NextResponse.json({ error: 'Platnost tohoto kupónu ještě nezačala' }, { status: 400 }));
        }
        if (row.valid_until && new Date(row.valid_until) < now) {
          return resolve(NextResponse.json({ error: 'Platnost tohoto kupónu již vypršela' }, { status: 400 }));
        }
        resolve(NextResponse.json({ valid: true, discount_type: row.discount_type, discount_value: row.discount_value, id: row.id }));
      }
    );
  });
}
