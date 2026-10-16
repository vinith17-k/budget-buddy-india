import { getStore, getProfile } from "./store";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Fun",
  "Housing",
  "Education",
  "Healthcare",
  "Savings",
  "Subscriptions",
  "Other",
];

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function daysRemainingInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

export function daysSinceStartOfMonth(): number {
  return new Date().getDate();
}

export function getBalance(userId: string) {
  const store = getStore();
  const profile = getProfile(userId);
  const period = currentPeriod();

  const userTxns = store.transactions.filter(
    (t) => t.user_id === userId && t.transaction_date.startsWith(period)
  );

  const totalIncome = userTxns
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = userTxns
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const minBal = profile.min_balance ?? 500;
  const daysLeft = daysRemainingInMonth();

  return {
    balance: Math.round(balance),
    total_income: Math.round(totalIncome),
    total_expense: Math.round(totalExpense),
    min_balance: minBal,
    days_remaining: daysLeft,
    safe_to_spend: Math.max(0, Math.round(balance - minBal)),
  };
}

export function getBudgetStatus(userId: string) {
  const store = getStore();
  const period = currentPeriod();
  const budgets = store.budgets.filter((b) => b.user_id === userId && b.period === period);
  const userExpenses = store.transactions.filter(
    (t) => t.user_id === userId && t.type === "expense" && t.transaction_date.startsWith(period)
  );

  const result: Record<
    string,
    { planned: number; spent: number; remaining: number; pct: number; over_budget: boolean }
  > = {};

  for (const b of budgets) {
    const spent = userExpenses
      .filter((t) => t.category === b.category)
      .reduce((acc, t) => acc + t.amount, 0);
    const pct = b.planned_amount > 0 ? Math.round((spent / b.planned_amount) * 100) : 0;
    result[b.category] = {
      planned: b.planned_amount,
      spent: Math.round(spent),
      remaining: Math.round(b.planned_amount - spent),
      pct,
      over_budget: spent > b.planned_amount,
    };
  }

  // Any unbudgeted categories that have expenses
  for (const t of userExpenses) {
    if (!result[t.category]) {
      result[t.category] = {
        planned: 0,
        spent: Math.round(t.amount),
        remaining: 0,
        pct: 0,
        over_budget: false,
      };
    }
  }

  return result;
}

export function checkAffordability(userId: string, amount: number) {
  const bal = getBalance(userId);
  const safe = bal.safe_to_spend;
  const verdict = amount <= safe * 0.6 ? "Safe" : amount <= safe ? "Risky" : "Wait";

  let tip = "";
  if (verdict === "Safe") {
    tip = `You can comfortably afford ₹${amount.toLocaleString("en-IN")} and still cover your essentials.`;
  } else if (verdict === "Risky") {
    tip = `You can technically afford it, but it uses most of your safe spending room. Consider a cheaper alternative.`;
  } else {
    const over = amount - safe;
    tip = `This is ₹${over.toLocaleString("en-IN")} over your safe limit. It's safer to postpone or save first.`;
  }

  return {
    amount,
    balance: bal.balance,
    safe_to_spend: safe,
    min_balance: bal.min_balance,
    verdict,
    tip,
  };
}

export function runWhatIf(userId: string, scenario: string, amount: number) {
  const store = getStore();
  const goals = store.goals.filter((g) => g.user_id === userId && g.status === "active");
  const results = [];

  for (const g of goals) {
    const remaining = g.target_amount - g.current_amount;
    if (remaining <= 0) continue;
    const currentMonthly = g.monthly_contribution || 2000;
    const monthsNow = Math.ceil(remaining / currentMonthly);
    const newMonthly = currentMonthly + amount;
    const monthsNew = Math.ceil(remaining / newMonthly);
    results.push({
      goal: g.name,
      target: g.target_amount,
      remaining,
      current_monthly: currentMonthly,
      new_monthly: newMonthly,
      months_now: monthsNow,
      months_new: monthsNew,
      months_saved: monthsNow - monthsNew,
    });
  }

  if (results.length === 0) {
    results.push({
      goal: "General savings",
      note: `If you save ₹${amount.toLocaleString("en-IN")} more per month, you will accumulate ₹${(amount * 12).toLocaleString("en-IN")} extra in one year.`,
      amount,
      annual_impact: amount * 12,
    });
  }

  return { scenario, amount, results };
}

export function getSpendingInsights(userId: string) {
  const store = getStore();
  const period = currentPeriod();
  const userExpenses = store.transactions.filter(
    (t) => t.user_id === userId && t.type === "expense" && t.transaction_date.startsWith(period)
  );

  const byCat: Record<string, { count: number; total: number; avg: number }> = {};
  for (const t of userExpenses) {
    if (!byCat[t.category]) {
      byCat[t.category] = { count: 0, total: 0, avg: 0 };
    }
    byCat[t.category].count += 1;
    byCat[t.category].total += t.amount;
  }

  for (const cat of Object.keys(byCat)) {
    byCat[cat].total = Math.round(byCat[cat].total);
    byCat[cat].avg = Math.round(byCat[cat].total / byCat[cat].count);
  }

  const daysElapsed = Math.max(1, daysSinceStartOfMonth());
  const daysRemaining = daysRemainingInMonth();
  const totalSpent = userExpenses.reduce((acc, t) => acc + t.amount, 0);
  const dailyAvg = Math.round(totalSpent / daysElapsed);
  const forecastMonthEnd = Math.round(totalSpent + dailyAvg * daysRemaining);
  const hotCategories = Object.entries(byCat)
    .filter(([, v]) => v.total > 2000)
    .map(([k]) => k);

  return {
    period,
    total_spent: Math.round(totalSpent),
    by_category: byCat,
    daily_avg: dailyAvg,
    forecast_month_end: forecastMonthEnd,
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
    hot_categories: hotCategories,
  };
}

export function getGoalsProgress(userId: string) {
  const store = getStore();
  const goals = store.goals.filter((g) => g.user_id === userId);
  return goals.map((g) => {
    const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
    const remaining = g.target_amount - g.current_amount;
    const monthsToGoal =
      g.monthly_contribution > 0 ? Math.ceil(remaining / g.monthly_contribution) : null;
    return {
      id: g.id,
      name: g.name,
      target: g.target_amount,
      current: g.current_amount,
      remaining,
      pct,
      monthly_contribution: g.monthly_contribution,
      months_to_goal: monthsToGoal,
      target_date: g.target_date,
    };
  });
}

export function categorizeFromText(text: string): string {
  const t = text.toLowerCase();
  if (
    /lunch|dinner|food|chai|tea|snack|coffee|canteen|mess|biryani|swiggy|zomato|grocery|milk|bread|restaurant/.test(
      t
    )
  )
    return "Food";
  if (/bus|auto|metro|cab|uber|petrol|train|ola|fuel|toll|rapido/.test(t)) return "Transport";
  if (/movie|game|netflix|party|spotify|concert|hotstar|youtube/.test(t)) return "Fun";
  if (/rent|pg|hostel|electricity|water|wifi|internet|maintenance/.test(t)) return "Housing";
  if (/book|course|tuition|college|school|exam|udemy/.test(t)) return "Education";
  if (/doctor|medicine|pharmacy|hospital|clinic|health|gym/.test(t)) return "Healthcare";
  if (/savings|fd|emi|loan|investment|sip|mutual fund/.test(t)) return "Savings";
  return "Other";
}
