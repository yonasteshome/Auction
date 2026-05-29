import { formatMoney } from "@/lib/finance-utils";

interface ExpensesSummaryCardsProps {
  summary: {
    monthlyTotal: number;
    topCategory: string;
    topCategoryAmount: number;
    transactions: number;
    budgetLimit: number;
    usedPct: number;
  };
}

export function ExpensesSummaryCards({ summary }: ExpensesSummaryCardsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <div className="md:col-span-2 rounded-xl border border-[#dbdfe6] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monthly Spending</p>
        <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{formatMoney(summary.monthlyTotal)} ETB</h3>
      </div>

      <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Category</p>
        <h4 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{summary.topCategory}</h4>
        <p className="mt-1 text-sm text-slate-500">{formatMoney(summary.topCategoryAmount)} ETB</p>
      </div>

      <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Transactions</p>
        <h4 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{summary.transactions}</h4>
        <p className="mt-1 text-sm text-slate-500">Budget Used: {summary.usedPct.toFixed(1)}%</p>
      </div>
    </div>
  );
}
