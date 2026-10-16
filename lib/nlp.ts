/**
 * Advanced Financial NLP & Intent Parser for Indian Users
 * - Indian currency formats (₹500, 500rs, rs 500, 5k, 1.5k, 500 bucks)
 * - Indian Bank & UPI SMS parsing (HDFC, SBI, ICICI, Axis, Paytm, GPay, PhonePe)
 * - 100+ Indian merchant & category mappings
 * - 14 Financial Intents
 */

export type IntentType =
  | "LOG_EXPENSE"
  | "LOG_INCOME"
  | "CHECK_AFFORDABILITY"
  | "WHAT_IF"
  | "BUDGET_HEALTH"
  | "DAILY_SAFE_LIMIT"
  | "WEEKEND_BUDGET"
  | "FINANCIAL_AUDIT_50_30_20"
  | "FINANCIAL_EMERGENCY"
  | "GOALS_QUERY"
  | "SET_BUDGET"
  | "SAVINGS_TIPS"
  | "CONFIRM"
  | "CANCEL"
  | "UNKNOWN";

export interface ParsedInput {
  intent: IntentType;
  amount: number;
  description: string;
  category: string;
  isBankSms: boolean;
  smsBank?: string;
  smsMerchant?: string;
  scenario?: string;
}

// ── Category keyword dictionaries (Optimized for India) ──────────────────────
const CATEGORY_MAP: Record<string, string[]> = {
  Food: [
    "lunch", "dinner", "breakfast", "chai", "tea", "coffee", "snack", "samosa",
    "canteen", "mess", "biryani", "swiggy", "zomato", "groceries", "grocery",
    "milk", "bread", "vegetables", "fruits", "restaurant", "cafe", "dhaba",
    "mcdonalds", "kfc", "dominos", "pizza", "burger", "maggi", "zepto", "blinkit", "instamart"
  ],
  Transport: [
    "auto", "rickshaw", "metro", "bus", "cab", "uber", "ola", "rapido",
    "petrol", "diesel", "fuel", "train", "flight", "toll", "fastag", "parking",
    "irctc", "redbus", "scooter", "bike"
  ],
  Fun: [
    "movie", "pvr", "inox", "cinema", "netflix", "spotify", "prime", "hotstar",
    "game", "steam", "playstation", "party", "club", "concert", "drinks", "beer",
    "shopping", "myntra", "ajio", "amazon", "flipkart", "zara", "h&m"
  ],
  Housing: [
    "rent", "pg", "hostel", "maintenance", "electricity", "power", "water",
    "gas", "cylinder", "wifi", "internet", "broadband", "maid", "cook"
  ],
  Education: [
    "book", "books", "course", "tuition", "coaching", "exam", "fee", "fees",
    "college", "school", "udemy", "coursera", "stationery", "xerox", "printout"
  ],
  Healthcare: [
    "doctor", "medicine", "pharmacy", "chemist", "apollo", "1mg", "clinic",
    "hospital", "gym", "fitness", "protein", "dentist", "blood test", "therapy"
  ],
  Subscriptions: [
    "subscription", "recharge", "jio", "airtel", "vi", "youtube premium",
    "icloud", "google one", "gym membership"
  ],
  Savings: [
    "sip", "mutual fund", "fd", "rd", "gold", "stocks", "zerodha", "groww",
    "investment", "emergency fund", "ppf", "nps", "savings"
  ],
};

/**
 * Parses natural numbers and abbreviations:
 * 500, 1500, 1.5k (1500), 5k (5000), 2.5L (250000), 10,000
 */
export function extractAmount(text: string): number {
  // Check for 'k' or 'lakh/lac' notation: e.g., 5k, 1.5k, 2 lakh
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  const lMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:l|lakh|lac)\b/i);
  if (lMatch) return Math.round(parseFloat(lMatch[1]) * 100000);

  // Match currency prefix/suffix: ₹, Rs, Rs., INR or raw number
  const numMatch = text.match(/(?:(?:rs\.?|inr|₹)\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s*(?:rs\.?|inr|rupees|bucks))?/i);
  if (numMatch && numMatch[1]) {
    const cleaned = numMatch[1].replace(/,/g, "");
    const val = parseFloat(cleaned);
    if (!isNaN(val) && val > 0) return val;
  }
  return 0;
}

/**
 * Automatically parses Indian Bank SMS notifications
 * e.g. "Sent Rs.450.00 from HDFC Bank A/c 1234 to ZOMATO on 16-10-26 UPI:42901"
 * e.g. "Dear SBI User, your A/c has been debited by Rs 120.00 on 16Oct26 by transfer to AUTO"
 */
export function parseBankSms(text: string): { isSms: boolean; amount: number; merchant: string; category: string; bank: string } {
  const isDebit = /debited|spent|sent|paid|transferred|withdrawn|dr\b/i.test(text);
  const isBank = /bank|a\/c|acct|upi|imps|neft|vpa|ref\s*no/i.test(text);

  if (!isDebit || !isBank) {
    return { isSms: false, amount: 0, merchant: "", category: "Other", bank: "" };
  }

  // Detect bank
  let bank = "Bank";
  if (/hdfc/i.test(text)) bank = "HDFC Bank";
  else if (/sbi/i.test(text)) bank = "SBI";
  else if (/icici/i.test(text)) bank = "ICICI Bank";
  else if (/axis/i.test(text)) bank = "Axis Bank";
  else if (/kotak/i.test(text)) bank = "Kotak";
  else if (/paytm/i.test(text)) bank = "Paytm Bank";

  // Extract amount
  const amtMatch = text.match(/(?:rs\.?|inr|debited by|spent)\s*[:.]?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  const amount = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, "")) : extractAmount(text);

  // Extract merchant/recipient: e.g. "to SWIGGY", "to VPA swiggy@icici", "at STARBUCKS"
  let merchant = "Payment";
  const toMatch = text.match(/(?:to|at|info\/|vpa)\s+([a-zA-Z0-9_\-\s]{2,20})(?:\s+on|\s+ref|\s+upi|\s+a\/c|\.|$)/i);
  if (toMatch && toMatch[1]) {
    merchant = toMatch[1].trim();
  }

  const category = resolveCategory(merchant + " " + text);

  return { isSms: true, amount, merchant, category, bank };
}

/**
 * Resolves a text string to one of the canonical categories
 */
export function resolveCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return category;
      }
    }
  }
  return "Other";
}

/**
 * Master parser: Takes any user message and determines the exact intent,
 * arguments, and financial context.
 */
export function parseFinancialInput(message: string): ParsedInput {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // 1. Bank SMS check
  const sms = parseBankSms(trimmed);
  if (sms.isSms && sms.amount > 0) {
    return {
      intent: "LOG_EXPENSE",
      amount: sms.amount,
      description: sms.merchant,
      category: sms.category,
      isBankSms: true,
      smsBank: sms.bank,
      smsMerchant: sms.merchant,
    };
  }

  // 2. Affirmations / Confirmations
  if (/^(yes|yep|yeah|confirm|ok|okay|save|save it|proceed|done)$/i.test(trimmed)) {
    return { intent: "CONFIRM", amount: 0, description: "", category: "", isBankSms: false };
  }

  // 3. Cancellations
  if (/^(no|nope|cancel|stop|dont save|dismiss)$/i.test(trimmed)) {
    return { intent: "CANCEL", amount: 0, description: "", category: "", isBankSms: false };
  }

  // 4. Financial Emergency
  if (/emergency|lost job|broke|shortfall|no money left|out of money|help me survive/.test(lower)) {
    const amt = extractAmount(lower);
    return { intent: "FINANCIAL_EMERGENCY", amount: amt, description: "Emergency triage", category: "Other", isBankSms: false };
  }

  // 5. Daily / Today's Safe Spend
  if (/daily limit|daily safe|how much can i spend today|today('s)? budget|safe to spend today/.test(lower)) {
    return { intent: "DAILY_SAFE_LIMIT", amount: 0, description: "", category: "", isBankSms: false };
  }

  // 6. Weekend Budget
  if (/weekend|saturday|sunday|friday night|party budget/.test(lower) && !/spent|paid/.test(lower)) {
    return { intent: "WEEKEND_BUDGET", amount: 0, description: "", category: "", isBankSms: false };
  }

  // 7. 50/30/20 Financial Health Audit
  if (/50[\s/-]?30[\s/-]?20|audit|financial checkup|budget review|how healthy is my budget|breakdown/.test(lower)) {
    return { intent: "FINANCIAL_AUDIT_50_30_20", amount: 0, description: "", category: "", isBankSms: false };
  }

  // 8. Savings Tips & Coaching
  if (/how to save|tips to save|reduce expenses|save money on food|reduce food/.test(lower)) {
    return { intent: "SAVINGS_TIPS", amount: 0, description: "", category: resolveCategory(lower), isBankSms: false };
  }

  // 9. Affordability Check
  if (/(can i afford|should i buy|can i buy|can i spend|is it safe to buy)/.test(lower)) {
    const amount = extractAmount(lower);
    const desc = lower
      .replace(/can i afford|should i buy|can i buy|can i spend|is it safe to buy|for|₹|rs\.?/gi, "")
      .replace(/\d[\d,]*/g, "")
      .trim() || "Item";
    return { intent: "CHECK_AFFORDABILITY", amount, description: desc, category: resolveCategory(desc), isBankSms: false };
  }

  // 10. What-If Simulator
  if (/what if|what-if|if i save|if i reduce|if i spend extra/.test(lower)) {
    const amount = extractAmount(lower) || 500;
    return { intent: "WHAT_IF", amount, description: "", category: "", scenario: trimmed, isBankSms: false };
  }

  // 11. Goals Query
  if (/goal|goals|target|laptop|iphone|bike|car/.test(lower) && !/spent|paid|buy|afford/.test(lower)) {
    return { intent: "GOALS_QUERY", amount: 0, description: "", category: "", isBankSms: false };
  }

  // 12. Income Logging
  if (/received|got salary|credited|got paid|freelance|pocket money|stipend|cashback/.test(lower)) {
    const amount = extractAmount(lower);
    let desc = trimmed.replace(/^(i\s+)?(received|got|credited|earned)\s*/i, "").slice(0, 40);
    if (!desc) desc = "Income";
    return { intent: "LOG_INCOME", amount, description: desc, category: "Income", isBankSms: false };
  }

  // 13. Budget Status
  if (/budget|status|how am i doing|left to spend|overview/.test(lower)) {
    return { intent: "BUDGET_HEALTH", amount: 0, description: "", category: "", isBankSms: false };
  }

  // 14. Expense Logging (Default action when spent/paid keywords or amount + noun are detected)
  const amount = extractAmount(lower);
  if (amount > 0 && (/spent|paid|bought|spend|had|ordered|recharge|billed|cost/.test(lower) || /₹|rs/i.test(lower))) {
    let cleanDesc = trimmed
      .replace(/^(i\s+)?(spent|paid|bought|spend|had|ordered|recharge)\s*(?:rs\.?|inr|₹)?\s*[\d,kL]*\s*(?:on|for)?\s*/i, "")
      .trim();
    if (!cleanDesc) cleanDesc = "Expense";
    const category = resolveCategory(cleanDesc || trimmed);

    return {
      intent: "LOG_EXPENSE",
      amount,
      description: cleanDesc.slice(0, 40),
      category,
      isBankSms: false,
    };
  }

  return { intent: "UNKNOWN", amount: 0, description: "", category: "", isBankSms: false };
}
