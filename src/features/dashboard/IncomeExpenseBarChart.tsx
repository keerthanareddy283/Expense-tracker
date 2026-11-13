import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useStore } from '../../store/useStore';

export const IncomeExpenseBarChart: React.FC = () => {
  const { sixMonthTrend } = useMonthlyStats();
  const currency = useStore((s) => s.settings.currency);

  const formattedData = sixMonthTrend.map((item) => ({
    ...item,
    incomeFormatted: formatCurrency(item.income, currency),
    expensesFormatted: formatCurrency(item.expenses, currency),
    savingsFormatted: formatCurrency(item.savings, currency),
  }));

  return (
    <Card padding="md" className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Income vs. Expenses
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            6-Month cash flow comparison
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Expenses</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.2)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(val) => formatCurrency(val, currency, { compact: true })}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const inc = payload.find((p) => p.dataKey === 'income')?.value as number || 0;
                  const exp = payload.find((p) => p.dataKey === 'expenses')?.value as number || 0;
                  const net = inc - exp;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700/80 min-w-44">
                      <p className="font-bold text-slate-200 mb-1.5">{label}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>Income:</span>
                          <span className="font-bold tabular-nums">
                            {formatCurrency(inc, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-rose-400">
                          <span>Expenses:</span>
                          <span className="font-bold tabular-nums">
                            {formatCurrency(exp, currency)}
                          </span>
                        </div>
                        <div className="pt-1 mt-1 border-t border-slate-700/80 flex justify-between items-center font-bold">
                          <span className="text-slate-300">Net Flow:</span>
                          <span
                            className={`tabular-nums ${
                              net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatCurrency(net, currency, { showSign: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader table summary */}
      <div className="sr-only">
        <table>
          <caption>Income and Expenses Trend for the past 6 months</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Income</th>
              <th scope="col">Expenses</th>
              <th scope="col">Net Savings</th>
            </tr>
          </thead>
          <tbody>
            {sixMonthTrend.map((m) => (
              <tr key={m.month}>
                <td>{m.label}</td>
                <td>{m.income}</td>
                <td>{m.expenses}</td>
                <td>{m.savings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
