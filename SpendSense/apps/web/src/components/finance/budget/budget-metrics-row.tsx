import { SummaryCard } from "@/components/finance/summary-card";
import { formatMoney } from "@/lib/finance-utils";

interface BudgetMetricsRowProps {
  totals: {
    totalLimit: number;
    totalSpent: number;
    remaining: number;
    pct: number;
  };
}

export function BudgetMetricsRow({ totals }: BudgetMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <SummaryCard label="Budget Limit" value={`${formatMoney(totals.totalLimit)} ETB`} />
      <SummaryCard label="Spent" value={`${formatMoney(totals.totalSpent)} ETB`} />
      <SummaryCard label="Remaining" value={`${formatMoney(totals.remaining)} ETB`} />
      <SummaryCard label="Used" value={`${totals.pct}%`} />
    </div>
  );
}
