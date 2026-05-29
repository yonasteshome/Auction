import { ExpenseRecord } from "@/types/finance";
import { formatMoney } from "@/lib/finance-utils";

export function RecentExpenses({ expenses }: { expenses: ExpenseRecord[] }) {
  if (expenses.length === 0) {
    return <p className="text-sm text-slate-500">No expenses found.</p>;
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <li key={expense.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{expense.category}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatMoney(expense.amount)} ETB</p>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>{expense.date}</span>
            <span>{expense.payment_method || "-"}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}