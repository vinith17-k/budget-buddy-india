import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const store = getStore();
  const txns = store.transactions
    .filter((t) => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50);

  return NextResponse.json(txns);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = new URL(req.url);
  const idStr = searchParams.get("id");
  const id = idStr ? parseInt(idStr, 10) : null;

  if (!id) {
    return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
  }

  const store = getStore();
  const idx = store.transactions.findIndex((t) => t.id === id && t.user_id === userId);
  if (idx !== -1) {
    store.transactions.splice(idx, 1);
    return NextResponse.json({ status: "deleted", id });
  }

  return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
}
