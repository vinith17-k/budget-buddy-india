# Personal Budget Coach Agent
## AI-Powered Personal Finance Coach

**Project type:** AI chatbot / agent  
**Target users:** College students, fresh graduates, and working professionals  
**Development approach:** AI-assisted development using OpenCode  
**Product ambition:** Portfolio-quality project with potential to evolve into a startup

---

## 1. Project Overview

The **Personal Budget Coach Agent** is an AI-powered personal finance assistant that helps people understand their spending, create realistic budgets, plan savings goals, and make more informed everyday financial decisions.

Unlike a conventional expense tracker that mainly records transactions, this agent uses a user's financial data to explain spending patterns, answer questions, simulate possible decisions, forecast potential shortfalls, and proactively suggest practical next steps.

The product will support three ways to add financial data:
1. Manual entry through the application.
2. CSV/Excel transaction import.
3. Conversational entry, such as: “I spent ₹150 on lunch.”

The agent is designed for students, freshers, and working professionals, with budgeting recommendations tailored to different income patterns and financial responsibilities.

## 2. Problem Statement

Many people struggle to manage limited or irregular income, control discretionary spending, save consistently, and plan for future expenses. Traditional expense trackers can show where money went, but often do not provide enough personalized guidance about what to do next.

The project aims to address this gap through a conversational and proactive AI agent that turns financial records into understandable insights and practical, user-controlled action plans.

## 3. Project Objectives

- Help users record and categorize income and expenses.
- Generate realistic budgets based on income, essential expenses, and user priorities.
- Answer natural-language questions using the user's available financial records.
- Identify spending patterns and changes in category-level spending.
- Estimate end-of-month balances and flag possible budget shortfalls.
- Simulate the impact of purchases, income changes, and spending adjustments.
- Help users set and track savings goals.
- Provide proactive alerts and weekly/monthly summaries.
- Offer a financial emergency plan when income falls or an unexpected expense occurs.
- Protect financial data and keep users in control of consequential changes.

## 4. Target Users

### 4.1 College students
Users managing pocket money, scholarships, part-time income, food, transport, education, and PG/hostel expenses.

### 4.2 Fresh graduates
Users learning to manage their first salary, recurring bills, savings, and new financial responsibilities.

### 4.3 Working professionals
Users managing monthly income, essential expenses, subscriptions, savings goals, and variable discretionary spending.

The system should adapt its recommendations to the user's actual circumstances rather than applying one fixed budgeting formula to everyone.

## 5. Core Product Features

### 5.1 Conversational AI Financial Coach
Users can ask questions in everyday language, for example:
- “Why did I spend more this month?”
- “How much can I safely spend this weekend?”
- “Help me plan my ₹12,000 monthly budget.”
- “I received ₹2,000 from freelance work. How should I allocate it?”
- “Can I afford a ₹2,500 purchase before my next income?”

The agent should use available records, explain its reasoning, and ask follow-up questions when important information is missing.

### 5.2 Expense and Income Tracking
Users can add transactions manually or through conversation.

Example: “I spent ₹150 on lunch today.”

The agent should extract the amount, date, description, and likely category, then confirm uncertain details before saving. It should avoid creating duplicate or fabricated transactions.

### 5.3 CSV/Excel Import
Users can upload transaction files. The application should:
- Preview the file before importing.
- Map common date, description, debit, credit, and amount columns.
- Validate data and report rows it cannot interpret.
- Suggest categories for imported transactions.
- Detect likely duplicates.
- Require user confirmation before saving imported records.

Initial support can focus on common CSV formats; Excel support can be added as the import flow stabilizes.

### 5.4 Personalized Budget Planner
Create category-based budgets using the user's income, fixed commitments, essential spending, priorities, and goals.

Possible categories include:
- Housing and utilities
- Food and groceries
- Transportation
- Education
- Healthcare
- Personal spending
- Entertainment
- Debt payments
- Savings and emergency fund
- Other expenses

If the user's income cannot cover essential costs, the agent should explain the shortfall rather than generate an unrealistic budget.

### 5.5 Spending Insights
Analyze spending patterns and provide understandable insights, such as:
- Categories with increased spending.
- Budget utilization.
- Repeated small purchases that add up.
- Potential recurring subscriptions.
- Comparisons with previous periods.
- Possible opportunities to reduce expenses.

The agent must distinguish observed facts from assumptions. A spending increase alone does not prove impulsive behavior.

### 5.6 Predictive Spending Analysis
Estimate likely month-end spending and balance based on recorded transactions, remaining days, known upcoming bills, and recent spending patterns.

Predictions must:
- Show the assumptions used.
- Communicate uncertainty.
- Avoid presenting estimates as guaranteed outcomes.
- Explain when there is insufficient data for a reliable forecast.

### 5.7 What-If Financial Simulator
Let users compare hypothetical choices before acting.

Examples:
- “What if I reduce food spending by ₹500 each month?”
- “What if I earn ₹5,000 extra next month?”
- “What happens to my laptop goal if I save ₹1,500 instead of ₹2,000?”
- “Can I buy these headphones and still cover my upcoming bills?”

Use deterministic financial calculations for totals, projections, and comparisons. The language model should explain the results, not invent the numbers.

### 5.8 Purchase Affordability Assistant
Assess a proposed purchase against:
- Available funds.
- Days until the next expected income.
- Essential expenses still due.
- Existing commitments.
- User-defined minimum balance.
- Savings goals and priorities.

Return a clear explanation and options such as proceed, postpone, save first, or consider a lower-cost alternative. The agent should not treat the current account balance as fully disposable money.

### 5.9 Savings Goal Planner
Users can define a target amount, current savings, deadline, and contribution schedule.

The system calculates required periodic savings, tracks progress, and offers alternatives if the goal is not currently realistic.

### 5.10 Proactive Financial Alerts
With user permission, the system can flag events such as:
- A budget nearing its limit.
- A projected shortfall before the next income.
- An upcoming bill.
- A savings goal falling behind schedule.
- A significant change in spending.

Alerts should be relevant, configurable, and based on actual data. Avoid excessive notifications.

### 5.11 Financial Emergency Mode
When a user reports lost income or an unexpected expense, the agent helps:
1. Establish the amount available and expected income.
2. Identify essential expenses and urgent commitments.
3. Estimate the shortfall.
4. Explore discretionary spending that could be paused or reduced.
5. Create a short-term recovery plan.
6. Explain the trade-offs and request approval before saving budget changes.

The agent should not shame the user or recommend skipping essential healthcare, food, housing, or other critical needs without careful context.

### 5.12 Financial Memory
Remember useful, user-approved context such as budgeting preferences, goals, income frequency, and minimum balance preferences.

Users should be able to review, correct, and delete stored information. Do not store bank passwords, PINs, or OTPs.

### 5.13 Reports
Generate weekly and monthly summaries containing:
- Income and expenses.
- Category-wise spending.
- Budget status.
- Savings progress.
- Notable changes.
- Forecast assumptions.
- Suggested next steps.

## 6. Agent Operating Modes

### Coach Mode
Answers questions, explains financial concepts, and provides personalized recommendations.

### Analyst Mode
Analyzes transactions, identifies patterns, forecasts spending, and runs what-if simulations.

### Agent Mode
Checks for configured conditions, prepares alerts and suggested budget adjustments, and requests user approval before making consequential changes.

**Important:** The agent must not silently alter financial records or make financial transactions. Budget changes and data imports should be reviewable and confirmed by the user.

## 7. Example User Journey

**User:** “I receive ₹10,000 per month and want to save for a laptop.”

1. The agent asks about essential expenses, existing savings, target price, and desired deadline.
2. The user enters transactions manually, by chat, or through CSV import.
3. The system calculates a budget using the supplied records.
4. The agent proposes a savings target and explains its feasibility.
5. During the month, the user records expenses conversationally.
6. The system updates budget utilization and goal progress.
7. If spending trends suggest a shortfall, it explains the risk and offers options.
8. The user can simulate alternative spending plans and approve any proposed budget changes.

## 8. Suggested Application Screens

1. **Dashboard** — available balance estimate, income, spending, budget progress, goals, and alerts.
2. **AI Coach** — chat interface with contextual financial answers.
3. **Transactions** — add, edit, categorize, search, and import records.
4. **Budget Planner** — category limits, commitments, and budget adjustments.
5. **Goals** — savings targets, deadlines, and progress.
6. **Insights** — spending patterns, comparisons, and forecasts.
7. **Simulator** — compare hypothetical financial scenarios.
8. **Reports** — weekly/monthly summaries and export options.
9. **Settings & Privacy** — preferences, notifications, data export, and deletion controls.

## 9. Proposed Technical Stack

| Component | Proposed technology | Responsibility |
|---|---|---|
| Frontend | React / Next.js | Responsive web application |
| UI | Tailwind CSS + shadcn/ui | Interface components |
| Backend | Python + FastAPI | APIs, validation, and agent tools |
| Database | PostgreSQL / Supabase | Users, transactions, budgets, goals |
| Authentication | Supabase Auth or equivalent | User authentication |
| AI model | LLM API or a compatible local model | Intent understanding and natural-language responses |
| Financial calculations | Python | Budgets, projections, comparisons, and goal calculations |
| Data processing | Pandas | CSV/Excel import and analysis |
| Charts | Recharts or equivalent | Spending and progress visualizations |
| Deployment | Vercel + compatible backend hosting | Application deployment |

The stack is provisional and can be simplified based on model availability, cost, hosting limits, and development time. OpenCode will be used as the AI-assisted coding environment.

## 10. High-Level Architecture

```text
User
  |
  v
Web Application
  |
  v
Backend API and Authentication
  |
  v
Agent Orchestrator
  |--------------------|--------------------|
  v                    v                    v
Budget Tools      Transaction Tools     Goal Tools
  |                    |                    |
  +--------------------+--------------------+
                       |
                       v
             Deterministic Finance Logic
                       |
                       v
              Authorized Database Access
                       |
                       v
             Structured Results and Checks
                       |
                       v
             AI-Generated Explanation
                       |
                       v
                      User
```

### Architecture principles
- Keep financial arithmetic in tested code, not in free-form model responses.
- Give the model only the tools and data required for the current task.
- Validate tool inputs and outputs.
- Enforce authentication and user-level data access on the backend/database.
- Require confirmation for imports and consequential changes.
- Log relevant system errors without unnecessarily logging sensitive financial details.

## 11. Initial Database Entities

A first version may include the following tables:

### `profiles`
- `id`
- `display_name`
- `currency`
- `income_frequency`
- `preferences`
- `created_at`

### `transactions`
- `id`
- `user_id`
- `type` (income or expense)
- `amount`
- `currency`
- `description`
- `category`
- `transaction_date`
- `source` (manual, conversational, or import)
- `created_at`

### `budgets`
- `id`
- `user_id`
- `category`
- `period_start`
- `period_end`
- `planned_amount`
- `created_at`

### `goals`
- `id`
- `user_id`
- `name`
- `target_amount`
- `current_amount` or a value derived from recorded contributions
- `target_date`
- `status`
- `created_at`

### `alerts`
- `id`
- `user_id`
- `type`
- `message`
- `status`
- `created_at`

### `conversation_memory`
- `id`
- `user_id`
- `memory_type`
- `content`
- `updated_at`

This is an initial conceptual schema. Before implementation, define currency handling, validation rules, transaction corrections/deletions, recurring commitments, import batches, and whether goal contributions are represented by transactions or a separate ledger. Enforce row-level access controls wherever supported.

## 12. AI Agent Tools

The language model can select from narrowly scoped tools such as:

- `add_transaction`
- `parse_transaction_message`
- `categorize_transaction`
- `get_transaction_summary`
- `get_budget_status`
- `create_budget_draft`
- `calculate_affordability`
- `forecast_month_end`
- `run_what_if_scenario`
- `create_savings_plan`
- `get_goal_progress`
- `generate_financial_summary`
- `create_alert_draft`

Each tool must validate its inputs, apply authorization checks, and return structured data. Write operations should require confirmation where appropriate. A tool should never expose another user's financial records.

## 13. Privacy, Security, and Responsible Use

- Never request or store bank passwords, card PINs, or OTPs.
- Use secure authentication and server-side authorization.
- Restrict each user to their own records.
- Validate uploads and limit accepted file types and sizes.
- Preview imports and detect potential duplicates before saving.
- Protect secrets with environment variables and never commit API keys.
- Minimize sensitive data in logs and model prompts.
- Explain assumptions and uncertainty in forecasts.
- Make recommendations transparent and non-judgmental.
- Provide data export and deletion controls.
- Do not initiate bank transfers, investments, loans, or other financial transactions.
- Position the product as a budgeting and financial-education assistant, not a substitute for a qualified financial professional.

## 14. Development Roadmap

### Phase 1 — Foundation
- Define requirements and UI wireframes.
- Create the application and repository.
- Set up authentication and database schema.
- Build transaction entry, editing, and listing.
- Implement core financial calculations with tests.

### Phase 2 — Budgeting and Goals
- Create category budgets.
- Add budget status and progress charts.
- Implement savings goals and goal calculations.
- Add a basic dashboard.

### Phase 3 — AI Coach
- Integrate the selected model.
- Implement structured tool calling.
- Add conversational expense parsing with confirmation.
- Answer budget and transaction questions using verified data.
- Add affordability analysis.

### Phase 4 — Import and Insights
- Add CSV import preview and validation.
- Add category suggestions and duplicate detection.
- Implement spending comparisons and initial forecasting.
- Clearly label estimates and their assumptions.

### Phase 5 — Agent Capabilities
- Add what-if simulations.
- Add configurable proactive alerts.
- Add Financial Emergency Mode.
- Add user-controlled financial memory.
- Generate weekly/monthly reports.

### Phase 6 — Quality and Deployment
- Test calculations and edge cases.
- Test authentication and data isolation.
- Test malformed files, duplicate transactions, and missing data.
- Test model hallucination resistance and tool authorization.
- Improve accessibility, mobile responsiveness, and error messages.
- Deploy a demo using synthetic or explicitly consented test data.

## 15. MVP Acceptance Criteria

The first release is ready for demonstration when:

- A user can securely sign in and access only their own data.
- A user can add, edit, and delete transactions.
- A user can create and review a monthly budget.
- The system can calculate budget utilization accurately.
- The user can create a savings goal and see its progress.
- The AI can answer basic financial questions using actual stored records.
- Conversational expense entry asks for clarification when details are ambiguous.
- CSV import previews and validates records before saving.
- The affordability checker accounts for upcoming essential expenses supplied by the user.
- What-if calculations are reproducible and testable.
- Forecasts are labeled as estimates and disclose important assumptions.
- The user can review and approve proposed changes.
- User data access is protected and tested.

## 16. Evaluation Metrics

Possible project evaluation measures include:
- Accuracy of financial calculations against test cases.
- Correctness of transaction extraction and category suggestions.
- Percentage of imported rows correctly parsed.
- Duplicate-detection performance.
- Relevance and factual grounding of AI responses.
- Forecast error on suitable historical/test datasets.
- Tool-call success and failure rates.
- Response latency and model cost.
- Security tests for cross-user data access.
- User feedback on clarity and usefulness.

Do not claim high predictive accuracy until it has been measured on appropriate test data.

## 17. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| AI invents balances or expenses | Ground responses in database/tool results; validate outputs |
| Incorrect transaction extraction | Show a confirmation preview before saving |
| Unreliable forecasts | Display assumptions, uncertainty, and data limitations |
| Inaccurate CSV formats | Use mapping, validation, and row-level error reporting |
| Excessive alerts | Let users configure thresholds and notification frequency |
| Financial data exposure | Strong authorization, row-level security, and minimal logging |
| Scope becomes too large | Deliver the MVP first and add advanced features incrementally |
| Model/API cost or limits | Use a provider-independent model adapter and control token usage |

## 18. Future Enhancements

Potential extensions after the core application is stable:
- Voice-based transaction entry.
- English, Hindi, and Marathi interactions.
- Receipt OCR.
- Recurring bill and subscription detection.
- Variable-income planning.
- Shared budgets for roommates or families.
- Calendar reminders.
- Optional integrations with regulated financial-data providers, subject to availability, consent, security, and applicable requirements.

These are future options, not requirements for the initial release.

## 19. Project Summary

The **Personal Budget Coach Agent** combines transaction management, personalized budgeting, conversational AI, financial calculations, forecasting, and user-approved proactive assistance in one application.

Its main differentiator is not simply tracking money. It helps users understand their financial position, compare choices before acting, anticipate possible shortfalls, and follow a practical plan toward their goals.

**Guiding principle:** Make financial decisions clearer, safer, and more manageable—without taking control away from the user.
