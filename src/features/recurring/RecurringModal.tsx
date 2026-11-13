import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { PaymentMethod, TransactionType } from '../../types';
import { PAYMENT_METHOD_LABELS } from '../../utils/formatters';

export const RecurringModal: React.FC = () => {
  const isOpen = useStore((s) => s.isRecurringModalOpen);
  const editingRec = useStore((s) => s.editingRecurring);
  const closeRecurringModal = useStore((s) => s.closeRecurringModal);
  const addRecurring = useStore((s) => s.addRecurring);
  const updateRecurring = useStore((s) => s.updateRecurring);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<string>('cat-bills');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const availableCategories = categories.filter((c) => c.type === 'both' || c.type === type);

  useEffect(() => {
    if (isOpen) {
      if (editingRec) {
        setTitle(editingRec.title);
        setAmount(editingRec.amount.toString());
        setType(editingRec.type);
        setCategoryId(editingRec.categoryId);
        setPaymentMethod(editingRec.paymentMethod);
        setDayOfMonth(editingRec.dayOfMonth);
        setNote(editingRec.note || '');
      } else {
        setTitle('');
        setAmount('');
        setType('expense');
        const defaultCat = categories.find((c) => c.type === 'expense' || c.type === 'both')?.id || 'cat-bills';
        setCategoryId(defaultCat);
        setPaymentMethod('upi');
        setDayOfMonth(1);
        setNote('');
      }
      setError('');
    }
  }, [isOpen, editingRec, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please provide a title (e.g. Netflix Subscription)');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;
    const dayPadded = dayOfMonth < 10 ? `0${dayOfMonth}` : `${dayOfMonth}`;
    const monthPadded = curMonth < 10 ? `0${curMonth}` : `${curMonth}`;
    const nextDueDate = `${curYear}-${monthPadded}-${dayPadded}`;

    const payload = {
      title: title.trim(),
      amount: numAmount,
      type,
      categoryId,
      paymentMethod,
      note: note.trim(),
      frequency: 'monthly' as const,
      dayOfMonth,
      startDate: new Date().toISOString().slice(0, 10),
      nextDueDate,
      isActive: true,
    };

    if (editingRec) {
      updateRecurring(editingRec.id, payload);
    } else {
      addRecurring(payload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeRecurringModal}
      title={editingRec ? 'Edit Recurring Schedule' : 'Schedule Recurring Transaction'}
      description="Automate monthly recurring bills, rent, or salary"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Recurring Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Recurring Income
          </button>
        </div>

        {/* Title */}
        <Input
          label="Title"
          placeholder="e.g. Apartment Rent, Tech Salary, Internet Fiber"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Amount */}
        <Input
          label={`Amount (${currency})`}
          type="number"
          min="1"
          step="any"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {/* Category & Payment Method in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Day of Month */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Day of Month (1 - 31)
          </label>
          <Input
            type="number"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10) || 1)}
            helperText="Auto-generates every month on this date"
            required
          />
        </div>

        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={closeRecurringModal}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {editingRec ? 'Update Schedule' : 'Schedule Recurring'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
