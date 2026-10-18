import { NextRequest, NextResponse } from "next/server";
import { getStore, initStore } from "@/lib/store";

// Helper to seed a realistic starter profile for a new user
export async function POST(req: NextRequest) {
  try {
    const { userId, displayName, monthlyIncome, fixedExpenses } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const store = getStore();
    const income = Number(monthlyIncome) || 30000;
    const name = displayName?.trim() || "User";

    const d = new Date();
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    // Create / overwrite user profile
    store.profiles[userId] = {
      user_id: userId,
      display_name: name,
      monthly_income: income,
      income_day: 1,
      min_balance: 1000,
      xp: 150,
      level: 2,
      streak: 3,
      quest_count: 0,
      quest_done: false,
    };

    // Remove existing seed transactions for this user if any
    store.transactions = store.transactions.filter((t) => t.user_id !== userId);

    // Initial salary transaction
    store.transactions.push({
      id: store.nextId++,
      user_id: userId,
      type: "income",
      amount: income,
      description: "Monthly Salary / Income",
      category: "Income",
      transaction_date: `${period}-01`,
      source: "manual",
      created_at: new Date().toISOString(),
    });

    // Add fixed expense if specified
    if (fixedExpenses && Number(fixedExpenses) > 0) {
      store.transactions.push({
        id: store.nextId++,
        user_id: userId,
        type: "expense",
        amount: Number(fixedExpenses),
        description: "Fixed Commitments (Rent / Bills)",
        category: "Housing",
        transaction_date: `${period}-02`,
        source: "manual",
        created_at: new Date().toISOString(),
      });
    }

    // Default 50/30/20 inspired budgets
    store.budgets = store.budgets.filter((b) => b.user_id !== userId);
    store.budgets.push(
      { id: store.nextId++, user_id: userId, category: "Food", planned_amount: Math.round(income * 0.15), period },
      { id: store.nextId++, user_id: userId, category: "Transport", planned_amount: Math.round(income * 0.08), period },
      { id: store.nextId++, user_id: userId, category: "Fun", planned_amount: Math.round(income * 0.10), period },
      { id: store.nextId++, user_id: userId, category: "Housing", planned_amount: Math.round(income * 0.25), period },
      { id: store.nextId++, user_id: userId, category: "Other", planned_amount: Math.round(income * 0.07), period }
    );

    // Default goal
    store.goals = store.goals.filter((g) => g.user_id !== userId);
    store.goals.push({
      id: store.nextId++,
      user_id: userId,
      name: "Emergency Fund",
      target_amount: income * 3,
      current_amount: Math.round(income * 0.5),
      monthly_contribution: Math.round(income * 0.15),
      status: "active",
    });

    return NextResponse.json({
      success: true,
      profile: store.profiles[userId],
      store,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
