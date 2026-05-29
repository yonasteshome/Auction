"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BudgetSummary } from "@/types/finance";

type Props = {
  summary: BudgetSummary | null;
};

export function BudgetSpendChart({ summary }: Props) {
  if (!summary?.by_category?.length) {
    return null;
  }

  const data = summary.by_category.map((c) => ({
    name: c.category_name,
    limit: Number.parseFloat(c.limit_amount) || 0,
    spent: Number.parseFloat(c.spent) || 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Spending by category</h2>
      <div className="h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}`} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(2)} ETB`, ""]} />
            <Legend />
            <Bar dataKey="limit" name="Limit" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#135bec" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
