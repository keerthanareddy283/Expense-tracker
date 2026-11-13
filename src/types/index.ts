export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month?: string; // YYYY-MM, or default for all months
  alertThreshold?: number; // e.g. 80 for 80%
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  note: string;
  frequency: 'monthly';
  dayOfMonth: number; // 1-31
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  lastGeneratedDate?: string;
  isActive: boolean;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export interface UserSettings {
  currency: CurrencyCode;
  theme: 'system' | 'light' | 'dark';
  compactMode: boolean;
  hasSeededData: boolean;
  notificationsEnabled: boolean;
}

export interface AppData {
  version: number;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  settings: UserSettings;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage 0 - 100
  previousMonth: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
  incomeMoMChange: number; // % change
  expensesMoMChange: number; // % change
  savingsMoMChange: number; // % change
  savingsRateMoMChange: number; // percentage point difference
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  count: number;
  budgetLimit?: number;
}

export interface DailySpending {
  date: string; // YYYY-MM-DD
  day: number; // 1-31
  expense: number;
  income: number;
}

export interface MonthlyTrend {
  month: string; // YYYY-MM
  label: string; // "Jan '26"
  income: number;
  expenses: number;
  savings: number;
}

export interface FinancialInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'neutral';
  title: string;
  description: string;
  metric?: string;
  category?: string;
  impactScore?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  undoAction?: () => void;
  duration?: number;
}
