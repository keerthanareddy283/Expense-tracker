import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { CategoryIcon } from '../../components/common/CategoryIcon';

export const BudgetModal: React.FC = () => {
  const isOpen = useStore((s) => s.isBudgetModalOpen);
  const editingBudget = useStore((s) => s.editingBudget);
  const closeBudgetModal = useStore((s) => s.closeBudgetModal);
  const setBudget = useStore((s) => s.setBudget);
  const deleteBudget = useStore((s) => s.deleteBudget);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const [categoryId, setCategoryId] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [error, setError] = useState<string>('');

  // Expense categories only
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        setCategoryId(editingBudget.categoryId);
        setMonthlyLimit(editingBudget.monthlyLimit.toString());
        setAlertThreshold(editingBudget.alertThreshold || 80);
      } else {
        const firstCat = expenseCategories[0]?.id || 'cat-food';
        setCategoryId(firstCat);
        setMonthlyLimit('10000');
        setAlertThreshold(80);
      }
      setError('');
    }
  }, [isOpen, editingBudget, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Please specify a positive budget ceiling');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setBudget(categoryId, limit, alertThreshold);
  };

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeBudgetModal}
      title={editingBudget ? 'Update Budget Limit' : 'Set Category Budget'}
      description="Define spending thresholds to stay on track"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={Boolean(editingBudget)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 disabled:opacity-60 cursor-pointer"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Limit Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Monthly Budget Limit ({currency})
          </label>
          <Input
            type="number"
            min="1"
            step="100"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            placeholder="e.g. 15000"
            required
            error={error}
          />
        </div>

        {/* Warning Threshold slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Warning Alert Level
            </label>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {alertThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Turns amber when spending reaches {alertThreshold}% of the set limit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {editingBudget ? (
            <button
              type="button"
              onClick={() => {
                deleteBudget(editingBudget.id);
                closeBudgetModal();
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
            >
              Remove Budget
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={closeBudgetModal}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Budget
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
