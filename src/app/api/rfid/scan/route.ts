import { NextResponse } from "next/server";
import { registerRfidScan } from "@/lib/inventory";

export const runtime = "nodejs";

function parseScanBody(raw: string) {
  const cleaned = raw.replace(/^\uFEFF/, "").trim();
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "JSON inválido no body. Use exatamente: {\"userUid\":\"67:52:B0:A0\",\"productUid\":\"F5:76:82:B1\"}",
    );
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Body deve ser um objeto JSON.");
  }
  const record = data as Record<string, unknown>;
  return {
    userUid: String(record.userUid ?? "").replace(/[\u0000-\u001F]/g, "").trim(),
    productUid: String(record.productUid ?? "")
      .replace(/[\u0000-\u001F]/g, "")
      .trim(),
  };
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    let payload: { userUid: string; productUid: string };
    try {
      payload = parseScanBody(raw);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "JSON inválido no body.",
        },
        { status: 400 },
      );
    }

    const result = await registerRfidScan(payload);

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
