import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { settings } from '../../../lib/schema.js';
import { eq } from 'drizzle-orm';

export async function GET(request) {
  try {
    const existing = await db.select().from(settings).where(eq(settings.key, 'email_base_template'));
    return NextResponse.json({ success: true, data: existing });
  } catch (err) {
    return NextResponse.json({ 
        error: err.message, 
        cause: err.cause ? err.cause.message : 'no cause',
        stack: err.stack
    }, { status: 500 });
  }
}
