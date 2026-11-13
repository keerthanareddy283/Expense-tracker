import React from 'react';
import { SummaryCards } from './SummaryCards';
import { SpendingCategoryDonut } from './SpendingCategoryDonut';
import { IncomeExpenseBarChart } from './IncomeExpenseBarChart';
import { DailyTrendAreaChart } from './DailyTrendAreaChart';
import { RecentTransactionsList } from './RecentTransactionsList';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useStore } from '../../store/useStore';
import { getMonthLabel } from '../../utils/formatters';
import { AlertCircle, Sparkles, Plus } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { selectedMonth, insights } = useMonthlyStats();
  const openAddTxModal = useStore((s) => s.openAddTxModal);
  const setActiveTab = useStore((s) => s.setActiveTab);

  // Check if there is an urgent alert (e.g. budget overrun or deficit)
  const urgentAlert = insights.find((i) => i.type === 'warning');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Month Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Performance metrics and cash flow for {getMonthLabel(selectedMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('insights')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Insights ({insights.length})</span>
          </button>
          <button
            onClick={openAddTxModal}
            className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Urgent Alert Banner (if any) */}
      {urgentAlert && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold truncate">{urgentAlert.title}:</span>
            <span className="truncate hidden sm:inline text-amber-800 dark:text-amber-300">
              {urgentAlert.description}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="shrink-0 font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
          >
            View Budgets &rarr;
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <SummaryCards />

      {/* Charts Grid - Row 1: Donut (Category Breakdown) + Bar Chart (6-month Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <SpendingCategoryDonut />
        </div>
        <div className="lg:col-span-7">
          <IncomeExpenseBarChart />
        </div>
      </div>

      {/* Charts Grid - Row 2: Daily Velocity Area Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <DailyTrendAreaChart />
        </div>
        <div className="lg:col-span-6">
          <RecentTransactionsList />
        </div>
      </div>
    </div>
  );
};
