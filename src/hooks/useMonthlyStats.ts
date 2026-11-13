import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  calculate6MonthTrend,
  calculateCategorySpending,
  calculateDailySpending,
  calculateMonthlyStats,
  generateFinancialInsights,
} from '../utils/calculations';

export function useMonthlyStats() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const budgets = useStore((s) => s.budgets);
  const selectedMonth = useStore((s) => s.selectedMonth);

  const stats = useMemo(() => {
    return calculateMonthlyStats(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategorySpending(transactions, categories, selectedMonth, budgets);
  }, [transactions, categories, selectedMonth, budgets]);

  const dailyTrend = useMemo(() => {
    return calculateDailySpending(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const sixMonthTrend = useMemo(() => {
    return calculate6MonthTrend(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const insights = useMemo(() => {
    return generateFinancialInsights(transactions, categories, budgets, selectedMonth);
  }, [transactions, categories, budgets, selectedMonth]);

  return {
    selectedMonth,
    stats,
    categoryBreakdown,
    dailyTrend,
    sixMonthTrend,
    insights,
  };
}
