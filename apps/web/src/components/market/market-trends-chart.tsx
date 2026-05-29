"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Area, AreaChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { MarketItem } from "@/types/api/vendor";
import type { ForecastPoint, InflationResponse, TrendPoint } from "@/types/api/market";

type ChartRow = { date: string; actual?: number; forecast?: number };

const CITY_OPTIONS = ["Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle"];

type MarketTrendsChartProps = {
  forecasts?: ForecastPoint[];
  inflation?: InflationResponse | null;
  initialCity?: string;
  initialItemId?: number | null;
  initialRange?: string;
  items?: MarketItem[];
  trends?: TrendPoint[];
};

export function MarketTrendsChart({
  forecasts = [],
  inflation = null,
  initialCity = "Addis Ababa",
  initialItemId = null,
  initialRange = "3M",
  items = [],
  trends = [],
}: MarketTrendsChartProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const itemId = initialItemId;
  const city = initialCity;
  const range = initialRange;
  const error = null;
  const loading = isPending;
  const rows = useMemo<ChartRow[]>(() => {
    const hist = trends.map((t) => ({
      date: t.date,
      actual: parseFloat(t.average_price) || 0,
    }));
    const fc = forecasts.slice(0, 4).map((f) => ({
      date: f.forecast_date,
      forecast: parseFloat(f.predicted_price) || 0,
    }));
    return [...hist, ...fc];
  }, [forecasts, trends]);

  const updateChartParams = (updates: Record<string, string | number>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      nextParams.set(key, String(value));
    }
    startTransition(() => {
      router.push(`${pathname}?${nextParams.toString()}`);
    });
  };

  const refreshChart = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const selectedItem = items.find((i) => i.id === itemId);

  return (
    <div className="mb-8 rounded-2xl border border-[#e5e7eb] dark:border-[#2a3140] bg-white dark:bg-[#1e2330] p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp className="size-5 text-[#135bec]" />
            </div>
            <h2 className="text-xl font-black text-[#111318] dark:text-white tracking-tight">Price Trend & Forecast</h2>
          </div>
          <p className="text-sm text-[#616f89] font-medium">
            {selectedItem ? `${selectedItem.name} (${selectedItem.unit})` : "Select an item"} · {city}
            {inflation?.change_percent !== null && inflation?.change_percent !== undefined && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${inflation.change_percent > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
                {inflation.change_percent > 0 ? "▲" : "▼"} {Math.abs(inflation.change_percent).toFixed(1)}%
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={itemId ?? ""}
            onChange={(e) => updateChartParams({ item_id: Number(e.target.value) })}
            className="h-10 pl-3 pr-8 rounded-xl border-none bg-[#f0f2f4] dark:bg-[#2a3140] text-sm font-bold text-[#111318] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec] transition-all cursor-pointer"
          >
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>

          <select
            value={city}
            onChange={(e) => updateChartParams({ city: e.target.value })}
            className="h-10 pl-3 pr-8 rounded-xl border-none bg-[#f0f2f4] dark:bg-[#2a3140] text-sm font-bold text-[#111318] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec] transition-all cursor-pointer"
          >
            {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex bg-[#f0f2f4] dark:bg-[#2a3140] p-1 rounded-xl">
            {(["1M", "3M", "6M", "1Y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => updateChartParams({ range: r })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${range === r ? "bg-white dark:bg-[#1e2330] text-[#135bec] shadow-sm" : "text-[#616f89] hover:text-[#111318]"}`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={refreshChart} disabled={loading} className="h-10 w-10 rounded-xl">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="h-72 flex flex-col items-center justify-center text-red-500 bg-red-50/30 dark:bg-red-950/10 rounded-xl border border-dashed border-red-200">
          <p className="text-sm font-bold">{error}</p>
          <Button variant="link" onClick={refreshChart} className="text-xs text-red-600 underline">Try again</Button>
        </div>
      )}

      {loading && !error && (
        <div className="h-72 flex flex-col items-center justify-center gap-4">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#135bec" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#135bec" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f4" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} 
                minTickGap={30} 
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
                width={45}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: 12, fontWeight: 700 }}
                formatter={(value: number, name: string) => [`${value?.toFixed(2)} ETB`, name === "actual" ? "Observed" : "ML Forecast"]}
                labelFormatter={(l: string) => `Date: ${l}`}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingTop: 0, paddingBottom: 24, fontSize: 12, fontWeight: 700 }}
                formatter={(v) => <span className="text-slate-600 dark:text-slate-400">{v === "actual" ? "Observed" : "Forecast"}</span>} 
              />
              <Area type="monotone" dataKey="actual" name="actual" stroke="#135bec" strokeWidth={3} fill="url(#colorActual)" dot={{ r: 4, fill: "#135bec", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} connectNulls />
              <Area type="monotone" dataKey="forecast" name="forecast" stroke="#16a34a" strokeWidth={3} strokeDasharray="6 6" fill="url(#colorForecast)" dot={false} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center h-72 text-[#616f89] gap-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200">
          <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm">
            <TrendingUp className="size-8 opacity-20 text-[#135bec]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Insufficient data points</p>
            <p className="text-xs mt-1 max-w-[200px]">Not enough price submissions exist yet to generate a trend for this item in {city}.</p>
          </div>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs font-bold">
            <Link href="/market/submit">Be the first to submit</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
