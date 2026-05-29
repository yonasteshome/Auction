// components/finance/category-card.tsx
import { EditableCategory, BudgetSummaryCategory } from "@/types/finance";
import { formatMoney } from "@/lib/finance-utils";

interface CategoryCardProps {
  category: EditableCategory;
  stat?: BudgetSummaryCategory;
  onLimitChange: (categoryName: string, nextValue: string) => void;
}

export function CategoryCard({ category, stat, onLimitChange }: CategoryCardProps) {
  const spent = Number.parseFloat(stat?.spent ?? "0");
  const limit = Number.parseFloat(category.limit_amount || "0");
  const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{category.category_name}</p>
        <span className="text-xs font-semibold text-slate-500">{percent}% used</span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full bg-[#135bec]" style={{ width: `${percent}%` }} />
      </div>

      <div className="mb-4 text-xs text-slate-500">
        Spent {formatMoney(spent)} ETB of {formatMoney(limit)} ETB
      </div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        Limit Amount
      </label>

      <input
        className="h-10 w-full rounded-lg border border-[#dbdfe6] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#135bec]/30 dark:border-slate-700 dark:bg-slate-950"
        min="0"
        step="10"
        type="number"
        value={category.limit_amount}
        onChange={(event) => onLimitChange(category.category_name, event.target.value)}
      />
    </div>
  );
}