import { formatMoney } from "@/lib/finance-utils";
import { ExpenseRecord } from "@/types/finance";

type ExpenseDraft = {
  category: string;
  amount: string;
  date: string;
  payment_method?: string;
  description?: string;
};

interface ExpensesTableProps {
  expenses: ExpenseRecord[];
  // optional editing handlers — listing page may be read-only
  editingId?: number | null;
  editDraft?: ExpenseDraft | null;
  saving?: boolean;
  onStartEdit?: (expense: ExpenseRecord) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onDelete?: (id: number) => void;
  onEditDraftChange?: (draft: ExpenseDraft) => void;
}

export function ExpensesTable({
  expenses,
  editingId,
  editDraft,
  saving = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditDraftChange,
}: ExpensesTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        No expenses found for the selected filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#dbdfe6] bg-slate-50/40 dark:border-slate-800 dark:bg-slate-800/40">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Payment</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
            {(onStartEdit || onDelete || onSaveEdit || onCancelEdit || onEditDraftChange) && (
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const isEditing = Boolean(editingId === expense.id && editDraft && onEditDraftChange && onSaveEdit && onCancelEdit);

            if (isEditing && editDraft && onEditDraftChange && onSaveEdit && onCancelEdit) {
              return (
                <tr key={expense.id} className="border-b border-[#eef1f5] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      value={editDraft.category}
                      onChange={(event) => onEditDraftChange({ ...editDraft, category: event.target.value })}
                      className="w-full rounded-lg border border-[#dbdfe6] px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={editDraft.date}
                      onChange={(event) => onEditDraftChange({ ...editDraft, date: event.target.value })}
                      className="w-full rounded-lg border border-[#dbdfe6] px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={editDraft.payment_method || ""}
                      onChange={(event) => onEditDraftChange({ ...editDraft, payment_method: event.target.value })}
                      className="w-full rounded-lg border border-[#dbdfe6] px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={editDraft.description || ""}
                      onChange={(event) => onEditDraftChange({ ...editDraft, description: event.target.value })}
                      className="w-full rounded-lg border border-[#dbdfe6] px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editDraft.amount}
                      onChange={(event) => onEditDraftChange({ ...editDraft, amount: event.target.value })}
                      className="w-full rounded-lg border border-[#dbdfe6] px-2 py-1 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={onSaveEdit}
                        className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-white disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={onCancelEdit}
                        className="rounded-md border border-[#dbdfe6] px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={expense.id} className="border-b border-[#eef1f5] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <span className="inline-flex items-center">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-400" />
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{expense.date}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{expense.payment_method || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{expense.description || "-"}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">
                  {formatMoney(expense.amount)} ETB
                </td>
                {(onStartEdit || onDelete) && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onStartEdit && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onStartEdit(expense)}
                          className="rounded-md border border-[#dbdfe6] px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onDelete(expense.id)}
                          className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
