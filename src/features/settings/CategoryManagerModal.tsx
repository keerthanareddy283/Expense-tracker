import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AVAILABLE_ICONS, CategoryIcon } from '../../components/common/CategoryIcon';
import { useStore } from '../../store/useStore';
import { TransactionType } from '../../types';

const COLOR_PALETTE = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#eab308', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#64748b', // Slate
  '#d97706', // Ocher
];

export const CategoryManagerModal: React.FC = () => {
  const isOpen = useStore((s) => s.isCategoryModalOpen);
  const setIsOpen = useStore((s) => s.setIsCategoryModalOpen);
  const addCategory = useStore((s) => s.addCategory);

  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('Sparkles');
  const [color, setColor] = useState<string>('#3b82f6');
  const [type, setType] = useState<TransactionType | 'both'>('expense');
  const [error, setError] = useState<string>('');

  const handleClose = () => {
    setName('');
    setError('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }

    addCategory({
      name: name.trim(),
      icon,
      color,
      type,
    });

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Custom Category"
      description="Add a personalized category with icon and color"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Pet Care, Subscriptions, Investment"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          error={error}
        />

        {/* Category Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Category Type
          </label>
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
            {(['expense', 'income', 'both'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-colors cursor-pointer ${
                  type === t
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Choose Icon
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 max-h-36 overflow-y-auto">
            {AVAILABLE_ICONS.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  icon === iconName
                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={iconName}
              >
                <CategoryIcon name={iconName} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Select Color Tag
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
            style={{ backgroundColor: color }}
          >
            <CategoryIcon name={icon} className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {name || 'Category Preview'}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">{type} Category</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};
