"""
FastAPI backend for Budget Coach.
"""
import os
import io
from datetime import datetime, date
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

from database import (
    create_tables, get_db, get_or_create_profile,
    Transaction, Budget, Goal, Profile
)
import finance as fin
import agent as ag

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

app = FastAPI(title="Budget Coach API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []
    user_id: str = "default"


class ConfirmExpenseRequest(BaseModel):
    user_id: str = "default"
    amount: float
    description: str
    category: str


class TransactionCreate(BaseModel):
    user_id: str = "default"
    type: str = "expense"
    amount: float
    description: str
    category: str
    transaction_date: Optional[str] = None
    source: str = "manual"


class BudgetCreate(BaseModel):
    user_id: str = "default"
    category: str
    planned_amount: float


class GoalCreate(BaseModel):
    user_id: str = "default"
    name: str
    target_amount: float
    current_amount: float = 0.0
    monthly_contribution: float = 0.0
    target_date: Optional[str] = ""


class ProfileUpdate(BaseModel):
    user_id: str = "default"
    display_name: Optional[str] = None
    monthly_income: Optional[float] = None
    income_day: Optional[int] = None
    min_balance: Optional[float] = None


# ── Chat endpoint ─────────────────────────────────────────────────────────────

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest, db: Session = Depends(get_db)):
    result = ag.chat(
        message=req.message,
        history=req.history,
        db=db,
        user_id=req.user_id,
        api_key=GEMINI_API_KEY or "",
    )
    return result


@app.post("/api/confirm-expense")
def confirm_expense(req: ConfirmExpenseRequest, db: Session = Depends(get_db)):
    """Called when user taps 'Confirm' on a pending expense card."""
    txn = Transaction(
        user_id=req.user_id,
        type="expense",
        amount=req.amount,
        description=req.description,
        category=req.category,
        transaction_date=date.today().isoformat(),
        source="chat",
    )
    db.add(txn)
    profile = get_or_create_profile(db, req.user_id)
    profile.xp += 10
    profile.quest_count = min(profile.quest_count + 1, 3)
    quest_complete = profile.quest_count >= 3 and not profile.quest_done
    if quest_complete:
        profile.xp += 50
        profile.quest_done = True
    # level up
    while profile.xp >= 500:
        profile.xp -= 500
        profile.level += 1
    db.commit()
    bal = fin.get_balance(db, req.user_id)
    budget_status = fin.get_budget_status(db, req.user_id)
    cat_status = budget_status.get(req.category)
    return {
        "status": "saved",
        "balance": bal,
        "category_status": cat_status,
        "quest_complete": quest_complete,
        "profile": {
            "xp": profile.xp,
            "level": profile.level,
            "streak": profile.streak,
            "quest_count": profile.quest_count,
        },
    }


# ── Profile ───────────────────────────────────────────────────────────────────

@app.get("/api/profile/{user_id}")
def get_profile(user_id: str, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    bal = fin.get_balance(db, user_id)
    return {
        "user_id": profile.user_id,
        "display_name": profile.display_name,
        "monthly_income": profile.monthly_income,
        "income_day": profile.income_day,
        "min_balance": profile.min_balance,
        "xp": profile.xp,
        "level": profile.level,
        "streak": profile.streak,
        "quest_count": profile.quest_count,
        "quest_done": profile.quest_done,
        "balance": bal,
    }


@app.put("/api/profile")
def update_profile(req: ProfileUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, req.user_id)
    if req.display_name is not None:
        profile.display_name = req.display_name
    if req.monthly_income is not None:
        profile.monthly_income = req.monthly_income
    if req.income_day is not None:
        profile.income_day = req.income_day
    if req.min_balance is not None:
        profile.min_balance = req.min_balance
    db.commit()
    return {"status": "updated"}


# ── Transactions ──────────────────────────────────────────────────────────────

@app.get("/api/transactions/{user_id}")
def list_transactions(user_id: str, limit: int = 50, db: Session = Depends(get_db)):
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": t.id,
            "type": t.type,
            "amount": t.amount,
            "description": t.description,
            "category": t.category,
            "transaction_date": t.transaction_date,
            "source": t.source,
            "created_at": t.created_at.isoformat() if t.created_at else "",
        }
        for t in txns
    ]


@app.post("/api/transactions")
def add_transaction(req: TransactionCreate, db: Session = Depends(get_db)):
    txn = Transaction(
        user_id=req.user_id,
        type=req.type,
        amount=req.amount,
        description=req.description,
        category=req.category,
        transaction_date=req.transaction_date or date.today().isoformat(),
        source=req.source,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return {"id": txn.id, "status": "saved"}


@app.delete("/api/transactions/{txn_id}")
def delete_transaction(txn_id: int, user_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id, Transaction.user_id == user_id
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()
    return {"status": "deleted"}


# ── Budget ────────────────────────────────────────────────────────────────────

@app.get("/api/budget/{user_id}")
def get_budget(user_id: str, db: Session = Depends(get_db)):
    return fin.get_budget_status(db, user_id)


@app.post("/api/budget")
def set_budget(req: BudgetCreate, db: Session = Depends(get_db)):
    period = fin.current_period()
    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == req.user_id,
            Budget.category == req.category,
            Budget.period == period,
        )
        .first()
    )
    if existing:
        existing.planned_amount = req.planned_amount
    else:
        db.add(Budget(
            user_id=req.user_id,
            category=req.category,
            planned_amount=req.planned_amount,
            period=period,
        ))
    db.commit()
    return {"status": "saved", "category": req.category}


# ── Goals ─────────────────────────────────────────────────────────────────────

@app.get("/api/goals/{user_id}")
def get_goals(user_id: str, db: Session = Depends(get_db)):
    return fin.get_goal_progress(db, user_id)


@app.post("/api/goals")
def create_goal(req: GoalCreate, db: Session = Depends(get_db)):
    goal = Goal(
        user_id=req.user_id,
        name=req.name,
        target_amount=req.target_amount,
        current_amount=req.current_amount,
        monthly_contribution=req.monthly_contribution,
        target_date=req.target_date or "",
        status="active",
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return {"id": goal.id, "status": "created"}


@app.put("/api/goals/{goal_id}/contribute")
def contribute_to_goal(goal_id: int, user_id: str, amount: float, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.current_amount = min(goal.current_amount + amount, goal.target_amount)
    if goal.current_amount >= goal.target_amount:
        goal.status = "completed"
    db.commit()
    return {"status": "updated", "current": goal.current_amount}


# ── Insights ──────────────────────────────────────────────────────────────────

@app.get("/api/insights/{user_id}")
def get_insights(user_id: str, db: Session = Depends(get_db)):
    return fin.get_spending_insights(db, user_id)


@app.get("/api/balance/{user_id}")
def get_balance(user_id: str, db: Session = Depends(get_db)):
    return fin.get_balance(db, user_id)


# ── CSV Import ────────────────────────────────────────────────────────────────

@app.post("/api/import/{user_id}")
async def import_csv(user_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")

    # Try to auto-detect columns
    col_map = {}
    for col in df.columns:
        cl = col.lower().strip()
        if any(k in cl for k in ["amount", "debit", "credit", "amt"]):
            col_map.setdefault("amount", col)
        if any(k in cl for k in ["desc", "narration", "particular", "detail", "note"]):
            col_map.setdefault("description", col)
        if any(k in cl for k in ["date", "txn", "transaction"]):
            col_map.setdefault("date", col)
        if any(k in cl for k in ["category", "cat", "type"]):
            col_map.setdefault("category", col)

    preview_rows = []
    errors = []
    for idx, row in df.iterrows():
        try:
            amount_col = col_map.get("amount")
            desc_col = col_map.get("description")
            date_col = col_map.get("date")
            cat_col = col_map.get("category")

            amount = float(str(row.get(amount_col, 0)).replace(",", "").replace("₹", "")) if amount_col else 0
            description = str(row.get(desc_col, "Imported transaction")) if desc_col else "Imported"
            txn_date = str(row.get(date_col, date.today().isoformat())) if date_col else date.today().isoformat()
            category = str(row.get(cat_col, "")) if cat_col else fin.categorize_from_text(description)
            if not category or category == "nan":
                category = fin.categorize_from_text(description)

            preview_rows.append({
                "row": idx,
                "amount": amount,
                "description": description,
                "date": txn_date,
                "category": category,
            })
        except Exception as e:
            errors.append({"row": idx, "error": str(e)})

    return {
        "preview": preview_rows[:50],
        "total_rows": len(df),
        "detected_columns": col_map,
        "errors": errors,
        "message": f"Found {len(preview_rows)} valid rows. Review and confirm to import.",
    }


@app.post("/api/import/{user_id}/confirm")
def confirm_import(user_id: str, rows: List[dict], db: Session = Depends(get_db)):
    saved = 0
    for row in rows:
        txn = Transaction(
            user_id=user_id,
            type="expense",
            amount=row["amount"],
            description=row["description"],
            category=row.get("category", "Other"),
            transaction_date=row.get("date", date.today().isoformat()),
            source="import",
        )
        db.add(txn)
        saved += 1
    db.commit()
    return {"status": "imported", "count": saved}


# ── Seed data for demo ────────────────────────────────────────────────────────

@app.post("/api/seed/{user_id}")
def seed_demo(user_id: str, db: Session = Depends(get_db)):
    """Seed realistic demo data so the app looks alive from the start."""
    profile = get_or_create_profile(db, user_id)
    profile.display_name = "Vinit"
    profile.monthly_income = 25000
    profile.min_balance = 500
    profile.xp = 320
    profile.level = 4
    profile.streak = 6
    profile.quest_count = 1

    period = fin.current_period()
    # Income
    if not db.query(Transaction).filter(
        Transaction.user_id == user_id, Transaction.type == "income"
    ).first():
        db.add(Transaction(user_id=user_id, type="income", amount=25000,
                           description="Monthly salary", category="Income",
                           transaction_date=f"{period}-01", source="manual"))

    # Sample expenses
    sample = [
        (150, "Lunch at canteen", "Food"),
        (80, "Bus pass", "Transport"),
        (299, "Netflix subscription", "Fun"),
        (500, "Grocery shopping", "Food"),
        (120, "Auto to office", "Transport"),
        (400, "Movie tickets", "Fun"),
        (200, "Electricity bill", "Housing"),
        (60, "Chai and snacks", "Food"),
    ]
    if not db.query(Transaction).filter(
        Transaction.user_id == user_id, Transaction.type == "expense"
    ).first():
        for i, (amt, desc, cat) in enumerate(sample):
            db.add(Transaction(
                user_id=user_id, type="expense", amount=amt,
                description=desc, category=cat,
                transaction_date=f"{period}-{i+2:02d}", source="manual"
            ))

    # Budgets
    budgets = [("Food", 3000), ("Transport", 1000), ("Fun", 1000), ("Other", 800)]
    for cat, amt in budgets:
        if not db.query(Budget).filter(
            Budget.user_id == user_id, Budget.category == cat, Budget.period == period
        ).first():
            db.add(Budget(user_id=user_id, category=cat, planned_amount=amt, period=period))

    # Goal
    if not db.query(Goal).filter(Goal.user_id == user_id).first():
        db.add(Goal(user_id=user_id, name="Laptop", target_amount=40000,
                    current_amount=8000, monthly_contribution=2000, status="active"))

    db.commit()
    return {"status": "seeded"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
