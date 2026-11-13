import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Lightbulb,
  Settings,
  Plus,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const MobileBottomNav: React.FC = () => {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const openAddTxModal = useStore((s) => s.openAddTxModal);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as const, label: 'History', icon: ArrowLeftRight },
    { id: 'budgets' as const, label: 'Budgets', icon: Target },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) on mobile */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <button
          onClick={openAddTxModal}
          className="w-14 h-14 rounded-full bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 cursor-pointer"
          aria-label="Add transaction"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around px-2 z-30 md:hidden"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-14 h-full py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
