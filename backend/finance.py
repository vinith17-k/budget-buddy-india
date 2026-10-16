"""
Deterministic finance logic — all calculations happen here, NOT in the LLM.
The LLM only explains results; numbers come from pure Python.
"""
from datetime import datetime, date
from calendar import monthrange
from sqlalchemy.orm import Session
from database import Transaction, Budget, Goal, Profile
from typing import Optional


CATEGORIES = ["Food", "Transport", "Fun", "Housing", "Education",
              "Healthcare", "Savings", "Subscriptions", "Other"]


def current_period() -> str:
    return datetime.now().strftime("%Y-%m")


def days_remaining_in_month() -> int:
    today = date.today()
    _, last_day = monthrange(today.year, today.month)
    return last_day - today.day


def days_since_start_of_month() -> int:
    return date.today().day - 1


def get_balance(db: Session, user_id: str) -> dict:
    """Calculate real-time balance from all transactions."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    income_total = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.transaction_date.startswith(current_period()),
        )
        .all()
    )
    expense_total = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date.startswith(current_period()),
        )
        .all()
    )
    total_income = sum(t.amount for t in income_total)
    total_expense = sum(t.amount for t in expense_total)
    balance = total_income - total_expense
    min_bal = profile.min_balance if profile else 500.0
    days_left = days_remaining_in_month()
    return {
        "balance": round(balance, 2),
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "min_balance": min_bal,
        "days_remaining": days_left,
        "safe_to_spend": round(max(0, balance - min_bal), 2),
    }


def get_budget_status(db: Session, user_id: str) -> dict:
    """Return spending vs. budget per category for current month."""
    period = current_period()
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.period == period)
        .all()
    )
    result = {}
    for b in budgets:
        spent = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.category == b.category,
                Transaction.type == "expense",
                Transaction.transaction_date.startswith(period),
            )
            .all()
        )
        total_spent = sum(t.amount for t in spent)
        pct = round(total_spent / b.planned_amount * 100, 1) if b.planned_amount else 0
        result[b.category] = {
            "planned": b.planned_amount,
            "spent": round(total_spent, 2),
            "remaining": round(b.planned_amount - total_spent, 2),
            "pct": pct,
            "over_budget": total_spent > b.planned_amount,
        }
    # Also add unbudgeted categories that have spend
    expenses = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date.startswith(period),
        )
        .all()
    )
    for txn in expenses:
        if txn.category not in result:
            result[txn.category] = {
                "planned": 0,
                "spent": 0,
                "remaining": 0,
                "pct": 0,
                "over_budget": False,
            }
            result[txn.category]["spent"] += txn.amount
    return result


def check_affordability(db: Session, user_id: str, amount: float) -> dict:
    """Check if a purchase is safe given current balance and upcoming bills."""
    bal_data = get_balance(db, user_id)
    safe = bal_data["safe_to_spend"]
    balance = bal_data["balance"]
    verdict = "Safe" if amount <= safe * 0.6 else ("Risky" if amount <= safe else "Wait")
    tip = {
        "Safe": f"You can comfortably afford ₹{amount:,.0f} and still cover your essentials.",
        "Risky": f"You can technically afford it, but it uses most of your safe spending room. Consider a cheaper alternative.",
        "Wait": f"This is ₹{max(0, amount - safe):,.0f} over your safe limit. It's safer to postpone or save first.",
    }[verdict]
    return {
        "amount": amount,
        "balance": balance,
        "safe_to_spend": safe,
        "min_balance": bal_data["min_balance"],
        "verdict": verdict,
        "tip": tip,
    }


def run_whatif(db: Session, user_id: str, scenario: str, amount: float) -> dict:
    """Simulate a what-if financial scenario."""
    goals = db.query(Goal).filter(Goal.user_id == user_id, Goal.status == "active").all()
    results = []
    for g in goals:
        remaining = g.target_amount - g.current_amount
        if remaining <= 0:
            continue
        current_monthly = g.monthly_contribution or 2000
        months_now = remaining / current_monthly if current_monthly else float("inf")
        if "save" in scenario.lower() or "extra" in scenario.lower():
            new_monthly = current_monthly + amount
        elif "reduce" in scenario.lower() or "cut" in scenario.lower():
            new_monthly = max(0, current_monthly - amount)
        else:
            new_monthly = current_monthly + amount
        months_new = remaining / new_monthly if new_monthly else float("inf")
        results.append({
            "goal": g.name,
            "target": g.target_amount,
            "remaining": remaining,
            "current_monthly": current_monthly,
            "new_monthly": new_monthly,
            "months_now": round(months_now, 1),
            "months_new": round(months_new, 1),
            "months_saved": round(months_now - months_new, 1),
        })
    if not results:
        # generic savings simulation
        balance_data = get_balance(db, user_id)
        results = [{
            "goal": "General savings",
            "note": f"If you save ₹{amount:,.0f} more per month, you'd have ₹{amount * 12:,.0f} extra in a year.",
            "amount": amount,
            "annual_impact": amount * 12,
        }]
    return {"scenario": scenario, "amount": amount, "results": results}


def get_spending_insights(db: Session, user_id: str) -> dict:
    """Generate spending pattern insights for the current month."""
    period = current_period()
    txns = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date.startswith(period),
        )
        .all()
    )
    by_cat: dict = {}
    for t in txns:
        by_cat.setdefault(t.category, []).append(t.amount)
    summary = {
        cat: {
            "count": len(amounts),
            "total": round(sum(amounts), 2),
            "avg": round(sum(amounts) / len(amounts), 2),
        }
        for cat, amounts in by_cat.items()
    }
    days_elapsed = max(1, days_since_start_of_month())
    days_remaining = days_remaining_in_month()
    total_spent = sum(t.amount for t in txns)
    daily_rate = total_spent / days_elapsed
    forecast_month_end = round(total_spent + daily_rate * days_remaining, 2)
    hot_cats = [c for c, d in summary.items() if d["total"] > 2000]
    return {
        "period": period,
        "total_spent": round(total_spent, 2),
        "by_category": summary,
        "daily_avg": round(daily_rate, 2),
        "forecast_month_end": forecast_month_end,
        "days_elapsed": days_elapsed,
        "days_remaining": days_remaining,
        "hot_categories": hot_cats,
    }


def get_goal_progress(db: Session, user_id: str) -> list:
    goals = db.query(Goal).filter(Goal.user_id == user_id, Goal.status == "active").all()
    result = []
    for g in goals:
        pct = round(g.current_amount / g.target_amount * 100, 1) if g.target_amount else 0
        remaining = g.target_amount - g.current_amount
        months_needed = (
            round(remaining / g.monthly_contribution, 1)
            if g.monthly_contribution
            else None
        )
        result.append({
            "id": g.id,
            "name": g.name,
            "target": g.target_amount,
            "current": g.current_amount,
            "remaining": remaining,
            "pct": pct,
            "monthly_contribution": g.monthly_contribution,
            "months_to_goal": months_needed,
            "target_date": g.target_date,
        })
    return result


def categorize_from_text(text: str) -> str:
    """Heuristic category guesser from transaction description."""
    t = text.lower()
    if any(w in t for w in ["lunch", "dinner", "food", "chai", "tea", "snack",
                             "coffee", "canteen", "mess", "biryani", "restaurant",
                             "swiggy", "zomato", "grocery", "milk", "bread"]):
        return "Food"
    if any(w in t for w in ["bus", "auto", "metro", "cab", "uber", "petrol",
                             "train", "ola", "fuel", "toll", "rapido"]):
        return "Transport"
    if any(w in t for w in ["movie", "game", "netflix", "party", "spotify",
                             "concert", "amazon prime", "hotstar", "youtube"]):
        return "Fun"
    if any(w in t for w in ["rent", "pg", "hostel", "electricity", "water",
                             "wifi", "internet", "maintenance"]):
        return "Housing"
    if any(w in t for w in ["book", "course", "tuition", "college", "school",
                             "exam", "notes", "udemy"]):
        return "Education"
    if any(w in t for w in ["doctor", "medicine", "pharmacy", "hospital",
                             "clinic", "health", "gym", "protein"]):
        return "Healthcare"
    if any(w in t for w in ["savings", "fd", "emi", "loan", "investment",
                             "mutual fund", "sip"]):
        return "Savings"
    return "Other"
