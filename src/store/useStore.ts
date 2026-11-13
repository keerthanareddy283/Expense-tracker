import { create } from 'zustand';
import {
  AppData,
  Budget,
  Category,
  CurrencyCode,
  PaymentMethod,
  RecurringTransaction,
  ToastMessage,
  Transaction,
  TransactionType,
  UserSettings,
} from '../types';
import {
  exportDataAsJSON,
  exportTransactionsToCSV,
  importDataFromJSON,
  loadAppData,
  resetAppData,
  saveAppData,
} from '../lib/storage';
import { getMonthKey } from '../utils/formatters';
import { addMonths, subMonths, format } from 'date-fns';
import { processRecurringRules } from '../utils/calculations';

interface StoreState {
  // Data
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  settings: UserSettings;

  // Navigation & Time scope
  selectedMonth: string; // YYYY-MM
  activeTab: 'dashboard' | 'transactions' | 'budgets' | 'insights' | 'recurring' | 'settings';
  isSidebarCollapsed: boolean;

  // Undo history for delete
  lastDeletedTransaction: Transaction | null;

  // UI Modals
  isTxModalOpen: boolean;
  editingTransaction: Transaction | null;
  isBudgetModalOpen: boolean;
  editingBudget: Budget | null;
  isRecurringModalOpen: boolean;
  editingRecurring: RecurringTransaction | null;
  isCategoryModalOpen: boolean;
  isConfirmResetModalOpen: boolean;

  // Filter & Search states for Transactions view
  searchQuery: string;
  filterType: 'all' | TransactionType;
  filterCategory: string;
  filterPaymentMethod: 'all' | PaymentMethod;
  filterDateRange: 'month' | '30days' | 'all';
  sortField: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;

  // Toasts
  toasts: ToastMessage[];

  // Actions
  init: () => void;
  setActiveTab: (tab: StoreState['activeTab']) => void;
  toggleSidebar: () => void;
  setSelectedMonth: (month: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  resetToCurrentMonth: () => void;

  // Transaction Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoDelete: () => void;

  // Category Actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budget Actions
  setBudget: (categoryId: string, monthlyLimit: number, alertThreshold?: number) => void;
  deleteBudget: (id: string) => void;

  // Recurring Actions
  addRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
  toggleRecurringActive: (id: string) => void;
  deleteRecurring: (id: string) => void;
  checkAndProcessRecurring: () => void;

  // Settings Actions
  setCurrency: (code: CurrencyCode) => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  resetAllData: (withSeed: boolean) => void;
  importJSON: (jsonString: string) => { success: boolean; error?: string };
  exportJSON: () => string;
  exportCSV: () => string;

  // Modal controls
  openAddTxModal: () => void;
  openEditTxModal: (tx: Transaction) => void;
  closeTxModal: () => void;
  openAddBudgetModal: (budget?: Budget) => void;
  closeBudgetModal: () => void;
  openAddRecurringModal: (rec?: RecurringTransaction) => void;
  closeRecurringModal: () => void;
  setIsCategoryModalOpen: (open: boolean) => void;
  setIsConfirmResetModalOpen: (open: boolean) => void;

  // Filter setters
  setSearchQuery: (query: string) => void;
  setFilterType: (type: 'all' | TransactionType) => void;
  setFilterCategory: (categoryId: string) => void;
  setFilterPaymentMethod: (pm: 'all' | PaymentMethod) => void;
  setFilterDateRange: (range: 'month' | '30days' | 'all') => void;
  setSort: (field: 'date' | 'amount') => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;

  // Toast actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const initialData = loadAppData();

export const useStore = create<StoreState>((set, get) => ({
  transactions: initialData.transactions,
  categories: initialData.categories,
  budgets: initialData.budgets,
  recurring: initialData.recurring,
  settings: initialData.settings,

  // Default month: set to latest transaction month or current month (2026-11)
  selectedMonth: '2026-11',
  activeTab: 'dashboard',
  isSidebarCollapsed: false,

  lastDeletedTransaction: null,

  isTxModalOpen: false,
  editingTransaction: null,
  isBudgetModalOpen: false,
  editingBudget: null,
  isRecurringModalOpen: false,
  editingRecurring: null,
  isCategoryModalOpen: false,
  isConfirmResetModalOpen: false,

  searchQuery: '',
  filterType: 'all',
  filterCategory: 'all',
  filterPaymentMethod: 'all',
  filterDateRange: 'month',
  sortField: 'date',
  sortOrder: 'desc',
  currentPage: 1,
  itemsPerPage: 10,

  toasts: [],

  init: () => {
    // Process any due recurring transactions immediately
    get().checkAndProcessRecurring();

    // Theme initialization
    const theme = get().settings.theme;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),

  setSelectedMonth: (month) => set({ selectedMonth: month, currentPage: 1 }),
  prevMonth: () => {
    const current = get().selectedMonth;
    const [year, month] = current.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    const prev = format(subMonths(d, 1), 'yyyy-MM');
    set({ selectedMonth: prev, currentPage: 1 });
  },
  nextMonth: () => {
    const current = get().selectedMonth;
    const [year, month] = current.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    const next = format(addMonths(d, 1), 'yyyy-MM');
    set({ selectedMonth: next, currentPage: 1 });
  },
  resetToCurrentMonth: () => {
    set({ selectedMonth: getMonthKey(new Date()), currentPage: 1 });
  },

  addTransaction: (data) => {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const updated = [newTx, ...state.transactions];
      saveAppData({
        version: 1,
        transactions: updated,
        categories: state.categories,
        budgets: state.budgets,
        recurring: state.recurring,
        settings: state.settings,
      });
      return { transactions: updated, isTxModalOpen: false, editingTransaction: null };
    });

    get().addToast({
      title: 'Transaction added',
      description: `${data.type === 'income' ? 'Income' : 'Expense'} of ${data.amount} recorded`,
      type: 'success',
    });
  },

  updateTransaction: (id, updates) => {
    set((state) => {
      const updated = state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx
      );
      saveAppData({
        version: 1,
        transactions: updated,
        categories: state.categories,
        budgets: state.budgets,
        recurring: state.recurring,
        settings: state.settings,
      });
      return { transactions: updated, isTxModalOpen: false, editingTransaction: null };
    });

    get().addToast({
      title: 'Transaction updated',
      type: 'success',
    });
  },

  deleteTransaction: (id) => {
    const target = get().transactions.find((t) => t.id === id);
    if (!target) return;

    set((state) => {
      const updated = state.transactions.filter((tx) => tx.id !== id);
      saveAppData({
        version: 1,
        transactions: updated,
        categories: state.categories,
        budgets: state.budgets,
        recurring: state.recurring,
        settings: state.settings,
      });
      return { transactions: updated, lastDeletedTransaction: target };
    });

    get().addToast({
      title: 'Transaction deleted',
      description: target.note || `${target.type} deleted`,
      type: 'info',
      undoAction: () => get().undoDelete(),
      duration: 6000,
    });
  },

  undoDelete: () => {
    const restored = get().lastDeletedTransaction;
    if (!restored) return;

    set((state) => {
      const updated = [restored, ...state.transactions];
      saveAppData({
        version: 1,
        transactions: updated,
        categories: state.categories,
        budgets: state.budgets,
        recurring: state.recurring,
        settings: state.settings,
      });
      return { transactions: updated, lastDeletedTransaction: null };
    });

    get().addToast({
      title: 'Transaction restored',
      type: 'success',
    });
  },

  addCategory: (cat) => {
    const newCat: Category = {
      ...cat,
      id: `cat-custom-${Date.now()}`,
      isCustom: true,
    };
    set((state) => {
      const updated = [...state.categories, newCat];
      saveAppData({
        ...state,
        categories: updated,
        version: 1,
      });
      return { categories: updated };
    });
    get().addToast({ title: `Category "${cat.name}" created`, type: 'success' });
  },

  updateCategory: (id, updates) => {
    set((state) => {
      const updated = state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveAppData({
        ...state,
        categories: updated,
        version: 1,
      });
      return { categories: updated };
    });
    get().addToast({ title: 'Category updated', type: 'success' });
  },

  deleteCategory: (id) => {
    set((state) => {
      // Reassign affected transactions to 'cat-other'
      const updatedTxs = state.transactions.map((tx) =>
        tx.categoryId === id ? { ...tx, categoryId: 'cat-other' } : tx
      );
      const updatedCats = state.categories.filter((c) => c.id !== id);
      const updatedBudgets = state.budgets.filter((b) => b.categoryId !== id);

      saveAppData({
        ...state,
        transactions: updatedTxs,
        categories: updatedCats,
        budgets: updatedBudgets,
        version: 1,
      });
      return { transactions: updatedTxs, categories: updatedCats, budgets: updatedBudgets };
    });
    get().addToast({ title: 'Category deleted', type: 'info' });
  },

  setBudget: (categoryId, monthlyLimit, alertThreshold = 80) => {
    set((state) => {
      const existingIdx = state.budgets.findIndex((b) => b.categoryId === categoryId);
      let updated: Budget[];
      if (existingIdx >= 0) {
        updated = state.budgets.map((b, i) =>
          i === existingIdx ? { ...b, monthlyLimit, alertThreshold } : b
        );
      } else {
        const newBudget: Budget = {
          id: `b-${Date.now()}`,
          categoryId,
          monthlyLimit,
          alertThreshold,
        };
        updated = [...state.budgets, newBudget];
      }
      saveAppData({ ...state, budgets: updated, version: 1 });
      return { budgets: updated, isBudgetModalOpen: false, editingBudget: null };
    });
    get().addToast({ title: 'Budget saved', type: 'success' });
  },

  deleteBudget: (id) => {
    set((state) => {
      const updated = state.budgets.filter((b) => b.id !== id);
      saveAppData({ ...state, budgets: updated, version: 1 });
      return { budgets: updated };
    });
    get().addToast({ title: 'Budget removed', type: 'info' });
  },

  addRecurring: (rec) => {
    const newRec: RecurringTransaction = {
      ...rec,
      id: `rec-${Date.now()}`,
    };
    set((state) => {
      const updated = [...state.recurring, newRec];
      saveAppData({ ...state, recurring: updated, version: 1 });
      return { recurring: updated, isRecurringModalOpen: false, editingRecurring: null };
    });
    get().addToast({ title: 'Recurring transaction scheduled', type: 'success' });
  },

  updateRecurring: (id, updates) => {
    set((state) => {
      const updated = state.recurring.map((r) => (r.id === id ? { ...r, ...updates } : r));
      saveAppData({ ...state, recurring: updated, version: 1 });
      return { recurring: updated, isRecurringModalOpen: false, editingRecurring: null };
    });
    get().addToast({ title: 'Recurring transaction updated', type: 'success' });
  },

  toggleRecurringActive: (id) => {
    set((state) => {
      const target = state.recurring.find((r) => r.id === id);
      const updated = state.recurring.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r));
      saveAppData({ ...state, recurring: updated, version: 1 });
      return { recurring: updated };
    });
  },

  deleteRecurring: (id) => {
    set((state) => {
      const updated = state.recurring.filter((r) => r.id !== id);
      saveAppData({ ...state, recurring: updated, version: 1 });
      return { recurring: updated };
    });
    get().addToast({ title: 'Recurring schedule cancelled', type: 'info' });
  },

  checkAndProcessRecurring: () => {
    const { recurring, transactions } = get();
    const { newTransactions, updatedRecurring } = processRecurringRules(recurring, transactions);

    if (newTransactions.length > 0) {
      set((state) => {
        const combined = [...newTransactions, ...state.transactions];
        saveAppData({
          ...state,
          transactions: combined,
          recurring: updatedRecurring,
          version: 1,
        });
        return { transactions: combined, recurring: updatedRecurring };
      });

      get().addToast({
        title: `${newTransactions.length} recurring entries generated`,
        description: 'Auto-posted according to scheduled frequency',
        type: 'info',
      });
    }
  },

  setCurrency: (code) => {
    set((state) => {
      const updatedSettings: UserSettings = { ...state.settings, currency: code };
      saveAppData({ ...state, settings: updatedSettings, version: 1 });
      return { settings: updatedSettings };
    });
    get().addToast({ title: `Currency changed to ${code}`, type: 'success' });
  },

  setTheme: (theme) => {
    set((state) => {
      const updatedSettings: UserSettings = { ...state.settings, theme };
      saveAppData({ ...state, settings: updatedSettings, version: 1 });

      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return { settings: updatedSettings };
    });
  },

  resetAllData: (withSeed) => {
    const fresh = resetAppData(withSeed);
    set({
      transactions: fresh.transactions,
      categories: fresh.categories,
      budgets: fresh.budgets,
      recurring: fresh.recurring,
      settings: fresh.settings,
      selectedMonth: '2026-11',
      currentPage: 1,
      isConfirmResetModalOpen: false,
    });
    get().addToast({
      title: withSeed ? 'Reset with sample data' : 'All data cleared',
      description: withSeed ? 'Sample data restored' : 'Clean blank ledger initialized',
      type: 'info',
    });
  },

  importJSON: (jsonString) => {
    const res = importDataFromJSON(jsonString);
    if (res.success && res.data) {
      set({
        transactions: res.data.transactions,
        categories: res.data.categories,
        budgets: res.data.budgets,
        recurring: res.data.recurring,
        settings: res.data.settings,
      });
      get().addToast({ title: 'Data successfully restored from JSON', type: 'success' });
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  exportJSON: () => {
    const { transactions, categories, budgets, recurring, settings } = get();
    return exportDataAsJSON({
      version: 1,
      transactions,
      categories,
      budgets,
      recurring,
      settings,
    });
  },

  exportCSV: () => {
    const { transactions, categories } = get();
    return exportTransactionsToCSV(transactions, categories);
  },

  openAddTxModal: () => set({ isTxModalOpen: true, editingTransaction: null }),
  openEditTxModal: (tx) => set({ isTxModalOpen: true, editingTransaction: tx }),
  closeTxModal: () => set({ isTxModalOpen: false, editingTransaction: null }),

  openAddBudgetModal: (budget) => set({ isBudgetModalOpen: true, editingBudget: budget || null }),
  closeBudgetModal: () => set({ isBudgetModalOpen: false, editingBudget: null }),

  openAddRecurringModal: (rec) => set({ isRecurringModalOpen: true, editingRecurring: rec || null }),
  closeRecurringModal: () => set({ isRecurringModalOpen: false, editingRecurring: null }),

  setIsCategoryModalOpen: (open) => set({ isCategoryModalOpen: open }),
  setIsConfirmResetModalOpen: (open) => set({ isConfirmResetModalOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setFilterType: (type) => set({ filterType: type, currentPage: 1 }),
  setFilterCategory: (categoryId) => set({ filterCategory: categoryId, currentPage: 1 }),
  setFilterPaymentMethod: (pm) => set({ filterPaymentMethod: pm, currentPage: 1 }),
  setFilterDateRange: (range) => set({ filterDateRange: range, currentPage: 1 }),
  setSort: (field) =>
    set((s) => ({
      sortField: field,
      sortOrder: s.sortField === field && s.sortOrder === 'desc' ? 'asc' : 'desc',
      currentPage: 1,
    })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 4500);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
