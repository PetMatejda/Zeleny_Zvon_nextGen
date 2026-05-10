import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { settings } from '../../../lib/schema.js';
import { eq, inArray } from 'drizzle-orm';

// GET /api/public-settings - Fetch safe public settings (no auth required)
export async function GET(request) {
  try {
    const PUBLIC_KEYS = ['price_packeta_zbox', 'price_packeta_home'];
    
    const result = await db.select().from(settings).where(inArray(settings.key, PUBLIC_KEYS));
    
    const settingsMap = {};
    result.forEach(row => {
      settingsMap[row.key] = row.value;
    });
    
    return NextResponse.json(settingsMap);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
