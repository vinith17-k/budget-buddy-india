import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import * as fin from "./finance";
import { getProfile, getStore } from "./store";

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "log_expense",
    description: "Log a new expense transaction after extracting amount, description, and category. Returns a pending confirmation card.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Amount in INR" },
        description: { type: Type.STRING, description: "Description of expense" },
        category: { type: Type.STRING, description: "Category of expense" },
      },
      required: ["amount", "description", "category"],
    },
  },
  {
    name: "check_affordability",
    description: "Check whether the user can afford a specific purchase amount right now.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Purchase amount in INR" },
      },
      required: ["amount"],
    },
  },
  {
    name: "get_budget_status",
    description: "Get the current month's budget status by category.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "get_spending_insights",
    description: "Get spending insights, daily average, and forecast.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "run_whatif",
    description: "Simulate a what-if financial scenario.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        scenario: { type: Type.STRING, description: "Scenario description" },
        amount: { type: Type.NUMBER, description: "Relevant amount" },
      },
      required: ["scenario", "amount"],
    },
  },
  {
    name: "get_goals",
    description: "Get current savings goals and progress.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

const SYSTEM_PROMPT = `You are Budget Coach — an encouraging, non-judgmental, practical personal finance assistant for Indian users (students, freshers, professionals).

RULES:
1. Always use tools to fetch data or prepare an expense entry.
2. All numbers must come strictly from tool results — never hallucinate or invent balances.
3. For expenses: call log_expense with the amount, description, and category.
4. Keep answers brief, clear, and friendly. Use ₹ symbol for Indian rupees.`;

function checkLevelUp(profile: any): boolean {
  let up = false;
  while (profile.xp >= 500) {
    profile.xp -= 500;
    profile.level += 1;
    up = true;
  }
  return up;
}

export function executeTool(name: string, args: any, userId: string) {
  if (name === "get_balance") {
    return fin.getBalance(userId);
  }
  if (name === "check_affordability") {
    return fin.checkAffordability(userId, Number(args.amount));
  }
  if (name === "get_budget_status") {
    return fin.getBudgetStatus(userId);
  }
  if (name === "get_spending_insights") {
    return fin.getSpendingInsights(userId);
  }
  if (name === "run_whatif") {
    return fin.runWhatIf(userId, args.scenario || "scenario", Number(args.amount) || 500);
  }
  if (name === "get_goals") {
    return fin.getGoalsProgress(userId);
  }
  if (name === "log_expense") {
    return {
      status: "pending_confirmation",
      amount: Number(args.amount),
      description: String(args.description),
      category: String(args.category),
      type: "expense",
    };
  }
  return { error: `Unknown tool: ${name}` };
}

export function offlineChat(message: string, userId: string) {
  const profile = getProfile(userId);
  const msgLower = message.toLowerCase();

  // Extract number
  const numMatch = message.match(/(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)/i);
  const num = numMatch ? parseFloat(numMatch[1].replace(/,/g, "")) : 0;

  let reply = "";
  let pending: any = null;
  const toolCalls: any[] = [];
  let xpGained = 0;
  let levelUp = false;

  // 1. Affordability
  if (/afford|can i buy|should i buy/.test(msgLower) && num > 0) {
    const res = fin.checkAffordability(userId, num);
    toolCalls.push({ tool: "check_affordability", args: { amount: num }, result: res });
    reply = `Here is your affordability check for <b>₹${num.toLocaleString("en-IN")}</b>:<br><br>
• Current balance: <b>₹${res.balance.toLocaleString("en-IN")}</b><br>
• Safe to spend: <b>₹${res.safe_to_spend.toLocaleString("en-IN")}</b> (holding ₹${res.min_balance.toLocaleString("en-IN")} reserve)<br><br>
<b>Verdict: ${res.verdict}</b> — ${res.tip}`;
  }
  // 2. What-if
  else if (/what if|what-if|save more|extra/.test(msgLower)) {
    const simAmt = num > 0 ? num : 500;
    const res = fin.runWhatIf(userId, message, simAmt);
    toolCalls.push({ tool: "run_whatif", args: { scenario: message, amount: simAmt }, result: res });
    const items = res.results.map((r: any) => {
      if (r.goal && r.months_saved !== undefined) {
        return `• <b>${r.goal}</b>: At ₹${r.new_monthly.toLocaleString("en-IN")}/mo instead of ₹${r.current_monthly.toLocaleString("en-IN")}/mo, you hit your goal in <b>${r.months_new} months</b> (${r.months_saved} months sooner!).`;
      }
      return `• ${r.note}`;
    });
    reply = `Here is the what-if simulation for saving ₹${simAmt.toLocaleString("en-IN")} more:<br><br>${items.join("<br>")}`;
  }
  // 3. Log expense
  else if (/spent|paid|bought|spend/.test(msgLower) && num > 0) {
    let desc = message.replace(/^(i\s+)?(spent|paid|bought|spend)\s*(rs\.?|₹)?\s*[\d,]*\s*(on|for)?\s*/i, "").trim();
    if (!desc) desc = "Expense";
    const category = fin.categorizeFromText(desc);
    pending = {
      status: "pending_confirmation",
      amount: num,
      description: desc.slice(0, 40),
      category,
      type: "expense",
    };
    toolCalls.push({ tool: "log_expense", args: pending, result: pending });
    profile.xp += 10;
    xpGained += 10;
    profile.quest_count = Math.min(profile.quest_count + 1, 3);
    if (checkLevelUp(profile)) levelUp = true;
    reply = `Got it! I detected <b>₹${num.toLocaleString("en-IN")}</b> for <i>${desc}</i> in <b>${category}</b>. Please confirm the entry card below:`;
  }
  // 4. Budget
  else if (/budget|status|health|how am i|how is/.test(msgLower)) {
    const bRes = fin.getBudgetStatus(userId);
    const bal = fin.getBalance(userId);
    toolCalls.push({ tool: "get_budget_status", args: {}, result: bRes });
    const lines = [`You have <b>₹${bal.balance.toLocaleString("en-IN")}</b> left with <b>${bal.days_remaining} days</b> remaining this month.<br>`];
    for (const [cat, d] of Object.entries(bRes)) {
      lines.push(`• <b>${cat}</b>: ₹${d.spent.toLocaleString("en-IN")} / ₹${d.planned.toLocaleString("en-IN")} (${d.pct}%)`);
    }
    reply = lines.join("<br>");
  }
  // 5. Goals
  else if (/goal|goals|save for/.test(msgLower)) {
    const gRes = fin.getGoalsProgress(userId);
    toolCalls.push({ tool: "get_goals", args: {}, result: gRes });
    if (gRes.length === 0) {
      reply = "You don't have any active savings goals yet. You can create one from the Goals tab or ask me: <i>'I want to save ₹40,000 for a laptop'</i>.";
    } else {
      const lines = ["Here are your active savings goals:"];
      for (const g of gRes) {
        lines.push(`• <b>${g.name}</b>: ₹${g.current.toLocaleString("en-IN")} / ₹${g.target.toLocaleString("en-IN")} (${g.pct}%) · ~${g.months_to_goal} months left.`);
      }
      reply = lines.join("<br>");
    }
  }
  // 6. Insights
  else if (/insight|insights|forecast|pattern|trend/.test(msgLower)) {
    const ins = fin.getSpendingInsights(userId);
    toolCalls.push({ tool: "get_spending_insights", args: {}, result: ins });
    reply = `Here are your spending insights for ${ins.period}:<br><br>
• Total spent so far: <b>₹${ins.total_spent.toLocaleString("en-IN")}</b><br>
• Daily average spend: <b>₹${ins.daily_avg.toLocaleString("en-IN")}/day</b><br>
• Projected month-end spend: <b>₹${ins.forecast_month_end.toLocaleString("en-IN")}</b><br>
• Days remaining: <b>${ins.days_remaining} days</b>`;
  } else {
    reply = `I'm here to help you manage your money! You can try:<br>
• <i>'I spent ₹150 on lunch'</i> to log an expense<br>
• <i>'Can I afford ₹1,000?'</i> to check affordability<br>
• <i>'What if I save ₹500 more?'</i> to simulate your goals<br>
• <i>'How is my budget?'</i> to check category health`;
  }

  return {
    reply,
    pending,
    tool_calls: toolCalls,
    xp_gained: xpGained,
    level_up: levelUp,
    profile: {
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      quest_count: profile.quest_count,
    },
  };
}

export async function chat(message: string, history: any[], userId: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const isPlaceholderKey =
    !apiKey ||
    apiKey === "YOUR_GEMINI_API_KEY_HERE" ||
    apiKey === "your_gemini_api_key_here";

  if (isPlaceholderKey) {
    return offlineChat(message, userId);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format chat history
    const contents: any[] = [];
    for (const h of history.slice(-10)) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      },
    });

    const candidate = response.candidates?.[0];
    const functionCalls = candidate?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall) || [];

    const profile = getProfile(userId);
    let pending: any = null;
    const toolCalls: any[] = [];
    let xpGained = 0;
    let levelUp = false;

    if (functionCalls.length > 0) {
      // Execute each function call
      for (const fc of functionCalls) {
        const res: any = executeTool(fc.name, fc.args, userId);
        toolCalls.push({ tool: fc.name, args: fc.args, result: res });

        if (fc.name === "log_expense" && res?.status === "pending_confirmation") {
          pending = res;
          profile.xp += 10;
          xpGained += 10;
          profile.quest_count = Math.min(profile.quest_count + 1, 3);
          if (checkLevelUp(profile)) levelUp = true;
        }
      }

      // If we got a function call, return deterministic response or second turn text
      const textParts = candidate?.content?.parts?.filter((p: any) => p.text)?.map((p: any) => p.text).join("\n") || "";
      const reply = textParts || (pending
        ? `Got it! I prepared the entry for <b>₹${pending.amount.toLocaleString("en-IN")}</b> (${pending.description}). Please confirm below:`
        : `Processed your request successfully.`);

      return {
        reply,
        pending,
        tool_calls: toolCalls,
        xp_gained: xpGained,
        level_up: levelUp,
        profile: {
          xp: profile.xp,
          level: profile.level,
          streak: profile.streak,
          quest_count: profile.quest_count,
        },
      };
    }

    const reply = response.text || "I'm here to help with your finances!";
    return {
      reply,
      pending: null,
      tool_calls: [],
      xp_gained: 0,
      level_up: false,
      profile: {
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        quest_count: profile.quest_count,
      },
    };
  } catch {
    // If Gemini API fails or quota exceeded, seamlessly fall back to local engine
    return offlineChat(message, userId);
  }
}
