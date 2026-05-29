"use client";

import { useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Brush,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { AdminDashboardTrendPoint } from "@/services/adminDashboardService";

type AdminActivityChartProps = {
  data: AdminDashboardTrendPoint[];
};

type MetricKey = "score" | "growth" | "moderation" | "trust";

export function AdminActivityChart({ data }: AdminActivityChartProps) {
  const [metric, setMetric] = useState<MetricKey>("score");

  const rows = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        score: point.users + point.vendors + point.flags + point.suspensions + point.reviews,
        growth: point.users + point.vendors,
        moderation: point.flags + point.suspensions * 2,
        trust: point.reviews + Math.max(0, point.users - point.flags),
      })),
    [data],
  );

  const activeRow = rows.at(-1);

  const metricCopy: Record<MetricKey, { label: string; description: string }> = {
    score: { label: "Overall score", description: "Balanced overview of growth, moderation, and trust signals." },
    growth: { label: "Growth", description: "New users and vendors joining the platform." },
    moderation: { label: "Moderation pressure", description: "Reports and suspensions detected by the backend." },
    trust: { label: "Trust", description: "Reviews and positive platform signals." },
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.16)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            Backend activity
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Admin activity over the last 7 days</h3>
          <p className="mt-1 text-sm text-slate-500">
            {metricCopy[metric].description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 sm:text-right">
          <Stat label="Users" value={activeRow?.users ?? 0} />
          <Stat label="Vendors" value={activeRow?.vendors ?? 0} />
          <Stat label="Flags" value={activeRow?.flags ?? 0} />
          <Stat label="Suspended" value={activeRow?.suspensions ?? 0} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["score", "growth", "moderation", "trust"] as MetricKey[]).map((item) => {
          const active = item === metric;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setMetric(item)}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                active ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              ].join(" ")}
            >
              {metricCopy[item].label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 sm:p-5">
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                width={42}
              />
              <Tooltip
                cursor={{ stroke: "rgba(14, 165, 233, 0.12)", strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(14, 165, 233, 0.12)",
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                  background: "rgba(255,255,255,0.98)",
                }}
                labelStyle={{ color: "#0f172a", fontWeight: 700 }}
                formatter={(value: number) => [value.toLocaleString("en-ET"), metricCopy[metric].label]}
                labelFormatter={(label: string) => `Day ${label}`}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#0ea5e9"
                strokeWidth={3}
                fill="url(#adminTrendFill)"
                dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#dbeafe", stroke: "#0ea5e9", strokeWidth: 3 }}
              />
              <Brush dataKey="label" height={24} stroke="#0ea5e9" travellerWidth={10} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value.toLocaleString("en-ET")}</p>
    </div>
  );
}