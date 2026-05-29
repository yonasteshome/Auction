"use client";

import { ChevronDown, Filter, Search, X } from "lucide-react";

export type SortOption = "name" | "avg_price_asc" | "avg_price_desc" | "trend";

interface MarketFilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  city: string;
  onCity: (v: string) => void;
  sort: SortOption;
  onSort: (v: SortOption) => void;
  categories: string[];
  cities: string[];
}

const CITIES = ["All Regions", "Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle", "Adama"];

export function MarketFilterBar({
  search, onSearch, category, onCategory, city, onCity, sort, onSort, categories, cities,
}: MarketFilterBarProps) {
  const allCities = ["All Regions", ...cities.filter((c) => c !== "All Regions")].length > 1
    ? ["All Regions", ...cities.filter((c) => c !== "All Regions")]
    : CITIES;

  return (
    <div className="flex flex-col lg:flex-row gap-3 mb-6 bg-white dark:bg-[#1e2330] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#616f89] pointer-events-none" />
        <input
          className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] text-[#111318] dark:text-white placeholder:text-[#616f89] border-none focus:ring-2 focus:ring-[#135bec] focus:bg-white dark:focus:bg-[#1e2330] transition-all text-sm outline-none"
          placeholder="Search items (e.g. Teff, Coffee, Onions)…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616f89] hover:text-[#111318]"
            onClick={() => onSearch("")}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={category}
          onChange={(v) => onCategory(v)}
          options={["All Categories", ...categories]}
        />
        <Select
          value={city}
          onChange={(v) => onCity(v)}
          options={allCities}
        />
        <Select
          value={sort}
          onChange={(v) => onSort(v as SortOption)}
          options={["name", "avg_price_asc", "avg_price_desc", "trend"]}
          labels={{ name: "Sort: Name", avg_price_asc: "Price ↑", avg_price_desc: "Price ↓", trend: "Volatility" }}
        />
        
        {(search || category !== "All Categories" || city !== "All Regions") && (
          <button
            onClick={() => {
              onSearch("");
              onCategory("All Categories");
              onCity("All Regions");
            }}
            className="flex items-center gap-1.5 px-3 h-10 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="size-3.5" />
            Reset
          </button>
        )}

        <button
          type="button"
          className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] text-[#616f89] hover:bg-[#e2e4e8] dark:hover:bg-[#374151] transition-colors"
          aria-label="More filters"
        >
          <Filter className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Select({
  value, onChange, options, labels,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-10 pl-3 pr-8 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3140] border-none text-sm font-medium text-[#111318] dark:text-white focus:ring-2 focus:ring-[#135bec] cursor-pointer outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-[#616f89] pointer-events-none" />
    </div>
  );
}
