"use client";
import { formatMonthLabel } from "@/lib/finance-utils";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";



export function ExpensesHeader({ onExportCsv }: { onExportCsv?: () => void }) {
  const now = new Date();
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Expenses</h2>
        <p className="mt-1 font-medium text-slate-500">Detailed log of your spending across categories.</p>
      </div>

      <div className="flex gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-[#dbdfe6] bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {formatMonthLabel(now.getMonth() + 1, now.getFullYear())}
        </div>
        <button
          type="button"
          onClick={onExportCsv}
          className="rounded-lg border border-[#dbdfe6] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Export CSV
        </button>
        <Link href={"/expenses/new"}>
          <Button>New Expense</Button>
        </Link>
      </div>
    </div>
  );
}
