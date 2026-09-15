import { NextResponse } from "next/server";
import { getBootstrapData, registerMovementInDb } from "@/lib/inventory";
import type { MovementType } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getBootstrapData();
    return NextResponse.json({ movements: data.movements });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao listar movimentações.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerMovementInDb({
      productId: String(body.productId ?? ""),
      staffId: String(body.staffId ?? ""),
      type: body.type as MovementType,
      quantity: Number(body.quantity ?? 0),
      source: body.source === "rfid" ? "rfid" : "manual",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao registrar movimentação.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
