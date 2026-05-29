import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { listBudgets, listExpenses } from "@/services/financeService";
import { BudgetRecord, ExpenseRecord } from "@/types/finance";

function toNumber(value: string | number | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value || "0") : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function thisMonthOf(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

type InitialExpenseData = {
  expenses?: ExpenseRecord[];
  budgets?: BudgetRecord[];
};

export function useExpenseListing(initial?: InitialExpenseData) {
  const { status, accessToken } = useAuth();

  const [loading, setLoading] = useState<boolean>(initial ? false : true);
  const [error, setError] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(
    Array.isArray(initial?.expenses) ? initial.expenses : []
  );
  const [budgets, setBudgets] = useState<BudgetRecord[]>(
    Array.isArray(initial?.budgets) ? initial.budgets : []
  );

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");

  const fetchAll = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [expenseList, budgetList] = await Promise.all([listExpenses(accessToken), listBudgets(accessToken)]);

      setExpenses(expenseList);
      setBudgets(budgetList);
    } catch {
      setError("Unable to load expenses right now.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    // If server-provided initial data exists, skip client fetch.
    if (initial) return;
    if (status === "authenticated") {
      void fetchAll();
    }
  }, [status, fetchAll, initial]);

  const categories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const base = categoryFilter === "all" ? expenses : expenses.filter((e) => e.category === categoryFilter);

    return [...base].sort((a, b) => {
      if (sortBy === "date_desc") return b.date.localeCompare(a.date);
      if (sortBy === "date_asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount_desc") return toNumber(b.amount) - toNumber(a.amount);
      return toNumber(a.amount) - toNumber(b.amount);
    });
  }, [expenses, categoryFilter, sortBy]);

  const summary = useMemo(() => {
    const monthExpenses = expenses.filter((e) => thisMonthOf(e.date));
    const monthlyTotalFromData = monthExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);

    const byCategory = new Map<string, number>();
    for (const e of monthExpenses) {
      const current = byCategory.get(e.category) ?? 0;
      byCategory.set(e.category, current + toNumber(e.amount));
    }

    const [topCategory, topAmount] = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0] ?? [
      "N/A",
      0,
    ];

    const currentBudget = budgets[0] ?? null;
    const budgetLimit = currentBudget ? toNumber(currentBudget.total_limit) : 0;
    const usedPct = budgetLimit > 0 ? (monthlyTotalFromData / budgetLimit) * 100 : 0;

    return {
      monthlyTotal: monthlyTotalFromData,
      topCategory,
      topCategoryAmount: topAmount,
      transactions: expenses.length,
      budgetLimit,
      usedPct: Number(usedPct.toFixed(2)),
    };
  }, [expenses, budgets]);

  return {
    status,
    loading,
    error,
    summary,
    categories,
    categoryFilter,
    sortBy,
    expenses: filteredExpenses,
    setCategoryFilter,
    setSortBy,
  };
}
