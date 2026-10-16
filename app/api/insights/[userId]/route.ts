import { NextRequest, NextResponse } from "next/server";
import * as fin from "@/lib/finance";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const insights = fin.getSpendingInsights(userId);
  return NextResponse.json(insights);
}
