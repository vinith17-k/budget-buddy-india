"""
Gemini AI agent with tool calling and deterministic fallback.
Uses google-genai (new SDK).
Numbers always come from deterministic finance.py — the model only explains results.
"""
import os
import re
import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from datetime import date
from database import Transaction, Budget, Goal, Profile, get_or_create_profile
import finance as fin

# ─── Tool definitions ─────────────────────────────────────────────────────────

TOOLS = [
    types.Tool(function_declarations=[
        types.FunctionDeclaration(
            name="log_expense",
            description=(
                "Log a new expense transaction after parsing amount, description, and category "
                "from the user's message. Returns a confirmation object."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "amount": types.Schema(type=types.Type.NUMBER, description="Amount in INR"),
                    "description": types.Schema(type=types.Type.STRING, description="Short description"),
                    "category": types.Schema(
                        type=types.Type.STRING,
                        enum=fin.CATEGORIES,
                        description="Spending category",
                    ),
                },
                required=["amount", "description", "category"],
            ),
        ),
        types.FunctionDeclaration(
            name="log_income",
            description="Log an income transaction (salary, freelance, pocket money etc.)",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "amount": types.Schema(type=types.Type.NUMBER, description="Amount in INR"),
                    "description": types.Schema(type=types.Type.STRING, description="Source of income"),
                },
                required=["amount", "description"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_balance",
            description="Get the user's current balance, income, expenses, and safe-to-spend for this month.",
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="check_affordability",
            description="Check whether the user can afford a specific purchase amount right now.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "amount": types.Schema(type=types.Type.NUMBER, description="Purchase amount in INR"),
                },
                required=["amount"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_budget_status",
            description="Get current month's budget status by category — planned vs spent.",
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="get_spending_insights",
            description="Get spending patterns, daily average, month-end forecast, and hot categories.",
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="run_whatif",
            description="Simulate a what-if financial scenario, e.g. 'What if I save ₹500 more?'",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "scenario": types.Schema(type=types.Type.STRING, description="Scenario description"),
                    "amount": types.Schema(type=types.Type.NUMBER, description="Relevant amount"),
                },
                required=["scenario", "amount"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_goals",
            description="Get the user's savings goals and their progress.",
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="create_goal",
            description="Create a new savings goal for the user.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "name": types.Schema(type=types.Type.STRING, description="Goal name e.g. Laptop"),
                    "target_amount": types.Schema(type=types.Type.NUMBER, description="Target in INR"),
                    "monthly_contribution": types.Schema(type=types.Type.NUMBER, description="Monthly savings"),
                    "target_date": types.Schema(type=types.Type.STRING, description="Target date YYYY-MM-DD (optional)"),
                },
                required=["name", "target_amount", "monthly_contribution"],
            ),
        ),
        types.FunctionDeclaration(
            name="set_budget",
            description="Set or update a monthly budget limit for a category.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "category": types.Schema(type=types.Type.STRING, enum=fin.CATEGORIES),
                    "amount": types.Schema(type=types.Type.NUMBER, description="Monthly budget in INR"),
                },
                required=["category", "amount"],
            ),
        ),
        types.FunctionDeclaration(
            name="update_profile",
            description="Update user profile — name, income, income day, or minimum balance.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "display_name": types.Schema(type=types.Type.STRING),
                    "monthly_income": types.Schema(type=types.Type.NUMBER),
                    "income_day": types.Schema(type=types.Type.INTEGER),
                    "min_balance": types.Schema(type=types.Type.NUMBER),
                },
            ),
        ),
    ])
]

SYSTEM_PROMPT = """You are Budget Coach — a warm, honest, and practical AI financial assistant for Indian users (students, freshers, working professionals).

RULES:
1. ALL financial numbers (balances, totals, percentages, forecasts) MUST come from tool results. Never invent figures.
2. Use tools to fetch data before answering financial questions.
3. For expense logging: parse the message, pick a category, call log_expense, then present the result for user confirmation.
4. Keep responses concise and friendly. Use ₹ symbol for Indian rupees.
5. When forecasting, clearly state it's an estimate based on current spending rate.
6. Never shame users. Never recommend skipping food, healthcare, or essential needs.
7. For ambiguous queries, ask a clarifying question rather than guessing.

PERSONALITY: Encouraging, non-judgmental. Like a knowledgeable friend who happens to know finance.
"""


def execute_tool(tool_name: str, args: dict, db: Session, user_id: str) -> dict:
    """Execute a tool call and return structured data."""
    if tool_name == "get_balance":
        return fin.get_balance(db, user_id)

    elif tool_name == "check_affordability":
        return fin.check_affordability(db, user_id, args["amount"])

    elif tool_name == "get_budget_status":
        return fin.get_budget_status(db, user_id)

    elif tool_name == "get_spending_insights":
        return fin.get_spending_insights(db, user_id)

    elif tool_name == "run_whatif":
        return fin.run_whatif(db, user_id, args["scenario"], args["amount"])

    elif tool_name == "get_goals":
        return fin.get_goal_progress(db, user_id)

    elif tool_name == "log_expense":
        return {
            "status": "pending_confirmation",
            "amount": args["amount"],
            "description": args["description"],
            "category": args["category"],
            "type": "expense",
        }

    elif tool_name == "log_income":
        txn = Transaction(
            user_id=user_id,
            type="income",
            amount=args["amount"],
            description=args["description"],
            category="Income",
            transaction_date=date.today().isoformat(),
            source="chat",
        )
        db.add(txn)
        profile = get_or_create_profile(db, user_id)
        profile.xp += 5
        _check_level_up(profile)
        db.commit()
        return {"status": "saved", "amount": args["amount"], "description": args["description"], "type": "income"}

    elif tool_name == "create_goal":
        goal = Goal(
            user_id=user_id,
            name=args["name"],
            target_amount=args["target_amount"],
            monthly_contribution=args.get("monthly_contribution", 0),
            target_date=args.get("target_date", ""),
            status="active",
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)
        return {"status": "created", "goal_id": goal.id, "name": goal.name, "target": goal.target_amount}

    elif tool_name == "set_budget":
        period = fin.current_period()
        existing = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.category == args["category"],
            Budget.period == period,
        ).first()
        if existing:
            existing.planned_amount = args["amount"]
        else:
            db.add(Budget(user_id=user_id, category=args["category"], planned_amount=args["amount"], period=period))
        db.commit()
        return {"status": "set", "category": args["category"], "amount": args["amount"]}

    elif tool_name == "update_profile":
        profile = get_or_create_profile(db, user_id)
        for field in ["display_name", "monthly_income", "income_day", "min_balance"]:
            if field in args:
                setattr(profile, field, args[field])
        db.commit()
        return {"status": "updated", **args}

    return {"error": f"Unknown tool: {tool_name}"}


def _check_level_up(profile: Profile) -> bool:
    leveled_up = False
    while profile.xp >= 500:
        profile.xp -= 500
        profile.level += 1
        leveled_up = True
    return leveled_up


def offline_fallback(message: str, db: Session, user_id: str) -> dict:
    """
    Intelligent deterministic coach fallback when GEMINI_API_KEY is not configured
    or when API is unreachable. Executes the real finance tools directly on the DB!
    """
    msg_lower = message.lower()
    # Extract amount
    m_num = re.search(r'(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)', message, re.I)
    num = float(m_num.group(1).replace(',', '')) if m_num else 0.0

    profile = get_or_create_profile(db, user_id)
    pending_entry = None
    tool_calls_made = []
    xp_gained = 0
    level_up = False

    # 1. Affordability query
    if any(k in msg_lower for k in ["afford", "can i buy", "should i buy"]) and num > 0:
        res = fin.check_affordability(db, user_id, num)
        tool_calls_made.append({"tool": "check_affordability", "args": {"amount": num}, "result": res})
        reply = (
            f"Here is your affordability check for <b>₹{num:,.0f}</b>:<br><br>"
            f"• Current balance: <b>₹{res['balance']:,.0f}</b><br>"
            f"• Safe to spend: <b>₹{res['safe_to_spend']:,.0f}</b> (keeping ₹{res['min_balance']:,.0f} reserve)<br><br>"
            f"<b>Verdict: {res['verdict']}</b> — {res['tip']}"
        )

    # 2. What-if scenario
    elif any(k in msg_lower for k in ["what if", "what-if", "save more", "save extra", "extra"]):
        sim_amt = num if num > 0 else 500.0
        res = fin.run_whatif(db, user_id, message, sim_amt)
        tool_calls_made.append({"tool": "run_whatif", "args": {"scenario": message, "amount": sim_amt}, "result": res})
        items_html = []
        for r in res["results"]:
            if "goal" in r and "months_saved" in r:
                items_html.append(
                    f"• <b>{r['goal']}</b>: At ₹{r['new_monthly']:,.0f}/mo instead of ₹{r['current_monthly']:,.0f}/mo, "
                    f"you reach your goal in <b>{r['months_new']} months</b> ({r['months_saved']} months sooner!)."
                )
            elif "note" in r:
                items_html.append(f"• {r['note']}")
        reply = f"Here is the what-if simulation for saving ₹{sim_amt:,.0f} more:<br><br>" + "<br>".join(items_html)

    # 3. Log expense
    elif any(k in msg_lower for k in ["spent", "paid", "bought", "spend"]) and num > 0:
        desc = re.sub(r'^(i\s+)?(spent|paid|bought|spend)\s*(rs\.?|₹)?\s*[\d,]*\s*(on|for)?\s*', '', message, flags=re.IGNORECASE).strip()
        if not desc:
            desc = "Expense"
        category = fin.categorize_from_text(desc)
        pending_entry = {
            "status": "pending_confirmation",
            "amount": num,
            "description": desc[:40],
            "category": category,
            "type": "expense",
        }
        tool_calls_made.append({"tool": "log_expense", "args": pending_entry, "result": pending_entry})
        profile.xp += 10
        xp_gained += 10
        profile.quest_count = min(profile.quest_count + 1, 3)
        if _check_level_up(profile):
            level_up = True
        db.commit()
        reply = f"Got it! I detected <b>₹{num:,.0f}</b> for <i>{desc}</i> in <b>{category}</b>. Please confirm the entry card below:"

    # 4. Budget status
    elif any(k in msg_lower for k in ["budget", "status", "health", "how am i", "how is"]):
        b_res = fin.get_budget_status(db, user_id)
        bal_res = fin.get_balance(db, user_id)
        tool_calls_made.append({"tool": "get_budget_status", "args": {}, "result": b_res})
        lines = [f"You have <b>₹{bal_res['balance']:,.0f}</b> left with <b>{bal_res['days_remaining']} days</b> left this month.<br>"]
        for cat, d in b_res.items():
            lines.append(f"• <b>{cat}</b>: ₹{d['spent']:,.0f} / ₹{d['planned']:,.0f} ({d['pct']}%)")
        reply = "<br>".join(lines)

    # 5. Goals
    elif any(k in msg_lower for k in ["goal", "goals", "laptop", "save for"]):
        g_res = fin.get_goal_progress(db, user_id)
        tool_calls_made.append({"tool": "get_goals", "args": {}, "result": g_res})
        if not g_res:
            reply = "You don't have any active savings goals yet. You can create one from the Goals tab or ask me: <i>'I want to save ₹40,000 for a laptop'</i>."
        else:
            lines = ["Here are your active savings goals:"]
            for g in g_res:
                lines.append(f"• <b>{g['name']}</b>: ₹{g['current']:,.0f} / ₹{g['target']:,.0f} ({g['pct']}%) — ~{g['months_to_goal']} months to go.")
            reply = "<br>".join(lines)

    # 6. Insights
    elif any(k in msg_lower for k in ["insight", "insights", "pattern", "forecast", "trend"]):
        ins = fin.get_spending_insights(db, user_id)
        tool_calls_made.append({"tool": "get_spending_insights", "args": {}, "result": ins})
        reply = (
            f"Here are your spending insights for {ins['period']}:<br><br>"
            f"• Total spent so far: <b>₹{ins['total_spent']:,.0f}</b><br>"
            f"• Daily spending average: <b>₹{ins['daily_avg']:,.0f}/day</b><br>"
            f"• Projected month-end spend: <b>₹{ins['forecast_month_end']:,.0f}</b> (based on current pace)<br>"
            f"• Days remaining: <b>{ins['days_remaining']} days</b>"
        )

    else:
        reply = (
            "I'm here to help you manage your money! You can try:<br>"
            "• <i>'I spent ₹120 on auto'</i> to log an expense<br>"
            "• <i>'Can I afford ₹1,500?'</i> to run an affordability check<br>"
            "• <i>'What if I save ₹1,000 more?'</i> to test a scenario<br>"
            "• <i>'How is my budget?'</i> to check category health"
        )

    db.refresh(profile)
    return {
        "reply": reply,
        "pending": pending_entry,
        "tool_calls": tool_calls_made,
        "xp_gained": xp_gained,
        "level_up": level_up,
        "profile": {
            "xp": profile.xp,
            "level": profile.level,
            "streak": profile.streak,
            "quest_count": profile.quest_count,
        },
    }


def chat(
    message: str,
    history: list,
    db: Session,
    user_id: str,
    api_key: str,
) -> dict:
    """
    Main chat function. Uses Gemini with function calling when key is present,
    falls back cleanly to deterministic tools otherwise.
    """
    is_placeholder_key = not api_key or "YOUR_GEMINI_API_KEY" in api_key or api_key == "your_gemini_api_key_here"

    if is_placeholder_key:
        return offline_fallback(message, db, user_id)

    try:
        client = genai.Client(api_key=api_key)

        gemini_history = []
        for h in history[-10:]:
            role = "user" if h["role"] == "user" else "model"
            gemini_history.append(types.Content(role=role, parts=[types.Part(text=h["content"])]))

        chat_session = client.chats.create(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=TOOLS,
            ),
            history=gemini_history,
        )

        pending_entry = None
        tool_calls_made = []
        xp_gained = 0
        level_up = False
        profile = get_or_create_profile(db, user_id)

        response = chat_session.send_message(message)

        max_iterations = 5
        for _ in range(max_iterations):
            fn_calls = response.function_calls
            if not fn_calls:
                break

            tool_parts = []
            for fc in fn_calls:
                tool_name = fc.name
                args = dict(fc.args) if fc.args else {}
                result = execute_tool(tool_name, args, db, user_id)
                tool_calls_made.append({"tool": tool_name, "args": args, "result": result})

                if tool_name == "log_expense" and result.get("status") == "pending_confirmation":
                    pending_entry = result

                if tool_name in ("log_expense", "log_income") and result.get("status") in ("saved", "pending_confirmation"):
                    profile.xp += 10
                    xp_gained += 10
                    profile.quest_count = min(profile.quest_count + 1, 3)
                    if _check_level_up(profile):
                        level_up = True
                    db.commit()

                tool_parts.append(
                    types.Part.from_function_response(
                        name=tool_name,
                        response={"result": json.dumps(result, default=str)},
                    )
                )

            response = chat_session.send_message(tool_parts)

        reply_text = response.text or ""
        if not reply_text:
            reply_text = "I'm here to help! Tell me what you spent, ask about your budget, or check if you can afford something."

        db.refresh(profile)

        return {
            "reply": reply_text,
            "pending": pending_entry,
            "tool_calls": tool_calls_made,
            "xp_gained": xp_gained,
            "level_up": level_up,
            "profile": {
                "xp": profile.xp,
                "level": profile.level,
                "streak": profile.streak,
                "quest_count": profile.quest_count,
            },
        }

    except Exception as e:
        # If API key is invalid or quota exceeded, seamlessly fall back to local tools
        fallback_res = offline_fallback(message, db, user_id)
        fallback_res["reply"] += f"<br><br><small style='color:var(--mute)'><i>(Gemini Note: {str(e)[:60]}... Used offline tools)</i></small>"
        return fallback_res
