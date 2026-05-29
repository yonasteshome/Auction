interface ExpensesFiltersProps {
  categories: string[];
  categoryFilter: string;
  sortBy: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  onCategoryChange: (value: string) => void;
  onSortChange: (value: "date_desc" | "date_asc" | "amount_desc" | "amount_asc") => void;
}

export function ExpensesFilters({
  categories,
  categoryFilter,
  sortBy,
  onCategoryChange,
  onSortChange,
}: ExpensesFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const active = categoryFilter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-primary text-white"
                  : "border border-[#dbdfe6] bg-white text-slate-600 hover:border-primary/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {category === "all" ? "All Categories" : category}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-500" htmlFor="expense-sort">
          Sort by:
        </label>
        <select
          id="expense-sort"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as ExpensesFiltersProps["sortBy"])}
          className="rounded-lg border border-[#dbdfe6] bg-white py-1.5 text-sm font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="date_desc">Date: Newest</option>
          <option value="date_asc">Date: Oldest</option>
          <option value="amount_desc">Amount: Highest</option>
          <option value="amount_asc">Amount: Lowest</option>
        </select>
      </div>
    </div>
  );
}
