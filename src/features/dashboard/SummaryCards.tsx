import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useStore } from '../../store/useStore';

export const SummaryCards: React.FC = () => {
  const { stats } = useMonthlyStats();
  const currency = useStore((s) => s.settings.currency);

  const cards = [
    {
      id: 'balance',
      label: 'Total Net Balance',
      amount: stats.totalLifetimeBalance,
      isCurrency: true,
      icon: Wallet,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      subtext: `Current ledger across all time`,
      trend: null,
    },
    {
      id: 'income',
      label: 'Income this Month',
      amount: stats.totalIncome,
      isCurrency: true,
      icon: ArrowUpRight,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      trend: stats.incomeMoMChange,
      trendPositiveIsGood: true,
      subtext: 'vs last month',
    },
    {
      id: 'expenses',
      label: 'Expenses this Month',
      amount: stats.totalExpenses,
      isCurrency: true,
      icon: ArrowDownRight,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60',
      trend: stats.expensesMoMChange,
      trendPositiveIsGood: false, // spending more is red
      subtext: 'vs last month',
    },
    {
      id: 'savings',
      label: 'Savings Rate',
      amount: stats.savingsRate,
      isCurrency: false,
      suffix: '%',
      icon: PiggyBank,
      iconColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-950/60',
      trend: stats.savingsRateMoMChange,
      trendPositiveIsGood: true,
      subtext: `${formatCurrency(stats.netSavings, currency, { showSign: true })} net`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasTrend = card.trend !== null && card.trend !== undefined;
        const isUp = (card.trend || 0) >= 0;
        const isGoodTrend = card.trendPositiveIsGood ? isUp : !isUp;

        return (
          <Card key={card.id} padding="md" hoverEffect className="flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl shrink-0 ${card.iconBg} ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {card.isCurrency ? (
                  <AnimatedCounter
                    value={card.amount}
                    formatter={(val) => formatCurrency(val, currency)}
                  />
                ) : (
                  <span className="tabular-nums">
                    <AnimatedCounter
                      value={card.amount}
                      formatter={(val) => `${val.toFixed(1)}%`}
                    />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs">
                {hasTrend && (
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold tabular-nums ${
                      isGoodTrend
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{formatPercentage(card.trend || 0)}</span>
                  </span>
                )}
                <span className="text-slate-400 dark:text-slate-500 truncate">{card.subtext}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
