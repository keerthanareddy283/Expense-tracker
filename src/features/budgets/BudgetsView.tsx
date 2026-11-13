import React from 'react';
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit2,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { useBudgets } from '../../hooks/useBudgets';
import { useStore } from '../../store/useStore';
import { formatCurrency, getMonthLabel } from '../../utils/formatters';

export const BudgetsView: React.FC = () => {
  const {
    items,
    totalBudgeted,
    totalSpent,
    overallPercentage,
    overspentCount,
    selectedMonth,
  } = useBudgets();

  const currency = useStore((s) => s.settings.currency);
  const openAddBudgetModal = useStore((s) => s.openAddBudgetModal);
  const categories = useStore((s) => s.categories);
  const budgets = useStore((s) => s.budgets);

  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const unbudgetedCategories = categories.filter(
    (c) => (c.type === 'expense' || c.type === 'both') && !budgetedCategoryIds.has(c.id)
  );

  const totalRemaining = totalBudgeted - totalSpent;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Category Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Spending targets and limits for {getMonthLabel(selectedMonth)}
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
          onClick={() => openAddBudgetModal()}
        >
          New Budget
        </Button>
      </div>

      {/* Aggregate Budget Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Total Budgeted
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalBudgeted, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Across {items.length} categories</p>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Total Spent
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalSpent, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-1 tabular-nums">
            {overallPercentage.toFixed(1)}% of aggregate budget
          </p>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Left to Spend
          </span>
          <p
            className={`text-2xl font-extrabold tabular-nums ${
              totalRemaining >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(totalRemaining, currency, { showSign: true })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {totalRemaining >= 0 ? 'Remaining buffer' : 'Over aggregate budget'}
          </p>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Budget Health
          </span>
          <div className="flex items-center gap-2 mt-1">
            {overspentCount > 0 ? (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>{overspentCount} Overspent</span>
              </div>
            ) : overallPercentage > 80 ? (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Approaching Limits</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>Healthy Pace</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Monitored in real-time</p>
        </Card>
      </div>

      {/* Main Budgets Grid */}
      {items.length === 0 ? (
        <Card padding="md">
          <EmptyState
            icon={Target}
            title="No budgets created yet"
            description="Establish monthly spending caps for your essential categories like Food, Rent, or Shopping to prevent overspending."
            actionLabel="Create First Budget"
            onAction={() => openAddBudgetModal()}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isExceeded = item.status === 'exceeded';
            const isWarning = item.status === 'warning';

            return (
              <Card
                key={item.budget.id}
                padding="md"
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div>
                  {/* Category Header & Status badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.category.color }}
                      >
                        <CategoryIcon name={item.category.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          {item.category.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {item.txCount} {item.txCount === 1 ? 'transaction' : 'transactions'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isExceeded ? (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/60">
                          Exceeded
                        </span>
                      ) : isWarning ? (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/60">
                          Near Limit
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/60">
                          On Track
                        </span>
                      )}

                      <button
                        onClick={() => openAddBudgetModal(item.budget)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit budget limit"
                        aria-label="Edit budget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar with amber at 80% and red at 100% */}
                  <div className="space-y-1.5 my-3">
                    <ProgressBar
                      value={item.percentage}
                      warningThreshold={item.budget.alertThreshold || 80}
                      dangerThreshold={100}
                      height="md"
                    />
                  </div>
                </div>

                {/* Numbers: Spent, Limit, and Left to spend */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Spent / Cap
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {formatCurrency(item.spent, currency)} / {formatCurrency(item.budget.monthlyLimit, currency)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      {item.remaining >= 0 ? 'Left to Spend' : 'Overspent by'}
                    </span>
                    <span
                      className={`font-black text-sm tabular-nums ${
                        item.remaining >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(item.remaining), currency)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unbudgeted categories recommendation section */}
      {unbudgetedCategories.length > 0 && (
        <Card padding="md" className="border-dashed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Unbudgeted Categories ({unbudgetedCategories.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add spending limits for other active expense categories
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {unbudgetedCategories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => openAddBudgetModal({ id: '', categoryId: c.id, monthlyLimit: 5000 })}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
