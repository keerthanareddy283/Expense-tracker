import React from 'react';
import {
  RefreshCw,
  Plus,
  Play,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '../../utils/formatters';

export const RecurringView: React.FC = () => {
  const recurring = useStore((s) => s.recurring);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const openAddRecurringModal = useStore((s) => s.openAddRecurringModal);
  const toggleRecurringActive = useStore((s) => s.toggleRecurringActive);
  const deleteRecurring = useStore((s) => s.deleteRecurring);
  const checkAndProcessRecurring = useStore((s) => s.checkAndProcessRecurring);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  let totalMonthlyExpense = 0;
  let totalMonthlyIncome = 0;
  let activeCount = 0;

  for (const r of recurring) {
    if (r.isActive) {
      activeCount++;
      if (r.type === 'expense') totalMonthlyExpense += r.amount;
      else totalMonthlyIncome += r.amount;
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Recurring Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automate monthly salary, subscriptions, utilities, and rent
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Play className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={checkAndProcessRecurring}
          >
            Check & Auto-Post
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
            onClick={() => openAddRecurringModal()}
          >
            New Schedule
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Active Schedules
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {activeCount} of {recurring.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Managed automatically</p>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Recurring Income / mo
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(totalMonthlyIncome, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Salary & steady retainers</p>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Recurring Expenses / mo
          </span>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
            -{formatCurrency(totalMonthlyExpense, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Rent, internet, bills & subscriptions</p>
        </Card>
      </div>

      {/* Recurring Items List */}
      {recurring.length === 0 ? (
        <Card padding="md">
          <EmptyState
            icon={RefreshCw}
            title="No recurring schedules"
            description="Add recurring monthly entries for salary, rent, subscriptions, or broadband so you never have to manually enter them."
            actionLabel="Schedule Recurring Item"
            onAction={() => openAddRecurringModal()}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurring.map((item) => {
            const cat = categoryMap.get(item.categoryId) || {
              id: item.categoryId,
              name: 'Other',
              icon: 'MoreHorizontal',
              color: '#64748b',
              type: 'expense' as const,
            };
            const isIncome = item.type === 'income';
            const method = PAYMENT_METHOD_LABELS[item.paymentMethod];

            return (
              <Card
                key={item.id}
                padding="md"
                hoverEffect
                className={`flex flex-col justify-between transition-opacity ${
                  item.isActive ? '' : 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {cat.name} · {method?.label}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Active */}
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isActive}
                          onChange={() => toggleRecurringActive(item.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>

                  {item.note && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                      {item.note}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Every month on day {item.dayOfMonth}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Next due: {formatDate(item.nextDueDate, 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span
                    className={`text-base font-extrabold tabular-nums ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(item.amount, currency)}
                    <span className="text-xs font-normal text-slate-400"> / mo</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openAddRecurringModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit schedule"
                      aria-label="Edit schedule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteRecurring(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete schedule"
                      aria-label="Delete schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
