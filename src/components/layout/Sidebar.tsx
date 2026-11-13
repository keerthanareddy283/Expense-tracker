import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  RefreshCw,
  Lightbulb,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Sidebar: React.FC = () => {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const isCollapsed = useStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const openAddTxModal = useStore((s) => s.openAddTxModal);
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as const, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets' as const, label: 'Budgets', icon: Target },
    { id: 'recurring' as const, label: 'Recurring', icon: RefreshCw },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const isDarkMode =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleToggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 select-none z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                SpendWise
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Personal Ledger
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          onClick={openAddTxModal}
          className={`w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-xs hover:shadow transition-all duration-150 cursor-pointer ${
            isCollapsed ? 'h-10 px-0' : 'h-11 px-4 text-sm'
          }`}
          title="Add Transaction"
        >
          <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          {!isCollapsed && <span className="whitespace-nowrap">Add Transaction</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800/90 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              {!isCollapsed && <span className="whitespace-nowrap truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Controls */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
        <button
          onClick={handleToggleTheme}
          title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          {!isCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
};
