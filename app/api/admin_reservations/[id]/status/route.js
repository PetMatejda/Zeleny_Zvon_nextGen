import { NextResponse } from 'next/server';
import { authenticateToken } from '../../../../../lib/auth.js';
import { approveBooking, rejectBooking } from '../../../../actions/reservations.js';

export async function PATCH(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // 'confirmed' or 'cancelled'

    if (status === 'confirmed') {
        const res = await approveBooking(id);
        if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
        return NextResponse.json({ success: true });
    } else if (status === 'cancelled') {
        const res = await rejectBooking(id);
        if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Neplatný status' }, { status: 400 });
  } catch(e) {
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}
