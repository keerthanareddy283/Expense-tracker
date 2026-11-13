import { AppData, Category, Transaction } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_BUDGETS,
  INITIAL_RECURRING,
  INITIAL_SETTINGS,
  generateSeedTransactions,
} from './seedData';

export const STORAGE_KEY = 'spendwise_app_data_v1';
export const CURRENT_SCHEMA_VERSION = 1;

export function getInitialAppData(): AppData {
  return {
    version: CURRENT_SCHEMA_VERSION,
    transactions: generateSeedTransactions(),
    categories: INITIAL_CATEGORIES,
    budgets: INITIAL_BUDGETS,
    recurring: INITIAL_RECURRING,
    settings: INITIAL_SETTINGS,
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppData();
      saveAppData(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<AppData>;

    // Schema version check and migration hook
    if (!parsed.version || parsed.version < CURRENT_SCHEMA_VERSION) {
      console.info(`Migrating schema from v${parsed.version || 0} to v${CURRENT_SCHEMA_VERSION}`);
      const migrated: AppData = {
        version: CURRENT_SCHEMA_VERSION,
        transactions: parsed.transactions || [],
        categories: parsed.categories?.length ? parsed.categories : INITIAL_CATEGORIES,
        budgets: parsed.budgets || INITIAL_BUDGETS,
        recurring: parsed.recurring || INITIAL_RECURRING,
        settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
      };
      saveAppData(migrated);
      return migrated;
    }

    return {
      version: CURRENT_SCHEMA_VERSION,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? parsed.categories
        : INITIAL_CATEGORIES,
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : INITIAL_BUDGETS,
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : INITIAL_RECURRING,
      settings: {
        ...INITIAL_SETTINGS,
        ...(parsed.settings || {}),
      },
    };
  } catch (err) {
    console.error('Failed to parse localStorage data, resetting to fresh seed:', err);
    const fallback = getInitialAppData();
    saveAppData(fallback);
    return fallback;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

export function resetAppData(withSeed: boolean = true): AppData {
  const fresh: AppData = {
    version: CURRENT_SCHEMA_VERSION,
    transactions: withSeed ? generateSeedTransactions() : [],
    categories: INITIAL_CATEGORIES,
    budgets: withSeed ? INITIAL_BUDGETS : [],
    recurring: withSeed ? INITIAL_RECURRING : [],
    settings: {
      ...INITIAL_SETTINGS,
      hasSeededData: withSeed,
    },
  };
  saveAppData(fresh);
  return fresh;
}

export function exportDataAsJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importDataFromJSON(
  jsonString: string
): { success: boolean; error?: string; data?: AppData } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }

    if (!Array.isArray(parsed.transactions)) {
      return { success: false, error: 'Missing or invalid "transactions" array' };
    }

    const validated: AppData = {
      version: CURRENT_SCHEMA_VERSION,
      transactions: parsed.transactions.map((tx: any, idx: number) => ({
        id: tx.id || `tx-imp-${Date.now()}-${idx}`,
        amount: Number(tx.amount) || 0,
        type: tx.type === 'income' ? 'income' : 'expense',
        categoryId: tx.categoryId || 'cat-other',
        date: tx.date || new Date().toISOString().slice(0, 10),
        note: String(tx.note || ''),
        paymentMethod: ['cash', 'card', 'upi', 'bank_transfer'].includes(tx.paymentMethod)
          ? tx.paymentMethod
          : 'card',
        createdAt: tx.createdAt || new Date().toISOString(),
        updatedAt: tx.updatedAt || new Date().toISOString(),
      })),
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? parsed.categories
        : INITIAL_CATEGORIES,
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
      settings: {
        ...INITIAL_SETTINGS,
        ...(parsed.settings || {}),
      },
    };

    saveAppData(validated);
    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse JSON file' };
  }
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[]
): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Note', 'ID'];
  const rows = transactions.map((tx) => [
    `"${tx.date}"`,
    `"${tx.type.toUpperCase()}"`,
    `"${categoryMap.get(tx.categoryId) || 'Other'}"`,
    tx.amount.toFixed(2),
    `"${tx.paymentMethod.replace('_', ' ').toUpperCase()}"`,
    `"${(tx.note || '').replace(/"/g, '""')}"`,
    `"${tx.id}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
