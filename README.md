# SpendWise — Personal Expense & Budget Tracker

SpendWise is a production-grade personal finance dashboard built with React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Framer Motion. It delivers a modern fintech experience with real-time analytics, category budgeting, recurring automation, and algorithmic plain-language financial insights.

---

## 1. Features

- **Transaction Management**: Record, edit, and delete transactions with amount, type (Expense/Income), category, date, merchant/note, payment method (UPI, Card, Bank Transfer, Cash), and recurring frequency.
- **Interactive Fintech Dashboard**:
  - 4 Key Metric Cards (Total Net Balance, Income this month, Expenses this month, Savings rate %) with Month-over-Month (MoM) comparison percentages and smooth count-up animations.
  - Spending by category donut chart with interactive hover breakdown and center total.
  - 6-month historical cash flow bar chart (Income vs Expenses).
  - Daily spending velocity area chart for the selected month.
  - Recent transactions list (last 5) with quick edit/delete actions.
- **Transactions Ledger**:
  - Full-featured data table on desktop with search, multi-filters (type, category, payment method, date range), column sorting (date, amount), and pagination.
  - Day-grouped mobile list view with daily net subtotals.
  - Export ledger to standard CSV.
- **Category Budgets**:
  - Monthly spending limits per category.
  - Dynamic progress bars with color shifts: normal (emerald), warning at 80% (amber), and overrun at 100% (rose).
  - Explicit "Left to spend" or "Overspent by" figures.
  - Overall budget health indicators.
- **Algorithmic Financial Insights**:
  - Rule-based plain-language insights computed from user data (e.g., savings rate health, top expense category, category surge/drop alerts, budget overrun alerts, payment channel habits).
  - Month-over-Month category drift table with absolute and percentage shifts.
- **Recurring Transactions**:
  - Automated monthly recurring expenses and income (rent, salary, streaming bundles, broadband).
  - Background auto-generation on due dates with next-cycle updates.
- **Multi-Currency Support**:
  - Formatter supporting INR (₹), USD ($), EUR (€), GBP (£), CAD ($), AUD ($), and JPY (¥) using `Intl.NumberFormat`.
- **Data Tools & Offline Persistence**:
  - Offline-first versioned storage in `localStorage` (`src/lib/storage.ts`).
  - Full JSON backup export and schema-validated JSON import.
  - One-click restore of 60–90 days realistic sample dataset or clean slate reset.
- **Accessibility & UX**:
  - Light / Dark theme with persistence and system mode support.
  - Responsive layout (collapsible desktop sidebar + sticky header + mobile bottom sheet & tab bar + FAB).
  - Toast notifications with instant **Undo** on deletion.
  - Accessible tables with ARIA labels and screen-reader alternatives for charts.

---

## 2. Project Architecture

```
/src
├── components/
│   ├── common/
│   │   └── CategoryIcon.tsx        # Dynamic Lucide icon resolver
│   ├── layout/
│   │   ├── Header.tsx              # Sticky header with month switcher & currency
│   │   ├── Sidebar.tsx             # Collapsible desktop navigation
│   │   └── MobileBottomNav.tsx     # Mobile bottom bar & floating action button (FAB)
│   └── ui/
│       ├── AnimatedCounter.tsx     # Micro-interaction number roll animation
│       ├── Badge.tsx               # Status badges
│       ├── Button.tsx              # Styled action buttons (primary/outline/danger)
│       ├── Card.tsx                # Single-elevation surface container
│       ├── EmptyState.tsx          # Zero-data friendly empty states
│       ├── Input.tsx               # Accessible form input with errors
│       ├── Modal.tsx               # Desktop modal & mobile bottom-sheet
│       ├── ProgressBar.tsx         # 80% warning / 100% danger progress indicator
│       ├── Select.tsx              # Form select dropdown
│       └── Toast.tsx               # Notification stack with Undo action
├── features/
│   ├── budgets/
│   │   ├── BudgetModal.tsx         # Set / edit category spending caps
│   │   └── BudgetsView.tsx         # Budget overview & category progress cards
│   ├── dashboard/
│   │   ├── DailyTrendAreaChart.tsx # Daily velocity area chart
│   │   ├── DashboardView.tsx       # Primary analytics dashboard
│   │   ├── IncomeExpenseBarChart.tsx # 6-month cash flow bar chart
│   │   ├── RecentTransactionsList.tsx# Last 5 transactions with quick actions
│   │   ├── SpendingCategoryDonut.tsx # Donut breakdown with interactive legend
│   │   └── SummaryCards.tsx        # Net balance, income, expense, savings rate
│   ├── insights/
│   │   └── InsightsView.tsx        # Rule-based financial takeaways & drift table
│   ├── recurring/
│   │   ├── RecurringModal.tsx      # Add / edit monthly recurring rules
│   │   └── RecurringView.tsx       # Recurring subscriptions & auto-posting
│   ├── settings/
│   │   ├── CategoryManagerModal.tsx# Custom category creation with icon/color picker
│   │   └── SettingsView.tsx        # Currency, theme, category & data management
│   └── transactions/
│       ├── TransactionModal.tsx    # Add / edit transaction modal (auto-focus, chips)
│       └── TransactionsView.tsx    # Search, filters, sort, pagination & table
├── hooks/
│   ├── useBudgets.ts               # Memoized budget calculations
│   ├── useMonthlyStats.ts          # Memoized monthly totals, charts & insights
│   └── useTransactions.ts          # Search, filter, sort & day grouping logic
├── lib/
│   ├── seedData.ts                 # 60-90 days lifelike sample transactions
│   └── storage.ts                  # Versioned storage layer (v1) & CSV/JSON handlers
├── store/
│   └── useStore.ts                 # Zustand reactive state store
├── types/
│   └── index.ts                    # Strict TypeScript data models
├── utils/
│   ├── calculations.ts             # Pure mathematical aggregations & insight logic
│   └── formatters.ts               # Intl.NumberFormat and date-fns formatters
├── App.tsx
├── index.css
└── main.tsx
```

---

## 3. How to Replace LocalStorage with a Real API

SpendWise isolates all persistence inside `src/lib/storage.ts` and the Zustand store (`src/store/useStore.ts`). To transition from `localStorage` to a REST or GraphQL backend:

1. **Create an API client** (`src/lib/api.ts`):
   ```typescript
   const API_BASE = '/api';

   export const api = {
     getTransactions: async (month?: string) => {
       const res = await fetch(`${API_BASE}/transactions?month=${month}`);
       return res.json();
     },
     createTransaction: async (data: Omit<Transaction, 'id'>) => {
       const res = await fetch(`${API_BASE}/transactions`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data),
       });
       return res.json();
     },
     deleteTransaction: async (id: string) => {
       await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
     },
     // ... getBudgets, setBudget, getRecurring, etc.
   };
   ```

2. **Update `src/store/useStore.ts`**:
   Replace synchronous `localStorage` updates with asynchronous API calls or React Query / SWR hooks:
   ```typescript
   addTransaction: async (data) => {
     const newTx = await api.createTransaction(data);
     set((state) => ({ transactions: [newTx, ...state.transactions] }));
   }
   ```

3. **Backend Database Schema**:
   The TypeScript interfaces in `src/types/index.ts` map 1:1 to SQL tables (e.g., PostgreSQL with Drizzle/Prisma) or document collections (e.g., Firestore/MongoDB).

---

## 4. Next Ideas & Roadmap

1. **Multi-User Accounts & Cloud Sync**: Firebase Auth or OAuth 2.0 with PostgreSQL row-level security.
2. **Receipt & Invoice OCR**: Upload receipt photos, extracting merchant, date, tax, and line items with Gemini Vision API.
3. **Open Banking & Bank Feed Sync**: Plaid / Salt Edge integration for automated bank transaction feeds.
4. **Live Multi-Currency Conversion**: Fetch real-time foreign exchange rates for foreign currency transactions.
5. **Split Expenses & Debt Tracking**: Split bills with friends and calculate net balances (Splitwise-style).
