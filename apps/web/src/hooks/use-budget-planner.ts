import { createApiClient } from "@/lib/finance-utils";
import { useAuth } from "@/providers/auth-provider";
import {
    BudgetRecord,
    BudgetSuggestionResponse,
    BudgetSummary,
    BudgetSummaryCategory,
    EditableCategory,
    ExpenseRecord
} from "@/types/finance";
import { useCallback, useEffect, useMemo, useState } from "react";

type InitialBudgetData = {
  budget?: BudgetRecord | null;
  summary?: BudgetSummary | null;
  suggestedMonth?: { month: number; year: number } | null;
  draftCategories?: EditableCategory[];
  expenses?: ExpenseRecord[];
};

export function useBudgetPlanner(initial?: InitialBudgetData) {
  const { status, accessToken } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(initial ? false : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [budget, setBudget] = useState<BudgetRecord | null>(initial?.budget ?? null);
  const [summary, setSummary] = useState<BudgetSummary | null>(initial?.summary ?? null);
  const [suggestedMonth, setSuggestedMonth] = useState<{ month: number; year: number } | null>(
    initial?.suggestedMonth ?? null
  );
  const [draftCategories, setDraftCategories] = useState<EditableCategory[]>(initial?.draftCategories ?? []);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initial?.expenses ?? []);

  const bootstrap = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const api = createApiClient(accessToken);

    try {
      const [budgetsRes, expensesRes] = await Promise.all([
        // DRF pagination is enabled globally, so this endpoint may return {results: []}.
        api.get<any>("/api/finance/budgets/"),
        // Custom response shape: { pagination, results, categories?, products? }
        api.get<any>("/api/finance/expenses/", { params: { include_products: 1, pageSize: 6 } }),
      ]);

      const budgetsData = budgetsRes.data;
      const budgets: BudgetRecord[] = Array.isArray(budgetsData)
        ? budgetsData
        : (budgetsData?.results ?? []);

      const expensesData = expensesRes.data;
      const expenseRows: ExpenseRecord[] = Array.isArray(expensesData)
        ? expensesData
        : (expensesData?.results ?? []);
      setExpenses(expenseRows.slice(0, 6));

      const allCategoryNames: string[] = Array.isArray(expensesData?.categories)
        ? expensesData.categories
            .map((c: any) => c?.name)
            .filter((n: unknown): n is string => typeof n === "string" && n.trim().length > 0)
        : [];

      if (budgets.length > 0) {
        const now = new Date();
        const currentBudget =
          budgets.find((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear()) ?? budgets[0];

        setBudget(currentBudget);
        setSuggestedMonth(null);

        const summaryRes = await api.get<BudgetSummary>(`/api/finance/budgets/${currentBudget.id}/summary/`);
        const detail = summaryRes.data;
        setSummary(detail);

        const limitsByName = new Map<string, string>();
        for (const c of detail.by_category ?? []) {
          limitsByName.set(String(c.category_name).toLowerCase(), String(c.limit_amount));
        }

        const namesToRender = allCategoryNames.length
          ? allCategoryNames
          : (detail.by_category ?? []).map((c) => c.category_name);

        setDraftCategories(
          namesToRender.map((name) => ({
            category_name: name,
            limit_amount: limitsByName.get(String(name).toLowerCase()) ?? "0.00",
          }))
        );
      } else {
        setBudget(null);
        setSummary(null);

        const now = new Date();
        const suggestionRes = await api.get<BudgetSuggestionResponse>("/api/finance/budgets/suggestions/", {
          params: { month: now.getMonth() + 1, year: now.getFullYear() },
        });

        setSuggestedMonth({ month: suggestionRes.data.month, year: suggestionRes.data.year });

        const suggestedLimits = new Map<string, string>();
        for (const c of suggestionRes.data.categories ?? []) {
          suggestedLimits.set(String(c.category_name).toLowerCase(), String(c.limit_amount));
        }

        const namesToRender = allCategoryNames.length
          ? allCategoryNames
          : (suggestionRes.data.categories ?? []).map((c) => c.category_name);

        setDraftCategories(
          namesToRender.map((name) => ({
            category_name: name,
            limit_amount: suggestedLimits.get(String(name).toLowerCase()) ?? "0.00",
          }))
        );
      }
    } catch (err) {
      // Log the error for debugging (axios errors include response)
      // eslint-disable-next-line no-console
      console.error("useBudgetPlanner bootstrap error:", err);

      // Try to surface a bit more detail to help debugging without leaking sensitive info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (err as any)?.response?.status ?? (err as any)?.status ?? null;
      setError("Unable to load your finance data right now.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    // If initial data was provided from the server, skip client bootstrap.
    if (initial) return;
    if (status === "authenticated") void bootstrap();
  }, [status, bootstrap, initial]);

  const totals = useMemo(() => {
    const totalLimit = draftCategories.reduce((sum, cat) => sum + Number.parseFloat(cat.limit_amount || "0"), 0);
    const totalSpent = Number.parseFloat(summary?.total_spent ?? "0");
    const remaining = Math.max(totalLimit - totalSpent, 0);
    const pct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
    return { totalLimit, totalSpent, remaining, pct };
  }, [draftCategories, summary?.total_spent]);

  const spentByCategory = useMemo(() => {
    const map = new Map<string, BudgetSummaryCategory>();
    for (const category of summary?.by_category ?? []) {
      map.set(category.category_name.toLowerCase(), category);
    }
    return map;
  }, [summary?.by_category]);

  const handleLimitChange = (categoryName: string, nextValue: string) => {
    setDraftCategories((current) =>
      current.map((item) => (item.category_name === categoryName ? { ...item, limit_amount: nextValue } : item))
    );
  };

  const handleSave = async () => {
    if (!accessToken || draftCategories.length === 0) return;

    setSaving(true);
    setError(null);
    const api = createApiClient(accessToken);

    try {
      const totalLimit = draftCategories.reduce((sum, item) => sum + Number.parseFloat(item.limit_amount || "0"), 0).toFixed(2);
      const payload = {
        month: budget?.month ?? suggestedMonth?.month ?? new Date().getMonth() + 1,
        year: budget?.year ?? suggestedMonth?.year ?? new Date().getFullYear(),
        total_limit: totalLimit,
        categories: draftCategories.map((item) => ({
          category_name: item.category_name,
          limit_amount: Number.parseFloat(item.limit_amount || "0").toFixed(2),
        })),
      };

      let savedBudget = budget;

      if (savedBudget) {
        const patchRes = await api.patch<BudgetRecord>(`/api/finance/budgets/${savedBudget.id}/`, payload);
        savedBudget = patchRes.data;
      } else {
        const postRes = await api.post<BudgetRecord>("/api/finance/budgets/", payload);
        savedBudget = postRes.data;
      }

      setBudget(savedBudget);
      setSuggestedMonth(null);

      const summaryRes = await api.get<BudgetSummary>(`/api/finance/budgets/${savedBudget.id}/summary/`);
      setSummary(summaryRes.data);
      setDraftCategories(summaryRes.data.by_category.map((item) => ({ category_name: item.category_name, limit_amount: item.limit_amount })));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("useBudgetPlanner save error:", err);
      setError("Unable to save budget changes.");
    } finally {
      setSaving(false);
    }
  };

  return {
    status,
    loading,
    saving,
    error,
    budget,
    summary,
    suggestedMonth,
    draftCategories,
    expenses,
    totals,
    spentByCategory,
    handleLimitChange,
    handleSave,
  };
}