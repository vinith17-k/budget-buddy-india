import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import * as fin from "@/lib/finance";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const status = fin.getBudgetStatus(userId);
  return NextResponse.json(status);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await req.json();
  const category = body.category;
  const plannedAmount = Number(body.planned_amount);
  const period = fin.currentPeriod();

  const store = getStore();
  const existing = store.budgets.find(
    (b) => b.user_id === userId && b.category === category && b.period === period
  );

  if (existing) {
    existing.planned_amount = plannedAmount;
  } else {
    store.budgets.push({
      id: store.nextId++,
      user_id: userId,
      category,
      planned_amount: plannedAmount,
      period,
    });
  }

  return NextResponse.json({ status: "saved", category, planned_amount: plannedAmount });
}
