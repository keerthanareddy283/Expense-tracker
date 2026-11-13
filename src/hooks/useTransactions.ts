import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { subDays, parseISO, isAfter } from 'date-fns';
import { Transaction } from '../types';

export function useTransactions() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const selectedMonth = useStore((s) => s.selectedMonth);

  const searchQuery = useStore((s) => s.searchQuery);
  const filterType = useStore((s) => s.filterType);
  const filterCategory = useStore((s) => s.filterCategory);
  const filterPaymentMethod = useStore((s) => s.filterPaymentMethod);
  const filterDateRange = useStore((s) => s.filterDateRange);
  const sortField = useStore((s) => s.sortField);
  const sortOrder = useStore((s) => s.sortOrder);
  const currentPage = useStore((s) => s.currentPage);
  const itemsPerPage = useStore((s) => s.itemsPerPage);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const thirtyDaysAgo = subDays(new Date(), 30);

    return transactions.filter((tx) => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && tx.categoryId !== filterCategory) {
        return false;
      }

      // Payment method filter
      if (filterPaymentMethod !== 'all' && tx.paymentMethod !== filterPaymentMethod) {
        return false;
      }

      // Date range filter
      if (filterDateRange === 'month') {
        if (!tx.date.startsWith(selectedMonth)) {
          return false;
        }
      } else if (filterDateRange === '30days') {
        try {
          const txDate = parseISO(tx.date);
          if (!isAfter(txDate, thirtyDaysAgo)) {
            return false;
          }
        } catch {
          return false;
        }
      }

      // Search query (note, category name, amount)
      if (query) {
        const cat = categoryMap.get(tx.categoryId);
        const catName = cat?.name.toLowerCase() || '';
        const noteMatch = tx.note.toLowerCase().includes(query);
        const amountMatch = tx.amount.toString().includes(query);
        const catMatch = catName.includes(query);
        if (!noteMatch && !amountMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    selectedMonth,
    searchQuery,
    filterType,
    filterCategory,
    filterPaymentMethod,
    filterDateRange,
    categoryMap,
  ]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === 'date') {
        const cmp = a.date.localeCompare(b.date);
        return sortOrder === 'desc' ? -cmp : cmp;
      }
      if (sortField === 'amount') {
        const diff = a.amount - b.amount;
        return sortOrder === 'desc' ? -diff : diff;
      }
      return 0;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // Grouped by date for mobile view or daily breakdown
  const groupedByDay = useMemo(() => {
    const groups: { date: string; transactions: Transaction[]; totalExpense: number; totalIncome: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    for (const tx of sortedTransactions) {
      if (!dateMap.has(tx.date)) {
        dateMap.set(tx.date, []);
      }
      dateMap.get(tx.date)!.push(tx);
    }

    for (const [date, txs] of dateMap.entries()) {
      let totalExpense = 0;
      let totalIncome = 0;
      for (const t of txs) {
        if (t.type === 'expense') totalExpense += t.amount;
        else totalIncome += t.amount;
      }
      groups.push({ date, transactions: txs, totalExpense, totalIncome });
    }

    return groups;
  }, [sortedTransactions]);

  return {
    filteredTransactions,
    sortedTransactions,
    paginatedTransactions,
    groupedByDay,
    totalCount: filteredTransactions.length,
    totalPages,
    currentPage,
    itemsPerPage,
    categoryMap,
  };
}
