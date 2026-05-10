import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db-drizzle.js';
import { orders, order_items, products } from '../../../../../lib/schema.js';
import { authenticateToken } from '../../../../../lib/auth.js';
import { eq, inArray } from 'drizzle-orm';
import { createPacketaShipment, cancelPacketaShipment } from '../../../../../lib/packeta.js';

// PATCH /api/orders/[id]/status
export async function PATCH(request, { params }) {
  const { error } = authenticateToken(request);
  if (error) return error;

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    // Načteme aktuální objednávku před změnou statusu
    const [currentOrder] = await db.select().from(orders).where(eq(orders.id, parseInt(id)));
    if (!currentOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Aktualizujeme status
    await db.update(orders).set({ status }).where(eq(orders.id, parseInt(id)));

    // --- Automatické zakládání zásilky v Zásilkovně ---
    if (
      status === 'Zaplacená' &&
      currentOrder.shippingMethod !== 'pickup' &&
      currentOrder.shippingMethod != null &&
      !currentOrder.packetaBarcode
    ) {
      // Spustíme async, neblokujeme response
      setTimeout(async () => {
        try {
          const { barcode, packetId } = await createPacketaShipment(currentOrder);
          await db.update(orders)
            .set({ packetaBarcode: barcode, packetaPacketId: packetId })
            .where(eq(orders.id, parseInt(id)));
          console.log(`✅ Zásilkovna zásilka vytvořena pro objednávku #${id}: ${barcode}`);
        } catch (err) {
          console.error(`❌ Chyba při vytváření Zásilkovna zásilky pro objednávku #${id}:`, err.message);
        }
      }, 100);
    }

    // --- Automatické rušení zásilky v Zásilkovně ---
    if (status === 'Zrušená' && currentOrder.packetaBarcode) {
      setTimeout(async () => {
        try {
          await cancelPacketaShipment(currentOrder.packetaBarcode);
          console.log(`✅ Zásilkovna zásilka ${currentOrder.packetaBarcode} zrušena pro objednávku #${id}`);
        } catch (err) {
          console.error(`❌ Chyba při rušení Zásilkovna zásilky pro objednávku #${id}:`, err.message);
        }
      }, 100);
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
