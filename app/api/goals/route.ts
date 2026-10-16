import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || "default";
    const name = String(body.name);
    const targetAmount = Number(body.target_amount);
    const monthlyContribution = Number(body.monthly_contribution || 0);

    const store = getStore();
    const goal = {
      id: store.nextId++,
      user_id: userId,
      name,
      target_amount: targetAmount,
      current_amount: 0,
      monthly_contribution: monthlyContribution,
      status: "active" as const,
    };
    store.goals.push(goal);

    return NextResponse.json({ id: goal.id, status: "created", goal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
