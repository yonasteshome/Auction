import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@repo/ui/components/button";

import { formatMonthLabel } from "@/lib/finance-utils";
import { BudgetRecord } from "@/types/finance";

interface BudgetHeaderProps {
  budget: BudgetRecord | null;
  suggestedMonth: { month: number; year: number } | null;
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
}

export function BudgetHeader({ budget, suggestedMonth, saving, canSave, onSave }: BudgetHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#135bec]">Finance</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Budget Planner</h1>
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
        <Button className="h-11 rounded-xl px-5" disabled={!canSave} onClick={onSave}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {budget ? "Apply Changes" : "Create Budget"}
        </Button>
      </div>
    </div>
  );
}
