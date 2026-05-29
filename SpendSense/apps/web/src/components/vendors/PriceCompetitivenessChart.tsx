"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

interface PriceCompetitivenessChartProps {
  weeks: string[];
  vendorPrices: number[];
  marketPrices: number[];
}

export default function PriceCompetitivenessChart({
  weeks,
  vendorPrices,
  marketPrices,
}: PriceCompetitivenessChartProps) {
  // Format data for Recharts
  const data = weeks.map((week, index) => ({
    name: week,
    vendor: vendorPrices[index] || 0,
    market: marketPrices[index] || 0,
  }));

  // Calculate percentage savings: avg((market - vendor) / market * 100)
  const percentageDiffs = weeks.map((_, i) => {
    const v = vendorPrices[i] || 0;
    const m = marketPrices[i] || 0;
    return m > 0 ? ((m - v) / m) * 100 : 0;
  });

  const avgDiscount = percentageDiffs.length
    ? percentageDiffs.reduce((a, b) => a + b, 0) / percentageDiffs.length
    : 0;

  const isCheaper = avgDiscount > 0;
  const absoluteDiscount = Math.abs(avgDiscount).toFixed(1);

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-foreground text-base">
            Price vs. Market Average (Last 4 Weeks)
          </h4>
          <p className="text-xs text-muted-foreground">
            Comparison of vendor listing prices with city market average
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 w-fit ${
            isCheaper
              ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
          }`}
        >
          {isCheaper ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5" />
          )}
          {isCheaper
            ? `${absoluteDiscount}% cheaper on average`
            : `${absoluteDiscount}% expensive on average`}
        </div>
      </div>

      {/* Recharts AreaChart */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVendor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(37, 99, 235)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="rgb(37, 99, 235)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              hide={true} // Hide YAxis labels on mobile, keep tooltips (responsively overridden or hidden completely for cleaner sparkline look)
              className="hidden sm:block"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "12px",
                color: "var(--popover-foreground)",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value: any, name: string) => [
                `ETB ${Number(value).toFixed(0)}`,
                name === "vendor" ? "Vendor Price" : "Market Average",
              ]}
              labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="vendor"
              stroke="rgb(37, 99, 235)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVendor)"
              name="vendor"
            />
            <Area
              type="monotone"
              dataKey="market"
              stroke="rgb(148, 163, 184)"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="none"
              name="market"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend below the chart */}
      <div className="flex items-center justify-center gap-6 text-xs font-medium pt-2 border-t">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-blue-600 inline-block" />
          <span className="text-muted-foreground">Vendor Price</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0 border-t-2 border-dashed border-slate-400 inline-block" />
          <span className="text-muted-foreground">Market Average</span>
        </div>
      </div>
    </div>
  );
}
