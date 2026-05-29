export const dynamic = "force-dynamic";

import { BudgetPlannerPage as BudgetPlannerClient } from "@/components/finance/budget-planner-page";
import { apiClient } from "@/lib/api";
import type { BudgetRecord, BudgetSuggestion, BudgetSummary } from "@/types/finance";


export default async function BudgetPage() {
  try {
    const now = new Date();
    const [budgetsRaw, expenses] = await Promise.all([
      apiClient<any>({ endpoint: "/api/finance/budgets/", method: "GET" }),
      // include_products returns a canonical category list for the UI (and is also allowed anonymously)
      apiClient<any>({ endpoint: "/api/finance/expenses/", method: "GET", query: { include_products: 1, pageSize: 10 } }),
    ]);

    const budgets: BudgetRecord[] = Array.isArray(budgetsRaw) ? budgetsRaw : (budgetsRaw?.results ?? []);

    const current = budgets?.find((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear()) ?? null;
    const latest = (budgets && budgets.length > 0) ? budgets[0] : null;
    const selected = current ?? latest;

    let summary: BudgetSummary | null = null;
    let suggested: { month: number; year: number } | null = null;

    const allCategoryNames: string[] = Array.isArray(expenses?.categories)
      ? expenses.categories
          .map((c: any) => c?.name)
          .filter((n: unknown): n is string => typeof n === "string" && n.trim().length > 0)
      : [];

    let suggestedCategories: any[] = [];
    if (selected) {
      summary = await apiClient({endpoint:`/api/finance/budgets/${selected.id}/summary/`,method:"GET"});
      suggestedCategories = summary?.by_category ?? [];
    } else {
      const suggestion = await apiClient<BudgetSuggestion>({endpoint:`/api/finance/budgets/suggestions/?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,method:"GET"});
      suggested = { month: suggestion.month, year: suggestion.year };
      suggestedCategories = suggestion?.categories ?? [];
    }

    // Ensure the UI renders a complete category list.
    // If the backend provides canonical categories (from include_products), use that order.
    // Otherwise fall back to whatever the budget/suggestions provide.
    const limitsByName = new Map<string, string>();
    for (const c of suggestedCategories ?? []) {
      if (c?.category_name) limitsByName.set(String(c.category_name).toLowerCase(), String(c.limit_amount ?? "0.00"));
    }

    const namesToRender = allCategoryNames.length
      ? allCategoryNames
      : (suggestedCategories ?? []).map((c: any) => c.category_name);

    const initial = {
      budget: selected,
      summary,
      suggestedMonth: suggested,
      draftCategories: namesToRender.map((name: string) => ({
        category_name: name,
        limit_amount: limitsByName.get(String(name).toLowerCase()) ?? "0.00",
      })),
      expenses: (expenses.results ?? []),
    };

    return <BudgetPlannerClient initial={initial} />;
  } catch (err) {
    // On server errors, render the client with empty initial data so client can show proper UI/errors
    // eslint-disable-next-line no-console
    console.error("BudgetPage server fetch error:", err);
    return <BudgetPlannerClient initial={{}} />;
  }
}