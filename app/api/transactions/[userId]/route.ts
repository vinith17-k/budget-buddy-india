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
