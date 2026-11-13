import React, { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ToastContainer } from './components/ui/Toast';
import { DashboardView } from './features/dashboard/DashboardView';
import { TransactionsView } from './features/transactions/TransactionsView';
import { BudgetsView } from './features/budgets/BudgetsView';
import { RecurringView } from './features/recurring/RecurringView';
import { InsightsView } from './features/insights/InsightsView';
import { SettingsView } from './features/settings/SettingsView';
import { TransactionModal } from './features/transactions/TransactionModal';
import { BudgetModal } from './features/budgets/BudgetModal';
import { RecurringModal } from './features/recurring/RecurringModal';
import { useStore } from './store/useStore';

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
  const init = useStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pb-20 md:pb-8">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'transactions' && <TransactionsView />}
            {activeTab === 'budgets' && <BudgetsView />}
            {activeTab === 'recurring' && <RecurringView />}
            {activeTab === 'insights' && <InsightsView />}
            {activeTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      <TransactionModal />
      <BudgetModal />
      <RecurringModal />

      {/* Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
}
