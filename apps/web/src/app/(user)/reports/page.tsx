"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAuth } from "@/providers/auth-provider";
import { downloadFinanceExport } from "@/services/financeService";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);

  async function exportFile(format: "csv" | "pdf") {
    if (!accessToken) return;
    setError(null);
    setBusy(format);
    try {
      await downloadFinanceExport(accessToken, format, { month, year });
    } catch {
      setError("Export failed. Please make sure the API is running.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Download a monthly summary of your expenses, budget, and purchases. Use this for your records or to share with family.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Month</span>
          <select
            className="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((label, i) => (
              <option key={label} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Year</span>
          <Input
            type="number"
            min={2000}
            max={now.getFullYear() + 1}
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || now.getFullYear())}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!accessToken || !!busy}
          onClick={() => void exportFile("csv")}
        >
          {busy === "csv" ? "Preparing CSV…" : "Download CSV"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!accessToken || !!busy}
          onClick={() => void exportFile("pdf")}
        >
          {busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
        </Button>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          Tip: combine reports with a budget plan from <a className="text-[#135bec] underline" href="/budget">Budget</a> to track variance month over month.
        </p>
      </div>
    </div>
  );
}
