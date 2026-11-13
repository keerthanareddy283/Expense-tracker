import {
  parseISO,
  subMonths,
  format,
  getDaysInMonth,
  isSameMonth,
  addMonths,
  isAfter,
} from 'date-fns';
import {
  Budget,
  Category,
  CategorySpending,
  DailySpending,
  FinancialInsight,
  MonthlyStats,
  MonthlyTrend,
  RecurringTransaction,
  Transaction,
} from '../types';

export function getPreviousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return format(subMonths(date, 1), 'yyyy-MM');
}

export function calculateMonthlyStats(
  transactions: Transaction[],
  monthKey: string
): MonthlyStats & { totalLifetimeBalance: number } {
  const prevMonthKey = getPreviousMonthKey(monthKey);

  let totalIncome = 0;
  let totalExpenses = 0;
  let prevIncome = 0;
  let prevExpenses = 0;
  let lifetimeIncome = 0;
  let lifetimeExpenses = 0;

  for (const tx of transactions) {
    const txMonth = tx.date.slice(0, 7);

    // Lifetime
    if (tx.type === 'income') {
      lifetimeIncome += tx.amount;
    } else {
      lifetimeExpenses += tx.amount;
    }

    // Current Month
    if (txMonth === monthKey) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }
    }

    // Previous Month
    if (txMonth === prevMonthKey) {
      if (tx.type === 'income') {
        prevIncome += tx.amount;
      } else {
        prevExpenses += tx.amount;
      }
    }
  }

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  const prevNetSavings = prevIncome - prevExpenses;
  const prevSavingsRate = prevIncome > 0 ? Math.max(0, (prevNetSavings / prevIncome) * 100) : 0;

  const incomeMoMChange =
    prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : totalIncome > 0 ? 100 : 0;

  const expensesMoMChange =
    prevExpenses > 0
      ? ((totalExpenses - prevExpenses) / prevExpenses) * 100
      : totalExpenses > 0
      ? 100
      : 0;

  const savingsMoMChange =
    prevNetSavings !== 0 ? ((netSavings - prevNetSavings) / Math.abs(prevNetSavings)) * 100 : 0;

  const savingsRateMoMChange = savingsRate - prevSavingsRate;
  const totalLifetimeBalance = lifetimeIncome - lifetimeExpenses;

  return {
    month: monthKey,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    previousMonth: {
      totalIncome: prevIncome,
      totalExpenses: prevExpenses,
      netSavings: prevNetSavings,
      savingsRate: prevSavingsRate,
    },
    incomeMoMChange,
    expensesMoMChange,
    savingsMoMChange,
    savingsRateMoMChange,
    totalLifetimeBalance,
  };
}

export function calculateCategorySpending(
  transactions: Transaction[],
  categories: Category[],
  monthKey: string,
  budgets: Budget[] = []
): { items: CategorySpending[]; totalExpense: number } {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const budgetMap = new Map(budgets.map((b) => [b.categoryId, b.monthlyLimit]));

  const amounts: Record<string, { amount: number; count: number }> = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date.startsWith(monthKey)) {
      totalExpense += tx.amount;
      if (!amounts[tx.categoryId]) {
        amounts[tx.categoryId] = { amount: 0, count: 0 };
      }
      amounts[tx.categoryId].amount += tx.amount;
      amounts[tx.categoryId].count += 1;
    }
  }

  const items: CategorySpending[] = Object.entries(amounts)
    .map(([catId, data]) => {
      const cat = categoryMap.get(catId) || {
        id: catId,
        name: 'Other',
        icon: 'MoreHorizontal',
        color: '#64748b',
        type: 'expense' as const,
      };

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        amount: data.amount,
        count: data.count,
        percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
        budgetLimit: budgetMap.get(cat.id),
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return { items, totalExpense };
}

export function calculateDailySpending(
  transactions: Transaction[],
  monthKey: string
): DailySpending[] {
  const [year, month] = monthKey.split('-').map(Number);
  const targetDate = new Date(year, month - 1, 1);
  const totalDays = getDaysInMonth(targetDate);

  const dailyMap: Record<number, { expense: number; income: number }> = {};
  for (let d = 1; d <= totalDays; d++) {
    dailyMap[d] = { expense: 0, income: 0 };
  }

  for (const tx of transactions) {
    if (tx.date.startsWith(monthKey)) {
      const day = parseInt(tx.date.slice(8, 10), 10);
      if (dailyMap[day]) {
        if (tx.type === 'expense') {
          dailyMap[day].expense += tx.amount;
        } else {
          dailyMap[day].income += tx.amount;
        }
      }
    }
  }

  return Object.entries(dailyMap).map(([dayStr, data]) => {
    const day = Number(dayStr);
    const dayPadded = day < 10 ? `0${day}` : `${day}`;
    return {
      date: `${monthKey}-${dayPadded}`,
      day,
      expense: data.expense,
      income: data.income,
    };
  });
}

export function calculate6MonthTrend(
  transactions: Transaction[],
  referenceMonthKey: string
): MonthlyTrend[] {
  const [refYear, refMonth] = referenceMonthKey.split('-').map(Number);
  const refDate = new Date(refYear, refMonth - 1, 1);

  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const mDate = subMonths(refDate, i);
    months.push({
      key: format(mDate, 'yyyy-MM'),
      label: format(mDate, 'MMM yy'),
    });
  }

  const totals: Record<string, { income: number; expenses: number }> = {};
  for (const m of months) {
    totals[m.key] = { income: 0, expenses: 0 };
  }

  for (const tx of transactions) {
    const txMonth = tx.date.slice(0, 7);
    if (totals[txMonth]) {
      if (tx.type === 'income') {
        totals[txMonth].income += tx.amount;
      } else {
        totals[txMonth].expenses += tx.amount;
      }
    }
  }

  return months.map((m) => {
    const inc = totals[m.key]?.income || 0;
    const exp = totals[m.key]?.expenses || 0;
    return {
      month: m.key,
      label: m.label,
      income: inc,
      expenses: exp,
      savings: inc - exp,
    };
  });
}

export interface BudgetStatusItem {
  budget: Budget;
  category: Category;
  spent: number;
  percentage: number;
  remaining: number;
  status: 'normal' | 'warning' | 'exceeded';
  txCount: number;
}

export function calculateBudgetStatus(
  budgets: Budget[],
  categories: Category[],
  transactions: Transaction[],
  monthKey: string
): {
  items: BudgetStatusItem[];
  totalBudgeted: number;
  totalSpent: number;
  overallPercentage: number;
  overspentCount: number;
} {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Calculate spent per category for the given month
  const spentMap: Record<string, { total: number; count: number }> = {};
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date.startsWith(monthKey)) {
      if (!spentMap[tx.categoryId]) {
        spentMap[tx.categoryId] = { total: 0, count: 0 };
      }
      spentMap[tx.categoryId].total += tx.amount;
      spentMap[tx.categoryId].count += 1;
    }
  }

  let totalBudgeted = 0;
  let totalSpent = 0;
  let overspentCount = 0;

  const items: BudgetStatusItem[] = budgets.map((b) => {
    const cat = categoryMap.get(b.categoryId) || {
      id: b.categoryId,
      name: 'Uncategorized',
      icon: 'MoreHorizontal',
      color: '#64748b',
      type: 'expense' as const,
    };
    const spentInfo = spentMap[b.categoryId] || { total: 0, count: 0 };
    const spent = spentInfo.total;
    const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const remaining = b.monthlyLimit - spent;
    const threshold = b.alertThreshold || 80;

    let status: 'normal' | 'warning' | 'exceeded' = 'normal';
    if (spent > b.monthlyLimit) {
      status = 'exceeded';
      overspentCount++;
    } else if (percentage >= threshold) {
      status = 'warning';
    }

    totalBudgeted += b.monthlyLimit;
    totalSpent += spent;

    return {
      budget: b,
      category: cat,
      spent,
      percentage,
      remaining,
      status,
      txCount: spentInfo.count,
    };
  });

  // Sort by percentage descending
  items.sort((a, b) => b.percentage - a.percentage);

  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return {
    items,
    totalBudgeted,
    totalSpent,
    overallPercentage,
    overspentCount,
  };
}

export function generateFinancialInsights(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  monthKey: string
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const stats = calculateMonthlyStats(transactions, monthKey);
  const { items: categorySpending, totalExpense } = calculateCategorySpending(
    transactions,
    categories,
    monthKey,
    budgets
  );
  const prevMonthKey = getPreviousMonthKey(monthKey);
  const { items: prevCatSpending } = calculateCategorySpending(
    transactions,
    categories,
    prevMonthKey,
    budgets
  );
  const prevCatMap = new Map(prevCatSpending.map((c) => [c.categoryId, c.amount]));

  // 1. Savings Rate Insight
  if (stats.totalIncome > 0) {
    if (stats.savingsRate >= 30) {
      insights.push({
        id: 'ins-savings-high',
        type: 'positive',
        title: 'Strong Savings Discipline',
        description: `You are currently saving ${stats.savingsRate.toFixed(
          1
        )}% of your monthly income, well above the 20% benchmark.`,
        metric: `${stats.savingsRate.toFixed(1)}% savings rate`,
        impactScore: 90,
      });
    } else if (stats.savingsRate < 10 && stats.savingsRate >= 0) {
      insights.push({
        id: 'ins-savings-low',
        type: 'warning',
        title: 'Tight Savings Margin',
        description: `Your current savings rate is ${stats.savingsRate.toFixed(
          1
        )}%. Consider reviewing discretionary shopping or dining expenses to rebuild your cash buffer.`,
        metric: `${stats.savingsRate.toFixed(1)}% savings rate`,
        impactScore: 85,
      });
    } else if (stats.netSavings < 0) {
      insights.push({
        id: 'ins-savings-deficit',
        type: 'warning',
        title: 'Deficit Month Alert',
        description: `Expenses exceed income for this month by ${Math.abs(
          stats.netSavings
        ).toLocaleString()}. Check non-essential spending.`,
        metric: `Deficit: ${Math.abs(stats.netSavings).toLocaleString()}`,
        impactScore: 95,
      });
    }
  }

  // 2. Top Spending Category
  if (categorySpending.length > 0) {
    const topCat = categorySpending[0];
    insights.push({
      id: 'ins-top-cat',
      type: 'info',
      title: `Top Category: ${topCat.categoryName}`,
      description: `${topCat.categoryName} represents ${topCat.percentage.toFixed(
        1
      )}% of your total spending this month (${topCat.count} transactions).`,
      metric: `${topCat.percentage.toFixed(1)}% of total`,
      category: topCat.categoryName,
      impactScore: 70,
    });
  }

  // 3. Category MoM Shifts (>15% increase or decrease)
  for (const currentCat of categorySpending) {
    const prevAmount = prevCatMap.get(currentCat.categoryId);
    if (prevAmount && prevAmount > 1000) {
      const pctShift = ((currentCat.amount - prevAmount) / prevAmount) * 100;
      if (pctShift > 15) {
        insights.push({
          id: `ins-surge-${currentCat.categoryId}`,
          type: 'warning',
          title: `${currentCat.categoryName} Increased`,
          description: `You spent ${pctShift.toFixed(0)}% more on ${
            currentCat.categoryName
          } compared to the same time last month.`,
          metric: `+${pctShift.toFixed(0)}% vs last month`,
          category: currentCat.categoryName,
          impactScore: 75,
        });
        break; // Show one major shift
      } else if (pctShift < -15) {
        insights.push({
          id: `ins-drop-${currentCat.categoryId}`,
          type: 'positive',
          title: `Reduced ${currentCat.categoryName} Spend`,
          description: `Great job! Your spending in ${currentCat.categoryName} is down ${Math.abs(
            pctShift
          ).toFixed(0)}% from last month.`,
          metric: `${pctShift.toFixed(0)}% saved`,
          category: currentCat.categoryName,
          impactScore: 80,
        });
        break;
      }
    }
  }

  // 4. Budget Overrun Alert
  const budgetStatus = calculateBudgetStatus(budgets, categories, transactions, monthKey);
  const overspent = budgetStatus.items.filter((b) => b.status === 'exceeded');
  const nearLimit = budgetStatus.items.filter((b) => b.status === 'warning');

  if (overspent.length > 0) {
    const worst = overspent[0];
    insights.push({
      id: 'ins-budget-overrun',
      type: 'warning',
      title: `Budget Exceeded: ${worst.category.name}`,
      description: `${worst.category.name} has surpassed its monthly ceiling by ${Math.abs(
        worst.remaining
      ).toLocaleString()} (${worst.percentage.toFixed(0)}% utilized).`,
      metric: `${worst.percentage.toFixed(0)}% of limit`,
      category: worst.category.name,
      impactScore: 92,
    });
  } else if (nearLimit.length > 0) {
    const warningItem = nearLimit[0];
    insights.push({
      id: 'ins-budget-warning',
      type: 'warning',
      title: `Approaching Budget Limit: ${warningItem.category.name}`,
      description: `${warningItem.category.name} has reached ${warningItem.percentage.toFixed(
        0
      )}% of its limit. Only ${warningItem.remaining.toLocaleString()} left to spend.`,
      metric: `${warningItem.percentage.toFixed(0)}% utilized`,
      category: warningItem.category.name,
      impactScore: 82,
    });
  }

  // 5. Payment Method Habits
  const paymentMethodCounts: Record<string, number> = {};
  let totalMethodTxs = 0;
  for (const tx of transactions) {
    if (tx.date.startsWith(monthKey)) {
      paymentMethodCounts[tx.paymentMethod] = (paymentMethodCounts[tx.paymentMethod] || 0) + 1;
      totalMethodTxs++;
    }
  }

  if (totalMethodTxs >= 3) {
    const sortedMethods = Object.entries(paymentMethodCounts).sort((a, b) => b[1] - a[1]);
    const [dominantMethod, count] = sortedMethods[0];
    const dominantPct = ((count / totalMethodTxs) * 100).toFixed(0);
    const methodNames: Record<string, string> = {
      upi: 'UPI / Instant Pay',
      card: 'Debit / Credit Card',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
    };

    insights.push({
      id: 'ins-payment-habit',
      type: 'neutral',
      title: 'Payment Channel Breakdown',
      description: `${methodNames[dominantMethod] || dominantMethod} is your primary payment channel, accounting for ${dominantPct}% of recorded transactions.`,
      metric: `${dominantPct}% via ${methodNames[dominantMethod] || dominantMethod}`,
      impactScore: 50,
    });
  }

  return insights.sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
}

// Auto-generation of recurring transactions when due
export function processRecurringRules(
  recurringList: RecurringTransaction[],
  transactions: Transaction[],
  todayStr: string = new Date().toISOString().slice(0, 10)
): { newTransactions: Transaction[]; updatedRecurring: RecurringTransaction[] } {
  const newTransactions: Transaction[] = [];
  const updatedRecurring: RecurringTransaction[] = [];

  const today = parseISO(todayStr);

  for (const rec of recurringList) {
    if (!rec.isActive) {
      updatedRecurring.push(rec);
      continue;
    }

    const dueDate = parseISO(rec.nextDueDate);

    // If today is on or after nextDueDate
    if (!isAfter(dueDate, today)) {
      // Check if we haven't generated for this specific month yet
      const dueMonthKey = rec.nextDueDate.slice(0, 7);
      const alreadyGenerated = transactions.some(
        (tx) => tx.recurringId === rec.id && tx.date.startsWith(dueMonthKey)
      );

      if (!alreadyGenerated) {
        const generatedTx: Transaction = {
          id: `tx-rec-${rec.id}-${Date.now()}`,
          amount: rec.amount,
          type: rec.type,
          categoryId: rec.categoryId,
          date: rec.nextDueDate,
          note: `${rec.title} (Recurring auto-entry)`,
          paymentMethod: rec.paymentMethod,
          isRecurring: true,
          recurringId: rec.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTransactions.push(generatedTx);
      }

      // Bump nextDueDate by 1 month
      const nextMonthDate = addMonths(dueDate, 1);
      const nextDueFormatted = format(nextMonthDate, 'yyyy-MM-dd');

      updatedRecurring.push({
        ...rec,
        lastGeneratedDate: rec.nextDueDate,
        nextDueDate: nextDueFormatted,
      });
    } else {
      updatedRecurring.push(rec);
    }
  }

  return { newTransactions, updatedRecurring };
}
