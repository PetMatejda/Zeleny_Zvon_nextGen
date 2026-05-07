import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db-drizzle.js';
import { coupons } from '../../../../lib/schema.js';
import { eq, and } from 'drizzle-orm';

// GET /api/coupons/validate?code=CODE
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const [row] = await db.select({
      id: coupons.id,
      discount_type: coupons.discount_type,
      discount_value: coupons.discount_value,
      usage_limit: coupons.usage_limit,
      times_used: coupons.times_used,
      valid_from: coupons.valid_from,
      valid_until: coupons.valid_until
    })
    .from(coupons)
    .where(and(eq(coupons.code, code), eq(coupons.is_active, true)));

    if (!row) return NextResponse.json({ error: 'Kupón nenalezen nebo vypršel' }, { status: 404 });
    
    if (row.usage_limit && row.times_used >= row.usage_limit) {
      return NextResponse.json({ error: 'Kupón byl vyčerpán' }, { status: 400 });
    }
    
    const now = new Date();
    if (row.valid_from && new Date(row.valid_from) > now) {
      return NextResponse.json({ error: 'Platnost tohoto kupónu ještě nezačala' }, { status: 400 });
    }
    if (row.valid_until && new Date(row.valid_until) < now) {
      return NextResponse.json({ error: 'Platnost tohoto kupónu již vypršela' }, { status: 400 });
    }
    
    return NextResponse.json({ valid: true, discount_type: row.discount_type, discount_value: row.discount_value, id: row.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
