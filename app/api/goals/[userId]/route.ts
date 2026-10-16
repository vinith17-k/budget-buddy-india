import { NextRequest, NextResponse } from "next/server";
import * as fin from "@/lib/finance";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const goals = fin.getGoalsProgress(userId);
  return NextResponse.json(goals);
}
