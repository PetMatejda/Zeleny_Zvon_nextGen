import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { UPLOADS_DIR } from '../../../lib/db.js';
import { authenticateToken } from '../../../lib/auth.js';

export async function POST(request) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'Nahrání obrázku selhalo.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filepath = join(UPLOADS_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Chyba při nahrávání souboru.' }, { status: 500 });
  }
}
