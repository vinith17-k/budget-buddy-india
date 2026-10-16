import { NextRequest, NextResponse } from "next/server";
import { getStore, getProfile } from "@/lib/store";
import * as fin from "@/lib/finance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || "default";
    const amount = Number(body.amount);
    const description = String(body.description || "Expense");
    const category = String(body.category || "Other");

    const store = getStore();
    const profile = getProfile(userId);

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    const txn = {
      id: store.nextId++,
      user_id: userId,
      type: "expense" as const,
      amount,
      description,
      category,
      transaction_date: dateStr,
      source: "chat" as const,
      created_at: now.toISOString(),
    };
    store.transactions.unshift(txn);

    profile.xp += 10;
    profile.quest_count = Math.min(profile.quest_count + 1, 3);
    const questComplete = profile.quest_count >= 3 && !profile.quest_done;
    if (questComplete) {
      profile.xp += 50;
      profile.quest_done = true;
    }

    while (profile.xp >= 500) {
      profile.xp -= 500;
      profile.level += 1;
    }

    const bal = fin.getBalance(userId);
    const budgetStatus = fin.getBudgetStatus(userId);
    const catStatus = budgetStatus[category];

    return NextResponse.json({
      status: "saved",
      balance: bal,
      category_status: catStatus,
      quest_complete: questComplete,
      profile: {
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        quest_count: profile.quest_count,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
