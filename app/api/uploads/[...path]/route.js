import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { UPLOADS_DIR } from '../../../../lib/db.js';

// Replaces express.static('/uploads') — serves uploaded product images
export async function GET(request, { params }) {
  const { path: pathSegments } = await params;
  const filename = pathSegments.join('/');

  // Basic security: prevent directory traversal
  if (filename.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const filepath = join(UPLOADS_DIR, filename);
    const buffer = await readFile(filepath);

    const ext = filename.split('.').pop().toLowerCase();
    const contentTypeMap = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
