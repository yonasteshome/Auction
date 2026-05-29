"use client";

import React, { useState } from "react";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { useRouter } from "next/navigation";

type Props = {
  params: Record<string, string | string[]>;
};

const CATEGORIES = [
  "Cereals & Grains",
  "Pulses & Legumes",
  "Vegetables & Tubers",
  "Fruits",
  "Oils & Fats",
  "Animal Products",
  "Sugar, Coffee & Spices",
  "Cleaning & Hygiene",
  "Energy & Cooking Fuel",
  "Basic Household Supplies",
  "Transportation",
  "Utilities",
  "Communication",
  "Health & Basic Services"
];

const CITIES_LIST = ["Addis Ababa", "Adama", "Hawassa", "Bahir Dar", "Mekelle", "Dire Dawa"];

export function ProductFilters({ params }: Props) {
  const router = useRouter();

  const getParam = (key: string) => {
    const val = params[key];
    return Array.isArray(val) ? val[0] : (val ?? '');
  };

  const [q, setQ] = useState(getParam('q'));
  const [category, setCategory] = useState(getParam('category') || 'all');
  const [minPrice, setMinPrice] = useState(getParam('minPrice') || getParam('min_price'));
  const [maxPrice, setMaxPrice] = useState(getParam('maxPrice') || getParam('max_price'));
  const [city, setCity] = useState(getParam('city') || 'all');
  const [verified, setVerified] = useState(getParam('verified') === 'true' || getParam('is_verified') === 'true');

  const handleApply = () => {
    const nextParams = new URLSearchParams();
    if (q) nextParams.set('q', q);
    if (category && category !== 'all') nextParams.set('category', category);
    if (minPrice) nextParams.set('minPrice', minPrice);
    if (maxPrice) nextParams.set('maxPrice', maxPrice);
    if (city && city !== 'all') nextParams.set('city', city);
    if (verified) nextParams.set('verified', 'true');
    router.push(`/products?${nextParams.toString()}`);
  };

  const handleReset = () => {
    setQ('');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setCity('all');
    setVerified(false);
    router.push('/products');
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search</label>
          <Input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search products..." 
            className="mt-1 border-slate-200 dark:border-slate-800 rounded-xl h-[40px]"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background text-sm h-[40px] px-3 font-semibold mt-1 outline-none"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price range (ETB)</label>
          <div className="flex items-center gap-2 mt-1">
            <Input 
              type="number" 
              placeholder="Min" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)}
              className="border-slate-200 dark:border-slate-800 rounded-xl h-[40px]"
            />
            <Input 
              type="number" 
              placeholder="Max" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border-slate-200 dark:border-slate-800 rounded-xl h-[40px]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background text-sm h-[40px] px-3 font-semibold mt-1 outline-none"
          >
            <option value="all">All cities</option>
            {CITIES_LIST.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 py-1">
            <Checkbox 
              id="verified" 
              checked={verified} 
              onCheckedChange={(checked) => setVerified(!!checked)}
            />
            <label htmlFor="verified" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Verified only</label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1 rounded-xl font-bold h-[40px]">Reset</Button>
            <Button onClick={handleApply} className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-[40px]">Apply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFilters;
