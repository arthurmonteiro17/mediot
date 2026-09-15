import { NextResponse } from "next/server";
import { getBootstrapData } from "@/lib/inventory";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getBootstrapData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao carregar dados.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
