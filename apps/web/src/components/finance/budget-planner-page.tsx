"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, Loader2, Save } from "lucide-react";
import { Button } from "@repo/ui/components/button";

import { useBudgetPlanner } from "@/hooks/use-budget-planner";
import type { BudgetRecord, BudgetSummary, ExpenseRecord, EditableCategory } from "@/types/finance";
import { formatMoney, formatMonthLabel } from "@/lib/finance-utils";

import { BudgetOverviewChart } from "@/components/finance/budget-overview";
import { CategoryCard } from "@/components/finance/category-card";
import { RecentExpenses } from "@/components/finance/recent-expenses";
import { SummaryCard } from "@/components/finance/summary-card";

export function BudgetPlannerPage({
  initial,
}: {
  initial?: {
    budget?: BudgetRecord | null;
    summary?: BudgetSummary | null;
    suggestedMonth?: { month: number; year: number } | null;
    draftCategories?: EditableCategory[];
    expenses?: ExpenseRecord[];
  };
}) {
  const {
    status,
    loading,
    saving,
    error,
    budget,
    suggestedMonth,
    draftCategories,
    expenses,
    totals,
    spentByCategory,
    handleLimitChange,
    handleSave,
  } = useBudgetPlanner(initial);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading budget data...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#135bec]">Finance</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Budget Planner
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {budget
              ? `Editing ${formatMonthLabel(budget.month, budget.year)} budget`
              : suggestedMonth
                ? `No budget found. Suggestions for ${formatMonthLabel(suggestedMonth.month, suggestedMonth.year)}`
                : "Build your first monthly budget."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/budget/history"
            className="inline-flex h-11 items-center rounded-xl border border-[#dbdfe6] px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View History
          </Link>
          <Button className="h-11 rounded-xl px-5" disabled={saving || draftCategories.length === 0} onClick={handleSave}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {budget ? "Apply Changes" : "Create Budget"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard label="Budget Limit" value={`${formatMoney(totals.totalLimit)} ETB`} />
        <SummaryCard label="Spent" value={`${formatMoney(totals.totalSpent)} ETB`} />
        <SummaryCard label="Remaining" value={`${formatMoney(totals.remaining)} ETB`} />
        <SummaryCard label="Used" value={`${totals.pct}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="space-y-4 xl:col-span-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget Categories</h2>

          {draftCategories.length === 0 ? (
            <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              No categories available.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {draftCategories.map((category) => (
                <CategoryCard
                  key={category.category_name}
                  category={category}
                  stat={spentByCategory.get(category.category_name.toLowerCase())}
                  onLimitChange={handleLimitChange}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4 xl:col-span-4">
          <BudgetOverviewChart percentage={totals.pct} totalBudget={totals.totalLimit} remaining={totals.remaining} />

          <div className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Recent Expenses</h3>
            <RecentExpenses expenses={expenses} />
          </div>

          <div className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CalendarDays className="size-4" />
              <p className="text-sm font-semibold">Budget Scope</p>
            </div>
            <p className="text-sm text-slate-500">
              This page directly fetches data backed by finance endpoints: budgets, category limits, summary metrics, and recent expenses.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
