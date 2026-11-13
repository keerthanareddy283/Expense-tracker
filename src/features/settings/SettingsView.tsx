import React, { useRef, useState } from 'react';
import {
  Coins,
  Palette,
  FolderTree,
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { CategoryManagerModal } from './CategoryManagerModal';
import { useStore } from '../../store/useStore';
import { CURRENCIES } from '../../utils/formatters';
import { downloadFile } from '../../lib/storage';
import { CurrencyCode } from '../../types';

export const SettingsView: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const setCurrency = useStore((s) => s.setCurrency);
  const setTheme = useStore((s) => s.setTheme);
  const categories = useStore((s) => s.categories);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const setIsCategoryModalOpen = useStore((s) => s.setIsCategoryModalOpen);
  const resetAllData = useStore((s) => s.resetAllData);
  const exportJSON = useStore((s) => s.exportJSON);
  const exportCSV = useStore((s) => s.exportCSV);
  const importJSON = useStore((s) => s.importJSON);
  const addToast = useStore((s) => s.addToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetType, setResetType] = useState<'seed' | 'clear'>('seed');

  const handleExportJSON = () => {
    const jsonStr = exportJSON();
    downloadFile(
      jsonStr,
      `spendwise-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  const handleExportCSV = () => {
    const csvStr = exportCSV();
    downloadFile(
      csvStr,
      `spendwise-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importJSON(content);
      if (!res.success) {
        addToast({
          title: 'Import failed',
          description: res.error || 'Invalid JSON backup format',
          type: 'error',
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = () => {
    resetAllData(resetType === 'seed');
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage currency, theme, categories, and ledger storage
        </p>
      </div>

      {/* 1. Currency & Formatting Section */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Primary Currency
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used for all charts, budgets, and calculation formatting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const config = CURRENCIES[code];
            const isSelected = settings.currency === code;

            return (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm">{code}</span>
                  <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    {config.symbol}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {config.name}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2. Theme & Appearance */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Appearance & Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between light, dark, or system preference
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-w-md">
          {(
            [
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
              { id: 'system', label: 'System' },
            ] as const
          ).map((t) => {
            const isSelected = settings.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Category Management */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Categories ({categories.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Custom and default classification tags
              </p>
            </div>
          </div>

          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
            onClick={() => setIsCategoryModalOpen(true)}
          >
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  <CategoryIcon name={c.icon} className="w-3.5 h-3.5" />
                </span>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{c.type}</p>
                </div>
              </div>

              {c.isCustom && (
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete custom category"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Data Tools & Backup */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Data Tools & Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Offline-first JSON import/export, CSV spreadsheet downloads, and reset actions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Export JSON */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Full JSON Backup
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Download transactions, categories, budgets, and recurring rules.
              </p>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportJSON}
              >
                Export JSON
              </Button>
            </div>
          </div>

          {/* Export CSV */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                CSV Ledger Export
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Compatible with Excel, Google Sheets, and accounting packages.
              </p>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Import JSON Backup
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Restore data from a previously exported SpendWise file.
              </p>
            </div>
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File & Import
              </Button>
            </div>
          </div>

          {/* Reset Action */}
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col justify-between">
            <div>
              <p className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                Reset or Seed Ledger
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Restore the 60-90 days sample dataset or erase everything.
              </p>
            </div>
            <div className="mt-3">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => setIsResetConfirmOpen(true)}
              >
                Reset Ledger...
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog for Reset */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Ledger Data"
        description="Choose how you would like to reset your data"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              onClick={() => setResetType('seed')}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                resetType === 'seed'
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <input
                type="radio"
                name="resetType"
                checked={resetType === 'seed'}
                onChange={() => setResetType('seed')}
                className="mt-1"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Restore Realistic Sample Data (Recommended)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Populates 60-90 days of realistic rent, salary, groceries, utilities, and budgets.
                </p>
              </div>
            </label>

            <label
              onClick={() => setResetType('clear')}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                resetType === 'clear'
                  ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <input
                type="radio"
                name="resetType"
                checked={resetType === 'clear'}
                onChange={() => setResetType('clear')}
                className="mt-1"
              />
              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Erase All Transactions (Blank Slate)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Permanently deletes all transactions and budgets for a fresh start.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={resetType === 'clear' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleExecuteReset}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Category Manager Modal */}
      <CategoryManagerModal />
    </div>
  );
};
