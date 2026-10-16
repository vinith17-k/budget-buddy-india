# Budget Coach 💰

> AI-powered personal finance coach for India — built with Gemini AI, Next.js, and FastAPI.

## What's Inside

The app strictly follows the original `Budget Coach.html` design (brutalist aesthetic, Rubik Dirt + Space Mono fonts, orange accent, hand-drawn SVG filter) and makes it **fully functional** with real AI.

```
Budget Coach/
├── Budget Coach.html      ← original (untouched)
├── start.ps1              ← one-click start script
├── backend/               ← Python FastAPI + Gemini AI
│   ├── main.py            ← all API endpoints
│   ├── agent.py           ← Gemini tool-calling agent
│   ├── finance.py         ← deterministic finance math
│   ├── database.py        ← SQLite models (SQLAlchemy)
│   └── requirements.txt
└── frontend/              ← Next.js 16 app
    ├── app/
    │   ├── page.tsx       ← main app (chat + all panels)
    │   └── globals.css    ← faithfully ported from HTML
    └── .env.local
```

## Setup (5 minutes)

### 1. Get a free Gemini API Key
👉 https://aistudio.google.com/app/apikey (free, no credit card)

### 2. Add the key to backend
Edit `backend/.env`:
```
GEMINI_API_KEY=your_actual_key_here
```

### 3. Start the app

**Option A — One script:**
```powershell
.\start.ps1
```

**Option B — Manual (two terminals):**

**Terminal 1 — Backend:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000

## Features

| Feature | Status |
|---|---|
| 💬 AI Chat (Gemini 1.5 Flash) | ✅ |
| 📝 Expense logging with confirmation | ✅ |
| 💸 Affordability checker | ✅ |
| 🔮 What-if simulator | ✅ |
| 📊 Budget by category | ✅ |
| 🎯 Savings goals | ✅ |
| 💡 Spending insights + forecast | ✅ |
| 🏆 XP / Level / Streak gamification | ✅ |
| 📂 CSV import | ✅ |
| 🌙 Dark mode | ✅ |
| 📱 Mobile responsive | ✅ |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Send a message to the AI coach |
| POST | `/api/confirm-expense` | Confirm a pending expense |
| GET | `/api/profile/{user_id}` | Get user profile + balance |
| GET | `/api/transactions/{user_id}` | List transactions |
| GET | `/api/budget/{user_id}` | Get budget status |
| GET | `/api/goals/{user_id}` | Get savings goals |
| GET | `/api/insights/{user_id}` | Get spending insights |
| POST | `/api/import/{user_id}` | Preview CSV import |

Full API docs: http://localhost:8000/docs

## Architecture

```
User
  │  (Next.js frontend)
  │  ── talks to ──
  ↓
FastAPI Backend
  │  ── orchestrates ──
  ├── finance.py          ← deterministic math (never hallucinated)
  ├── Gemini 1.5 Flash    ← natural language understanding
  │     └── tool calling  ← grounded in real DB data
  └── SQLite DB           ← your actual transactions, budgets, goals
```

**Key principle:** All financial calculations are in Python (`finance.py`). Gemini only explains results in natural language — it never invents numbers.
