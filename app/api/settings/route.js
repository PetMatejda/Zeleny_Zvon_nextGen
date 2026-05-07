import { NextResponse } from 'next/server';
import { db } from '../../../lib/db-drizzle.js';
import { settings } from '../../../lib/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../../../lib/auth.js';

// GET /api/settings - Fetch settings (auth required)
export async function GET(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const result = await db.select().from(settings);
    // Convert array of {key, value} to object { key: value }
    const settingsMap = {};
    result.forEach(row => {
      settingsMap[row.key] = row.value;
    });
    return NextResponse.json(settingsMap);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/settings - Update settings (auth required)
export async function POST(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const body = await request.json();
    
    // Process each key-value pair and upsert
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        const existing = await db.select().from(settings).where(eq(settings.key, key));
        if (existing.length > 0) {
          await db.update(settings).set({ value, updatedAt: new Date().toISOString() }).where(eq(settings.key, key));
        } else {
          await db.insert(settings).values({ key, value });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
