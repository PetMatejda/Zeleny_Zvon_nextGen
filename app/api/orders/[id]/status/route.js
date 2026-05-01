import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db.js';
import { authenticateToken } from '../../../../../lib/auth.js';

// PATCH /api/orders/[id]/status
export async function PATCH(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  const db = getDb();
  const { id } = await params;
  const { status } = await request.json();

  if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

  return new Promise((resolve) => {
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function (err) {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      if (this.changes === 0) return resolve(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
      resolve(NextResponse.json({ success: true, status }));
    });
  });
}
