import React from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  ReceiptText,
  Calendar,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTransactions } from '../../hooks/useTransactions';
import { useStore } from '../../store/useStore';
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
} from '../../utils/formatters';
import { downloadFile } from '../../lib/storage';
import { PaymentMethod, TransactionType } from '../../types';

export const TransactionsView: React.FC = () => {
  const {
    filteredTransactions,
    paginatedTransactions,
    groupedByDay,
    totalCount,
    totalPages,
    currentPage,
    itemsPerPage,
    categoryMap,
  } = useTransactions();

  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const filterType = useStore((s) => s.filterType);
  const setFilterType = useStore((s) => s.setFilterType);
  const filterCategory = useStore((s) => s.filterCategory);
  const setFilterCategory = useStore((s) => s.setFilterCategory);
  const filterPaymentMethod = useStore((s) => s.filterPaymentMethod);
  const setFilterPaymentMethod = useStore((s) => s.setFilterPaymentMethod);
  const filterDateRange = useStore((s) => s.filterDateRange);
  const setFilterDateRange = useStore((s) => s.setFilterDateRange);
  const sortField = useStore((s) => s.sortField);
  const sortOrder = useStore((s) => s.sortOrder);
  const setSort = useStore((s) => s.setSort);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const setItemsPerPage = useStore((s) => s.setItemsPerPage);

  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const openAddTxModal = useStore((s) => s.openAddTxModal);
  const openEditTxModal = useStore((s) => s.openEditTxModal);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const exportCSV = useStore((s) => s.exportCSV);

  const handleExportCSV = () => {
    const csvContent = exportCSV();
    downloadFile(
      csvContent,
      `spendwise-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterPaymentMethod('all');
    setFilterDateRange('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    filterType !== 'all' ||
    filterCategory !== 'all' ||
    filterPaymentMethod !== 'all' ||
    filterDateRange !== 'month';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View, search, filter, and audit your complete transaction history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
            onClick={openAddTxModal}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card padding="sm" className="space-y-3">
        {/* Search bar & Type pills */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by note, merchant, category, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((pm) => (
                <option key={pm} value={pm}>
                  {PAYMENT_METHOD_LABELS[pm].label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Scope */}
          <div>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="month">Selected Month</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Reset Filters action */}
          <div className="flex items-center justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Transactions Container */}
      {filteredTransactions.length === 0 ? (
        <Card padding="md">
          <EmptyState
            icon={ReceiptText}
            title="No matching transactions"
            description={
              hasActiveFilters
                ? 'No transactions match your current search and filter criteria.'
                : 'You have not added any transactions yet.'
            }
            actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add First Transaction'}
            onAction={hasActiveFilters ? handleClearFilters : openAddTxModal}
          />
        </Card>
      ) : (
        <>
          {/* Desktop Data Table (hidden on small mobile screens) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th
                      scope="col"
                      onClick={() => setSort('date')}
                      className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        {sortField === 'date' && (
                          <span className="text-[10px] text-emerald-600 lowercase font-normal">
                            ({sortOrder})
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-4">Category</th>
                    <th scope="col" className="py-3 px-4">Description / Merchant</th>
                    <th scope="col" className="py-3 px-4">Method</th>
                    <th
                      scope="col"
                      onClick={() => setSort('amount')}
                      className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        {sortField === 'amount' && (
                          <span className="text-[10px] text-emerald-600 lowercase font-normal">
                            ({sortOrder})
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {paginatedTransactions.map((tx) => {
                    const cat = categoryMap.get(tx.categoryId) || {
                      id: tx.categoryId,
                      name: 'Other',
                      icon: 'MoreHorizontal',
                      color: '#64748b',
                      type: 'expense' as const,
                    };
                    const isIncome = tx.type === 'income';
                    const method = PAYMENT_METHOD_LABELS[tx.paymentMethod];

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(tx.date, 'dd MMM yyyy')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: cat.color }}
                            >
                              <CategoryIcon name={cat.icon} className="w-3 h-3" />
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate">
                          {tx.note || '—'}
                          {tx.isRecurring && (
                            <span className="ml-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              Monthly
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                          {method?.label || tx.paymentMethod}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditTxModal(tx)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit"
                              aria-label="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete"
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Grouped By Day List View */}
          <div className="md:hidden space-y-4">
            {groupedByDay.map((group) => (
              <div
                key={group.date}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(group.date, 'EEEE, dd MMM yyyy')}</span>
                  </div>
                  <span className="font-bold tabular-nums text-slate-600 dark:text-slate-400">
                    Net: {formatCurrency(group.totalIncome - group.totalExpense, currency, { showSign: true })}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.transactions.map((tx) => {
                    const cat = categoryMap.get(tx.categoryId) || {
                      id: tx.categoryId,
                      name: 'Other',
                      icon: 'MoreHorizontal',
                      color: '#64748b',
                      type: 'expense' as const,
                    };
                    const isIncome = tx.type === 'income';

                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {tx.note || cat.name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {cat.name} · {tx.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p
                              className={`text-xs font-bold tabular-nums ${
                                isIncome
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(tx.amount, currency)}
                            </p>
                          </div>
                          <button
                            onClick={() => openEditTxModal(tx)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                Showing{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {Math.min(currentPage * itemsPerPage, totalCount)}
                </span>{' '}
                of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> entries
              </span>

              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-2 font-bold tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
