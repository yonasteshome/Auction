"use client";

import { Filter, Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

export function ProductsControls({ categories }: { categories: string[] }) {
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: false }));
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("recently_added").withOptions({ shallow: false }),
  );
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 500 }),
  );
  const options = buildCategoryOptions(categories);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        {options.map((option) => (
          <button
            key={option.value}
            className={[
              "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
              category === option.value
                ? "bg-[#135bec] text-white"
                : "bg-[#f0f2f4] text-slate-500 hover:bg-slate-300/40",
            ].join(" ")}
            onClick={() => {
              setCategory(option.value);
              setPage(1);
            }}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value || null);
              setPage(1);
            }}
            placeholder="Search products..."
            className="h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none ring-[#135bec] transition focus:ring-2"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>Sort by:</span>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className="cursor-pointer border-none bg-transparent p-0 pr-6 text-[#135bec] outline-none"
          >
            <option value="recently_added">Recently Added</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        <button className="rounded-lg p-2 transition-colors hover:bg-[#f0f2f4]" type="button" aria-label="Advanced filters">
          <Filter className="text-slate-500" size={18} />
        </button>
      </div>
    </div>
  );
}

const buildCategoryOptions = (categories: string[]) => [
  { label: "All Products", value: "all" },
  ...categories.map((category) => ({ label: category, value: category })),
];
