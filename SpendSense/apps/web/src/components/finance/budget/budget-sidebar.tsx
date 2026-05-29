import { CalendarDays } from "lucide-react";

import { BudgetOverviewChart } from "@/components/finance/budget-overview";
import { RecentExpenses } from "@/components/finance/recent-expenses";
import { ExpenseRecord } from "@/types/finance";

interface BudgetSidebarProps {
  totals: {
    totalLimit: number;
    remaining: number;
    pct: number;
  };
  expenses: ExpenseRecord[];
}

export function BudgetSidebar({ totals, expenses }: BudgetSidebarProps) {
  return (
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
  );
}
