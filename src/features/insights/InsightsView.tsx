import React from 'react';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatPercentage, getMonthLabel } from '../../utils/formatters';
import { calculateCategorySpending, getPreviousMonthKey } from '../../utils/calculations';

export const InsightsView: React.FC = () => {
  const { insights, selectedMonth, stats } = useMonthlyStats();
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const budgets = useStore((s) => s.budgets);
  const currency = useStore((s) => s.settings.currency);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const prevMonthKey = getPreviousMonthKey(selectedMonth);
  const currentSpending = calculateCategorySpending(transactions, categories, selectedMonth, budgets);
  const prevSpending = calculateCategorySpending(transactions, categories, prevMonthKey, budgets);

  const prevMap = new Map(prevSpending.items.map((c) => [c.categoryId, c.amount]));

  // Month-over-month category shift items
  const categoryShifts = currentSpending.items.map((cur) => {
    const prevAmount = prevMap.get(cur.categoryId) || 0;
    const diff = cur.amount - prevAmount;
    const pct = prevAmount > 0 ? (diff / prevAmount) * 100 : cur.amount > 0 ? 100 : 0;
    return {
      ...cur,
      prevAmount,
      diff,
      pct,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Insights & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Rule-based algorithmic observations for {getMonthLabel(selectedMonth)}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Target className="w-3.5 h-3.5" />}
          onClick={() => setActiveTab('budgets')}
        >
          Review Budgets
        </Button>
      </div>

      {/* Generated Plain-Language Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const isWarning = insight.type === 'warning';
          const isPositive = insight.type === 'positive';

          return (
            <Card
              key={insight.id}
              padding="md"
              hoverEffect
              className={`flex items-start gap-4 ${
                isWarning
                  ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                  : isPositive
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : ''
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isWarning
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400'
                    : isPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {isWarning ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : isPositive ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Lightbulb className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {insight.title}
                  </h4>
                  {insight.metric && (
                    <span
                      className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-md ${
                        isWarning
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          : isPositive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {insight.metric}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Month-over-Month Category Spending Shift Table */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Month-over-Month Category Drift
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing {getMonthLabel(selectedMonth)} vs. {getMonthLabel(prevMonthKey)}
            </p>
          </div>
        </div>

        {categoryShifts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No expenses recorded to compare this month.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">This Month</th>
                  <th className="py-2.5 px-3 text-right">Last Month</th>
                  <th className="py-2.5 px-3 text-right">Difference</th>
                  <th className="py-2.5 px-3 text-right">% Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categoryShifts.map((cat) => {
                  const isIncreased = cat.diff > 0;
                  const isZero = cat.diff === 0;

                  return (
                    <tr
                      key={cat.categoryId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: cat.categoryColor }}
                          >
                            <CategoryIcon name={cat.categoryIcon} className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {cat.categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(cat.amount, currency)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                        {formatCurrency(cat.prevAmount, currency)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold tabular-nums ${
                          isZero
                            ? 'text-slate-400'
                            : isIncreased
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {formatCurrency(cat.diff, currency, { showSign: true })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-bold tabular-nums ${
                            isZero
                              ? 'text-slate-400'
                              : isIncreased
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isIncreased ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : !isZero ? (
                            <TrendingDown className="w-3.5 h-3.5" />
                          ) : null}
                          {formatPercentage(cat.pct)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
