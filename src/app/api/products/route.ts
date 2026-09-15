import { NextResponse } from "next/server";
import { createProductInDb, getBootstrapData } from "@/lib/inventory";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getBootstrapData();
    return NextResponse.json({ products: data.products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao listar produtos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createProductInDb({
      name: String(body.name ?? ""),
      sku: String(body.sku ?? ""),
      category: String(body.category ?? ""),
      unit: String(body.unit ?? "un"),
      stock: Number(body.stock ?? 0),
      minStock: Number(body.minStock ?? 0),
      criticalStock: Number(body.criticalStock ?? 0),
      rfidTag: String(body.rfidTag ?? ""),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao cadastrar produto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
