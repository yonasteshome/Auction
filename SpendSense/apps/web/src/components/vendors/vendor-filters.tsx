"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";

export function VendorFilters() {
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useQueryState("q", parseAsString.withDefault("").withOptions({ shallow: false }));
  const [category, setCategory] = useQueryState("category", parseAsString.withDefault("").withOptions({ shallow: false }));
  const [region, setRegion] = useQueryState("region", parseAsString.withDefault("").withOptions({ shallow: false }));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault("popularity").withOptions({ shallow: false }));

  const categories = ["Grains", "Vegetables", "Oils & Spices", "Beverages", "Household"];
  const regions = ["Addis Ababa", "Adama", "Shola", "Merkato", "Bole", "Yeka", "Kirkos"];
  const sortOptions = [
    { value: "popularity", label: "Most Popular" },
    { value: "price", label: "Best Price" },
    { value: "rating", label: "Highest Rated" },
    { value: "nearest", label: "Nearest" },
  ];

  const hasActiveFilters = category || region || (q && q.length > 0) || sortBy !== "popularity";

  const clearAll = () => {
    startTransition(() => {
      setQ(null);
      setCategory(null);
      setRegion(null);
      setSortBy(null);
    });
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendor name, shop, items..."
            value={q || ""}
            onChange={(e) => startTransition(() => { setQ(e.target.value || null); })}
            className="pl-9 w-full"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={category || "all"}
            onValueChange={(val) => startTransition(() => { setCategory(val === "all" ? null : val); })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={region || "all"}
            onValueChange={(val) => startTransition(() => { setRegion(val === "all" ? null : val); })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy || "popularity"}
            onValueChange={(val) => startTransition(() => { setSortBy(val === "popularity" ? null : val); })}
          >
            <SelectTrigger className="w-[160px]">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
          {q && (
            <Badge variant="secondary" className="px-2 py-1 gap-1 flex items-center">
              Search: {q}
              <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => startTransition(() => { setQ(null); })} />
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="px-2 py-1 gap-1 flex items-center">
              Category: {category}
              <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => startTransition(() => { setCategory(null); })} />
            </Badge>
          )}
          {region && (
            <Badge variant="secondary" className="px-2 py-1 gap-1 flex items-center">
              Region: {region}
              <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => startTransition(() => { setRegion(null); })} />
            </Badge>
          )}
          {sortBy !== "popularity" && (
            <Badge variant="secondary" className="px-2 py-1 gap-1 flex items-center">
              Sort: {sortOptions.find((s) => s.value === sortBy)?.label}
              <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => startTransition(() => { setSortBy(null); })} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
