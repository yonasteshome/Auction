import { formatMoney } from "@/lib/finance-utils";

interface BudgetOverviewChartProps {
  percentage: number;
  totalBudget: number;
  remaining: number;
}

export function BudgetOverviewChart({ percentage, totalBudget, remaining }: BudgetOverviewChartProps) {
  // SVG Circle calculations
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const dashArray = `${percentage}, 100`;

  return (
    <div className="rounded-[2rem] border border-[#dbdfe6] bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h4 className="mb-6 text-xl font-black text-slate-900 dark:text-white">Overview</h4>
      
      <div className="relative mx-auto mb-8 h-48 w-48">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
          {/* Background Circle */}
          <path
            className="stroke-slate-100 dark:stroke-slate-800"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
          />
          {/* Progress Circle */}
          <path
            className="stroke-[#135bec] transition-all duration-500 ease-in-out"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeDasharray={dashArray}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-black text-slate-900 dark:text-white">{percentage}%</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Utilized</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Budget</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{formatMoney(totalBudget)} ETB</p>
          </div>
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
             <span className="material-symbols-outlined text-[#135bec] text-sm">analytics</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Left to Spend</p>
            <p className="text-lg font-black text-emerald-600">{formatMoney(remaining)} ETB</p>
          </div>
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <span className="material-symbols-outlined text-emerald-600 text-sm">savings</span>
          </div>
        </div>
      </div>
    </div>
  );
}