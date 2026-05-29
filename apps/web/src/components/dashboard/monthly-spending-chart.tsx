"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { DashboardTrendPoint } from "@/services/dashboardService";

function formatEtb(value: number) {
  return `${value.toLocaleString("en-ET", { maximumFractionDigits: 0 })} ETB`;
}

type MonthlySpendingChartProps = {
  data: DashboardTrendPoint[];
  monthlySpent: string | number | null | undefined;
  dailyAverage: string | number | null | undefined;
};

export function MonthlySpendingChart({ data, monthlySpent, dailyAverage }: MonthlySpendingChartProps) {
  const rows = data.map((point) => ({
    ...point,
    amount: Number.parseFloat(point.amount || "0"),
  }));

  const spentValue = typeof monthlySpent === "string" ? Number.parseFloat(monthlySpent || "0") : Number(monthlySpent ?? 0);
  const averageValue = typeof dailyAverage === "string" ? Number.parseFloat(dailyAverage || "0") : Number(dailyAverage ?? 0);

  return (
    <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-6 text-slate-900 shadow-[0_24px_60px_-24px_rgba(56,189,248,0.24)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="inline-flex rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
            Monthly trend
          </p>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Spending flow this month</h3>
            <p className="mt-1 text-sm text-slate-600">
              Daily spending recorded from the backend. Higher peaks show the days you spent most.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-slate-500">Monthly spent</p>
            <p className="mt-1 text-lg font-semibold">{formatEtb(Number.isFinite(spentValue) ? spentValue : 0)}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-slate-500">Daily average</p>
            <p className="mt-1 text-lg font-semibold">{formatEtb(Number.isFinite(averageValue) ? averageValue : 0)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-sky-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(14,165,233,0.12)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "rgba(15,23,42,0.55)", fontWeight: 600 }}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "rgba(15,23,42,0.55)", fontWeight: 600 }}
                tickFormatter={(value: number) => `${value.toFixed(0)}`}
                width={44}
              />
              <Tooltip
                cursor={{ stroke: "rgba(14,165,233,0.18)", strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(14, 165, 233, 0.12)",
                  boxShadow: "0 18px 40px rgba(14, 165, 233, 0.14)",
                  background: "rgba(255,255,255,0.98)",
                }}
                labelStyle={{ color: "#0f172a", fontWeight: 700 }}
                formatter={(value: number) => [`${value.toLocaleString("en-ET", { maximumFractionDigits: 0 })} ETB`, "Spent"]}
                labelFormatter={(label: string) => `Day ${label}`}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#0ea5e9"
                strokeWidth={3}
                fill="url(#dashboardTrendFill)"
                dot={{ r: 3, fill: "#38bdf8", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#dbeafe", stroke: "#0ea5e9", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
