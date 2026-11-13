import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { CurrencyCode, CurrencyConfig, PaymentMethod } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: '$', name: 'Canadian Dollar ($)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: '$', name: 'Australian Dollar ($)', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', locale: 'ja-JP' },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { label: string; iconName: string }> = {
  upi: { label: 'UPI / Instant', iconName: 'Smartphone' },
  card: { label: 'Debit / Credit Card', iconName: 'CreditCard' },
  bank_transfer: { label: 'Bank Transfer', iconName: 'Landmark' },
  cash: { label: 'Cash', iconName: 'Banknote' },
};

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'INR',
  options?: { compact?: boolean; hideSymbol?: boolean; showSign?: boolean }
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const isFractionZero = amount % 1 === 0 || currencyCode === 'JPY';

  if (options?.compact && Math.abs(amount) >= 100000) {
    if (currencyCode === 'INR') {
      // Lakhs and Crores for INR
      const abs = Math.abs(amount);
      const sign = amount < 0 ? '-' : options.showSign && amount > 0 ? '+' : '';
      if (abs >= 10000000) {
        return `${sign}${config.symbol}${(abs / 10000000).toFixed(2)} Cr`;
      }
      return `${sign}${config.symbol}${(abs / 100000).toFixed(2)} L`;
    }
  }

  const formatter = new Intl.NumberFormat(config.locale, {
    style: options?.hideSymbol ? 'decimal' : 'currency',
    currency: config.code,
    minimumFractionDigits: isFractionZero ? 0 : 2,
    maximumFractionDigits: 2,
    signDisplay: options?.showSign ? 'always' : 'auto',
    ...(options?.compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
  });

  return formatter.format(amount);
}

export function formatDate(dateStr: string, formatStr: string = 'dd MMM yyyy'): string {
  try {
    const parsed = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return format(parsed, formatStr);
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    if (isToday(parsed)) {
      return 'Today';
    }
    if (isYesterday(parsed)) {
      return 'Yesterday';
    }
    return format(parsed, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatPercentage(value: number, withSign: boolean = true): string {
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getMonthKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM');
}

export function getMonthLabel(monthKey: string): string {
  try {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy');
  } catch {
    return monthKey;
  }
}
