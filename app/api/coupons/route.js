import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { coupons } from '../../../lib/schema.js';
import { authenticateToken } from '../../../lib/auth.js';
import { desc } from 'drizzle-orm';

// GET /api/coupons — list all (auth required)
export async function GET(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.id));
    return NextResponse.json(allCoupons);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/coupons — create coupon (auth required)
export async function POST(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { code, discount_type, discount_value, usage_limit, valid_from, valid_until } = await request.json();
    const limitVal = usage_limit ? Number(usage_limit) : null;
    const fromVal = valid_from || null;
    const untilVal = valid_until || null;

    const result = await db.insert(coupons).values({
      code,
      discount_type,
      discount_value,
      usage_limit: limitVal,
      valid_from: fromVal,
      valid_until: untilVal,
      times_used: 0,
      is_active: true
    }).returning();

    return NextResponse.json(result[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
