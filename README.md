# Budget Coach 💰 (Vercel-Ready)

> AI-powered personal finance coach for India — built with Next.js App Router, Gemini AI, and pure TypeScript. Strictly follows the brutalist UI design from `Budget Coach.html`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvinitharidas8-png%2Fbudget-buddy-india.git&env=GEMINI_API_KEY&envDescription=Free%20API%20key%20from%20Google%20AI%20Studio)

---

## ⚡ 1-Minute Vercel Deployment

1. **Push your code to GitHub**:
   ```bash
   git push origin master
   ```
2. **Go to [Vercel](https://vercel.com/new)** and click **Import** on `budget-buddy-india`.
3. In **Environment Variables**, add:
   - **`GEMINI_API_KEY`**: *(Optional)* Your free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
     *(If omitted, the app automatically runs in deterministic offline AI mode with zero errors!)*
4. Click **Deploy**! 🚀

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Add your Gemini key in .env.local
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Or double-click:
```powershell
.\start.ps1
```

---

## 🏗️ Architecture

Everything is unified into a single Next.js project with App Router Serverless Functions:

```
Budget Coach/
├── app/
│   ├── page.tsx               ← Brutalist UI (matches original HTML exactly)
│   ├── layout.tsx
│   ├── globals.css            ← Fonts, brutalist borders, SVG rough filter
│   └── api/                   ← Vercel Serverless Functions
│       ├── chat/route.ts      ← Gemini AI tool-calling agent
│       ├── confirm-expense/   ← Expense logger & gamification
│       ├── profile/[userId]/  ← User state, streaks, quests
│       ├── budget/            ← Budget limits & tracking
│       ├── goals/             ← Savings goals tracker
│       ├── insights/[userId]/ ← Spending burn rate & forecasts
│       └── transactions/      ← Transaction ledger
├── lib/
│   ├── agent.ts               ← Gemini agent + offline fallback
│   ├── finance.ts             ← Deterministic financial math (no hallucinations)
│   ├── store.ts               ← In-memory storage & seed data
│   └── types.ts               ← TypeScript interfaces
├── Budget Coach.html          ← Original reference design
└── package.json               ← Next.js dependencies
```

---

## ✨ Features

- **Conversational Expense Logging**: Say *"I spent ₹150 on lunch"* — the AI extracts details, picks a category, and displays an **Entry Card** with `Confirm` and `Change category`.
- **Affordability Analysis**: Ask *"Can I afford ₹1,000?"* — checks your remaining income, days to next salary, and minimum balance.
- **What-If Goal Simulator**: Ask *"What if I save ₹500 more?"* — calculates how many months earlier you reach your goals.
- **Gamification**: XP points, Level ups, daily quests (3 expenses/day), and celebration confetti.
- **Brutalist Design**: Faithful replica of `Budget Coach.html` with rough hand-drawn filters, dark/light theme switch, and mobile bottom navigation.
