import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db.js';
import { authenticateToken } from '../../../../lib/auth.js';

// DELETE /api/coupons/[id]
export async function DELETE(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  const { id } = await params;

  return new Promise((resolve) => {
    db.run('DELETE FROM coupons WHERE id = ?', [id], function (err) {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      resolve(NextResponse.json({ success: true }));
    });
  });
}
