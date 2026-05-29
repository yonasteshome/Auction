interface ExpenseDraft {
  category: string;
  amount: string;
  date: string;
  payment_method?: string;
  description?: string;
}

interface ExpenseCreateFormProps {
  draft: ExpenseDraft;
  saving: boolean;
  onDraftChange: (draft: ExpenseDraft) => void;
  onCreate: () => void;
}

export function ExpenseCreateForm({ draft, saving, onDraftChange, onCreate }: ExpenseCreateFormProps) {
  return (
    <div className="mb-6 rounded-xl border border-[#dbdfe6] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">New Transaction</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          value={draft.category}
          onChange={(event) => onDraftChange({ ...draft, category: event.target.value })}
          className="rounded-lg border border-[#dbdfe6] px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          placeholder="Category"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={draft.amount}
          onChange={(event) => onDraftChange({ ...draft, amount: event.target.value })}
          className="rounded-lg border border-[#dbdfe6] px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          placeholder="Amount"
        />
        <input
          type="date"
          value={draft.date}
          onChange={(event) => onDraftChange({ ...draft, date: event.target.value })}
          className="rounded-lg border border-[#dbdfe6] px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <input
          value={draft.payment_method || ""}
          onChange={(event) => onDraftChange({ ...draft, payment_method: event.target.value })}
          className="rounded-lg border border-[#dbdfe6] px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          placeholder="Payment Method"
        />
        <button
          type="button"
          disabled={saving || !draft.amount || !draft.category || !draft.date}
          onClick={onCreate}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add Expense"}
        </button>
      </div>

      <textarea
        value={draft.description || ""}
        onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
        className="mt-3 w-full rounded-lg border border-[#dbdfe6] px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        placeholder="Description (optional)"
        rows={2}
      />
    </div>
  );
}
