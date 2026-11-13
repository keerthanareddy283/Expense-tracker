import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useStore } from '../../store/useStore';

export const DailyTrendAreaChart: React.FC = () => {
  const { dailyTrend, selectedMonth } = useMonthlyStats();
  const currency = useStore((s) => s.settings.currency);

  const totalMonthlySpend = dailyTrend.reduce((sum, d) => sum + d.expense, 0);

  return (
    <Card padding="md" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Daily Spending Velocity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily expense pattern across the month
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Month Total
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalMonthlySpend, currency)}
          </span>
        </div>
      </div>

      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dailyTrend}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="spendVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.2)"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval="preserveStartEnd"
              tickFormatter={(val) => `${val}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(val) => formatCurrency(val, currency, { compact: true })}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700">
                      <p className="text-slate-300 font-semibold mb-1">Day {data.day}</p>
                      <p className="text-emerald-400 font-bold tabular-nums">
                        Expense: {formatCurrency(data.expense, currency)}
                      </p>
                      {data.income > 0 && (
                        <p className="text-teal-400 font-bold tabular-nums mt-0.5">
                          Income: {formatCurrency(data.income, currency)}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#spendVelocityGrad)"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
