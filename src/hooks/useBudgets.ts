import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { calculateBudgetStatus } from '../utils/calculations';

export function useBudgets() {
  const budgets = useStore((s) => s.budgets);
  const categories = useStore((s) => s.categories);
  const transactions = useStore((s) => s.transactions);
  const selectedMonth = useStore((s) => s.selectedMonth);

  const budgetAnalysis = useMemo(() => {
    return calculateBudgetStatus(budgets, categories, transactions, selectedMonth);
  }, [budgets, categories, transactions, selectedMonth]);

  return {
    selectedMonth,
    ...budgetAnalysis,
  };
}
