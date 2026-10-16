export interface Profile {
  user_id: string;
  display_name: string;
  monthly_income: number;
  income_day: number;
  min_balance: number;
  xp: number;
  level: number;
  streak: number;
  quest_count: number;
  quest_done: boolean;
}

export interface Transaction {
  id: number;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
  source: "manual" | "chat" | "import";
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: string;
  category: string;
  planned_amount: number;
  period: string; // "YYYY-MM"
}

export interface Goal {
  id: number;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date?: string;
  status: "active" | "completed";
}
