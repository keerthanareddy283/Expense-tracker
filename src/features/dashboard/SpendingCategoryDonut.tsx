import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../components/ui/Card';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { formatCurrency } from '../../utils/formatters';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useStore } from '../../store/useStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

export const SpendingCategoryDonut: React.FC = () => {
  const { categoryBreakdown } = useMonthlyStats();
  const currency = useStore((s) => s.settings.currency);
  const openAddTxModal = useStore((s) => s.openAddTxModal);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { items, totalExpense } = categoryBreakdown;

  if (items.length === 0) {
    return (
      <Card padding="md" className="h-full flex flex-col justify-center">
        <EmptyState
          icon={PieIcon}
          title="No expenses logged"
          description="Log your expenses this month to visualize category breakdown and insights."
          actionLabel="Log Expense"
          onAction={openAddTxModal}
        />
      </Card>
    );
  }

  const chartData = items.map((item) => ({
    name: item.categoryName,
    value: item.amount,
    color: item.categoryColor,
    icon: item.categoryIcon,
    percentage: item.percentage,
  }));

  const activeCategory = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <Card padding="md" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Spending by Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribution of {formatCurrency(totalExpense, currency)} spent
          </p>
        </div>
      </div>

      {/* Chart Viewport */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-lg border border-slate-700">
                      <p className="font-bold">{data.name}</p>
                      <p className="tabular-nums text-slate-200">
                        {formatCurrency(data.value, currency)} ({data.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={3}
              dataKey="value"
              animationDuration={800}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                  className="cursor-pointer transition-opacity duration-150 hover:opacity-85"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {activeCategory ? activeCategory.name : 'Total Spent'}
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(activeCategory ? activeCategory.value : totalExpense, currency, {
              compact: true,
            })}
          </span>
          {activeCategory && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
              {activeCategory.percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Category breakdown rows */}
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
        {items.map((cat, idx) => (
          <div
            key={cat.categoryId}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
              activeIndex === idx
                ? 'bg-slate-100 dark:bg-slate-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: cat.categoryColor }}
              >
                <CategoryIcon name={cat.categoryIcon} className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {cat.categoryName}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {cat.count} {cat.count === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(cat.amount, currency)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                {cat.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Screen reader table summary */}
      <div className="sr-only">
        <table>
          <caption>Monthly Spending by Category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Amount</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.categoryId}>
                <td>{item.categoryName}</td>
                <td>{item.amount}</td>
                <td>{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
