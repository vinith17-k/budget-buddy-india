import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || "default";
    const amount = Number(body.amount);
    const type = body.type || "expense";
    const description = String(body.description || "Transaction");
    const category = String(body.category || "Other");
    const dateStr = body.transaction_date || new Date().toISOString().split("T")[0];

    const store = getStore();
    const txn = {
      id: store.nextId++,
      user_id: userId,
      type,
      amount,
      description,
      category,
      transaction_date: dateStr,
      source: (body.source || "manual") as any,
      created_at: new Date().toISOString(),
    };
    store.transactions.unshift(txn);

    return NextResponse.json({ id: txn.id, status: "saved" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
