import { useCallback, useEffect, useMemo, useState } from "react";

import { getBudgetSummary, listBudgets, listExpenses } from "@/services/financeService";
import { useAuth } from "@/providers/auth-provider";
import { BudgetRecord, BudgetSummary, ExpenseRecord } from "@/types/finance";

export type BudgetHistoryRow = {
  budget_id: number;
  month: number;
  year: number;
  total_limit: number;
  total_spent: number;
  remaining: number;
  percent_used: number;
};

function toNumber(value: string | number | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function useBudgetHistory() {
  const { status, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BudgetHistoryRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  const bootstrap = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [budgetsRes, expensesRes] = await Promise.all([listBudgets(accessToken), listExpenses(accessToken)]);

      setExpenses(expensesRes.slice(0, 8));

      const budgets = budgetsRes.slice(0, 12);
      const summaries = await Promise.all(
        budgets.map(async (budget) => {
          try {
            const s = await getBudgetSummary(accessToken, budget.id);
            return {
              budget_id: budget.id,
              month: budget.month,
              year: budget.year,
              total_limit: toNumber(s.total_limit),
              total_spent: toNumber(s.total_spent),
              remaining: toNumber(s.remaining),
              percent_used: toNumber(s.percent_total_used),
            } as BudgetHistoryRow;
          } catch {
            const totalLimit = toNumber(budget.total_limit);
            const totalSpent = expensesRes
              .filter((e) => {
                const d = new Date(e.date);
                return d.getMonth() + 1 === budget.month && d.getFullYear() === budget.year;
              })
              .reduce((sum, e) => sum + toNumber(e.amount), 0);

            return {
              budget_id: budget.id,
              month: budget.month,
              year: budget.year,
              total_limit: totalLimit,
              total_spent: totalSpent,
              remaining: Math.max(totalLimit - totalSpent, 0),
              percent_used: totalLimit > 0 ? Number(((totalSpent / totalLimit) * 100).toFixed(2)) : 0,
            } as BudgetHistoryRow;
          }
        }),
      );

      setRows(summaries.sort((a, b) => b.year - a.year || b.month - a.month));
    } catch (e) {
      console.log(e);
      setError("Unable to load budget history right now.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      void bootstrap();
    }
  }, [status, bootstrap]);

  const totals = useMemo(() => {
    const totalBudgeted = rows.reduce((sum, row) => sum + row.total_limit, 0);
    const totalSpent = rows.reduce((sum, row) => sum + row.total_spent, 0);
    const totalSaved = rows.reduce((sum, row) => sum + row.remaining, 0);
    const utilization = totalBudgeted > 0 ? Number(((totalSpent / totalBudgeted) * 100).toFixed(2)) : 0;

    return {
      monthsTracked: rows.length,
      totalBudgeted,
      totalSpent,
      totalSaved,
      utilization,
    };
  }, [rows]);

  return {
    status,
    loading,
    error,
    rows,
    expenses,
    totals,
  };
}
