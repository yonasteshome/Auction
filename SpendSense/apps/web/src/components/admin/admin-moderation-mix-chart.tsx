"use client";

import { useMemo } from "react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

type ModerationMixChartProps = {
  verified: number;
  pending: number;
  rejected: number;
  suspended: number;
};

const COLORS = ["#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AdminModerationMixChart({
  verified,
  pending,
  rejected,
  suspended,
}: ModerationMixChartProps) {
  const data = useMemo(
    () => [
      { name: "Verified", value: verified },
      { name: "Pending", value: pending },
      { name: "Rejected", value: rejected },
      { name: "Suspended", value: suspended },
    ].filter((item) => item.value > 0),
    [verified, pending, rejected, suspended],
  );

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.16)]">
      <div>
        <p className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
          Moderation chart
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Vendor status mix</h3>
        <p className="mt-1 text-sm text-slate-500">
          A compact visual split of verified, pending, rejected, and suspended vendors.
        </p>
      </div>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid rgba(15, 23, 42, 0.12)",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                background: "rgba(255,255,255,0.98)",
              }}
              formatter={(value: number, name: string) => [value.toLocaleString("en-ET"), name]}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={74}
              outerRadius={110}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => <span className="text-sm font-medium text-slate-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span>Total vendors represented</span>
        <span className="font-semibold text-slate-900">{total.toLocaleString("en-ET")}</span>
      </div>
    </div>
  );
}