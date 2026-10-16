import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import * as fin from "./finance";
import { getProfile } from "./store";
import { parseFinancialInput } from "./nlp";
import { processRuleBasedAI, AIResponse } from "./ruleEngine";

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

export function executeTool(name: string, args: any, userId: string): any {
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

export async function chat(message: string, history: any[], userId: string): Promise<AIResponse> {
  // First, run our advanced NLP parser
  const parsed = parseFinancialInput(message);

  const apiKey = process.env.GEMINI_API_KEY;
  const isPlaceholderKey =
    !apiKey ||
    apiKey === "YOUR_GEMINI_API_KEY_HERE" ||
    apiKey === "your_gemini_api_key_here";

  // If no Gemini key OR if it's an actionable domain intent (SMS, expense, math, audit),
  // our deterministic rule engine provides exact, instant, un-hallucinated results!
  if (isPlaceholderKey || parsed.intent !== "UNKNOWN") {
    return processRuleBasedAI(parsed, userId, message);
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
    const functionCalls =
      candidate?.content?.parts
        ?.filter((p: any) => p.functionCall)
        ?.map((p: any) => p.functionCall) || [];

    const profile = getProfile(userId);
    let pending: any = null;
    const toolCalls: any[] = [];
    let xpGained = 0;
    let levelUp = false;

    if (functionCalls.length > 0) {
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

      const textParts =
        candidate?.content?.parts
          ?.filter((p: any) => p.text)
          ?.map((p: any) => p.text)
          .join("\n") || "";

      const reply =
        textParts ||
        (pending
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
    // If Gemini API fails or quota exceeded, seamlessly fall back to local rule engine
    return processRuleBasedAI(parsed, userId, message);
  }
}
