"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, Loader2 } from "lucide-react";

import { useBudgetHistory } from "@/hooks/use-budget-history";
import { formatMoney, formatMonthLabel } from "@/lib/finance-utils";

function EfficiencyBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  const tone = value <= 100 ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`${tone} h-full`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{value.toFixed(1)}%</span>
    </div>
  );
}

export function BudgetHistoryPage() {
  const { status, loading, error, rows, expenses, totals } = useBudgetHistory();

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading budget history...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#135bec]">Finance</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Budget History
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real monthly performance from your budget and expense endpoints.
          </p>
        </div>

        <Link
          href="/budget"
          className="inline-flex h-11 items-center rounded-xl border border-[#dbdfe6] px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back To Planner
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Months Tracked</p>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{totals.monthsTracked}</p>
        </div>
        <div className="rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Total Budgeted</p>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{formatMoney(totals.totalBudgeted)} ETB</p>
        </div>
        <div className="rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Total Spent</p>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{formatMoney(totals.totalSpent)} ETB</p>
        </div>
        <div className="rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Utilization</p>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{totals.utilization.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-[#dbdfe6] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-[#dbdfe6] px-5 py-4 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Monthly Data</h2>
            </div>

            {rows.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No budget history found yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Month</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Budget</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Spent</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Variance</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const variance = row.total_limit - row.total_spent;
                      const over = variance < 0;

                      return (
                        <tr key={row.budget_id} className="border-t border-[#eef1f5] dark:border-slate-800">
                          <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                            {formatMonthLabel(row.month, row.year)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-slate-700 dark:text-slate-200">
                            {formatMoney(row.total_limit)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-slate-700 dark:text-slate-200">
                            {formatMoney(row.total_spent)}
                          </td>
                          <td
                            className={`px-5 py-4 text-right text-sm font-bold ${
                              over ? "text-red-600" : "text-emerald-600"
                            }`}
                          >
                            {over ? "-" : "+"}
                            {formatMoney(Math.abs(variance))}
                          </td>
                          <td className="px-5 py-4">
                            <EfficiencyBar value={row.percent_used} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4 xl:col-span-4">
          <div className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CalendarDays className="size-4" />
              <p className="text-sm font-semibold">Data Source</p>
            </div>
            <p className="text-sm text-slate-500">
              This page uses your live finance APIs only: budgets list, optional budget history, and expenses.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Recent Expenses</h3>
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500">No recent expenses found.</p>
            ) : (
              <ul className="space-y-3">
                {expenses.map((expense) => (
                  <li key={expense.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{expense.category}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatMoney(expense.amount)} ETB
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{expense.date}</span>
                      <span>{expense.payment_method || "-"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}