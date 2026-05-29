"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import type { MarketItem } from "@/types/api/vendor";

interface ItemSelectorProps {
  items: MarketItem[];
  value: number | "";
  onChange: (itemId: number, unit: string) => void;
  error?: string;
}

export function ItemSelector({
  items,
  value,
  onChange,
  error,
}: ItemSelectorProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchCat = !category || item.category === category;
      return matchSearch && matchCat;
    });
  }, [items, search, category]);

  return (
    <div className="space-y-3">
      <Label className="text-xs font-bold uppercase tracking-wider text-[#616f89]">
        Item <span className="text-red-500">*</span>
      </Label>
      <select
        className="w-full rounded-lg border-none bg-[#f0f2f4] p-2 text-xs font-medium text-[#616f89]"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className="w-full rounded-lg border-none bg-[#f0f2f4] p-3 text-sm font-medium focus:ring-2 focus:ring-[#135bec]/20"
        value={value === "" ? "" : String(value)}
        onChange={(e) => {
          const id = Number(e.target.value);
          const item = items.find((i) => i.id === id);
          if (item) onChange(id, item.unit);
        }}
        aria-invalid={!!error}
      >
        <option value="">Select an item...</option>
        {filtered.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} ({item.unit}) — {item.category}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
