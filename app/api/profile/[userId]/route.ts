import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/store";
import * as fin from "@/lib/finance";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const profile = getProfile(userId);
  const bal = fin.getBalance(userId);

  return NextResponse.json({
    user_id: profile.user_id,
    display_name: profile.display_name,
    monthly_income: profile.monthly_income,
    income_day: profile.income_day,
    min_balance: profile.min_balance,
    xp: profile.xp,
    level: profile.level,
    streak: profile.streak,
    quest_count: profile.quest_count,
    quest_done: profile.quest_done,
    balance: bal,
  });
}
