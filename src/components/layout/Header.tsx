import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Coins,
  Sun,
  Moon,
  Wallet,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getMonthLabel, getMonthKey } from '../../utils/formatters';

export const Header: React.FC = () => {
  const selectedMonth = useStore((s) => s.selectedMonth);
  const prevMonth = useStore((s) => s.prevMonth);
  const nextMonth = useStore((s) => s.nextMonth);
  const resetToCurrentMonth = useStore((s) => s.resetToCurrentMonth);
  const openAddTxModal = useStore((s) => s.openAddTxModal);
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const currentMonthKey = getMonthKey(new Date());
  const isCurrentMonth = selectedMonth === currentMonthKey;

  const isDarkMode =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Zone: Mobile brand mark & Breadcrumb / Month selector */}
      <div className="flex items-center gap-3">
        {/* Mobile only brand mark */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
            SpendWise
          </span>
        </div>

        {/* Month Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
            <span>{getMonthLabel(selectedMonth)}</span>
          </div>

          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={resetToCurrentMonth}
            className="hidden sm:inline-flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 cursor-pointer"
          >
            Current Month
          </button>
        )}
      </div>

      {/* Right Zone: Currency indicator, Theme toggle, and Primary CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
          title="Change currency in Settings"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-mono">{settings.currency}</span>
        </button>

        <button
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={openAddTxModal}
          className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
};
