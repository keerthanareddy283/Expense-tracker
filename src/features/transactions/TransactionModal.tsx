import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { useStore } from '../../store/useStore';
import { PaymentMethod, TransactionType } from '../../types';
import { PAYMENT_METHOD_LABELS } from '../../utils/formatters';

export const TransactionModal: React.FC = () => {
  const isOpen = useStore((s) => s.isTxModalOpen);
  const editingTx = useStore((s) => s.editingTransaction);
  const closeTxModal = useStore((s) => s.closeTxModal);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('cat-food');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string; note?: string }>({});

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === 'both' || c.type === type);

  useEffect(() => {
    if (isOpen) {
      if (editingTx) {
        setType(editingTx.type);
        setAmount(editingTx.amount.toString());
        setCategoryId(editingTx.categoryId);
        setDate(editingTx.date);
        setNote(editingTx.note || '');
        setPaymentMethod(editingTx.paymentMethod);
        setIsRecurring(Boolean(editingTx.isRecurring));
      } else {
        const todayStr = new Date().toISOString().slice(0, 10);
        setType('expense');
        setAmount('');
        const defaultCat = categories.find((c) => c.type === 'expense' || c.type === 'both')?.id || 'cat-food';
        setCategoryId(defaultCat);
        setDate(todayStr);
        setNote('');
        setPaymentMethod('upi');
        setIsRecurring(false);
      }
      setErrors({});

      // Auto-focus amount input after modal opens
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editingTx, categories]);

  // When type changes, ensure categoryId belongs to that type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validInNew = categories.find((c) => (c.type === 'both' || c.type === newType) && c.id === categoryId);
    if (!validInNew) {
      const fallback = categories.find((c) => c.type === 'both' || c.type === newType);
      if (fallback) setCategoryId(fallback.id);
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    } else if (numAmount > 100000000) {
      errs.amount = 'Amount exceeds maximum allowable threshold';
    }

    if (!categoryId) {
      errs.category = 'Please select a category';
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errs.date = 'Please provide a valid date in YYYY-MM-DD format';
    }

    if (note.length > 200) {
      errs.note = 'Note must be under 200 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      type,
      amount: parseFloat(amount),
      categoryId,
      date,
      note: note.trim(),
      paymentMethod,
      isRecurring,
    };

    if (editingTx) {
      updateTransaction(editingTx.id, payload);
    } else {
      addTransaction(payload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeTxModal}
      title={editingTx ? 'Edit Transaction' : 'Record Transaction'}
      description={editingTx ? 'Modify entry details' : 'Keep your ledger up to date'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Expense / Income */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Amount ({currency})
          </label>
          <div className="relative">
            <input
              ref={amountInputRef}
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Category Quick Chips & Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            {availableCategories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isSelected ? 'currentColor' : cat.color }}
                  >
                    <CategoryIcon
                      name={cat.icon}
                      className={`w-2.5 h-2.5 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-white'}`}
                    />
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category}</p>
          )}
        </div>

        {/* Date and Payment Method in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note / Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Note / Merchant / Description
          </label>
          <input
            type="text"
            placeholder="e.g. Swiggy Gourmet, Uber to airport, Tech Salary"
            value={note}
            maxLength={200}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {errors.note && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.note}</p>}
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Recurring monthly
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Auto-generate every month on this date
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={closeTxModal}>
            Cancel
          </Button>
          <Button type="submit">
            {editingTx ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
