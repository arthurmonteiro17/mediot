import { NextResponse } from "next/server";
import { registerRfidScan } from "@/lib/inventory";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerRfidScan({
      userUid: String(body.userUid ?? ""),
      productUid: String(body.productUid ?? ""),
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        action: result.action,
        movement: result.movement,
        product: result.product,
        staff: result.staff,
        lastSync: result.lastSync,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao processar scan RFID.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
