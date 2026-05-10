import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db-drizzle.js';
import { orders } from '../../../../../lib/schema.js';
import { authenticateToken } from '../../../../../lib/auth.js';
import { eq } from 'drizzle-orm';
import { getBarcodeLabelUrl } from '../../../../../lib/packeta.js';

// GET /api/orders/[id]/label — vrátí PDF štítek ze Zásilkovny
export async function GET(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    const [order] = await db.select().from(orders).where(eq(orders.id, parseInt(id)));

    if (!order) return NextResponse.json({ error: 'Objednávka nenalezena' }, { status: 404 });
    if (!order.packetaBarcode) {
      return NextResponse.json({ error: 'Tato objednávka nemá přiřazený barcode Zásilkovny' }, { status: 400 });
    }

    const labelUrl = getBarcodeLabelUrl(order.packetaBarcode);
    if (!labelUrl) {
      return NextResponse.json({ error: 'PACKETA_API_PASSWORD není nastaveno' }, { status: 500 });
    }

    // Stáhneme PDF ze Zásilkovny a přepošleme klientovi
    const pdfResponse = await fetch(labelUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: `Zásilkovna nevrátila štítek (${pdfResponse.status})` },
        { status: 502 }
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="stitek_${order.packetaBarcode}.pdf"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
