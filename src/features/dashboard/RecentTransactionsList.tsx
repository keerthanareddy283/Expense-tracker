import React from 'react';
import { ArrowRight, ArrowDownRight, ArrowUpRight, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { formatCurrency, formatRelativeDate, PAYMENT_METHOD_LABELS } from '../../utils/formatters';
import { useStore } from '../../store/useStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { ReceiptText } from 'lucide-react';

export const RecentTransactionsList: React.FC = () => {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const openEditTxModal = useStore((s) => s.openEditTxModal);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const openAddTxModal = useStore((s) => s.openAddTxModal);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Sort descending by date, take top 5
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card padding="md">
        <EmptyState
          icon={ReceiptText}
          title="No transactions yet"
          description="Begin by recording your first expense or income entry."
          actionLabel="Add Transaction"
          onAction={openAddTxModal}
        />
      </Card>
    );
  }

  return (
    <Card padding="md" className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest 5 entries across accounts
          </p>
        </div>
        <button
          onClick={() => setActiveTab('transactions')}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {recent.map((tx) => {
          const cat = categoryMap.get(tx.categoryId) || {
            id: tx.categoryId,
            name: 'Other',
            icon: 'MoreHorizontal',
            color: '#64748b',
            type: 'expense' as const,
          };
          const isIncome = tx.type === 'income';
          const methodInfo = PAYMENT_METHOD_LABELS[tx.paymentMethod];

          return (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {tx.note || cat.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{cat.name}</span>
                    <span>·</span>
                    <span>{formatRelativeDate(tx.date)}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{methodInfo?.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p
                    className={`text-xs sm:text-sm font-bold tabular-nums ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{tx.paymentMethod.replace('_', ' ')}</p>
                </div>

                {/* Hover actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditTxModal(tx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Edit transaction"
                    aria-label="Edit transaction"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete transaction"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
