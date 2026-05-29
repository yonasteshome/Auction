import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { useRealtime } from "@/providers/realtime-provider";
import { getBudgetSummary, listBudgets, listExpenses } from "@/services/financeService";
import { InAppNotification, listNotifications } from "@/services/userService";

function toNumber(value: string | number | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value || "0") : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function formatEtb(n: number) {
  return n.toLocaleString("en-ET", { maximumFractionDigits: 0, minimumFractionDigits: 0 }) + " ETB";
}

function thisMonthOf(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function useDashboardOverview() {
  const { status, accessToken } = useAuth();
  const { eventVersion } = useRealtime();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    monthlySpent: number;
    budgetLimit: number;
    remaining: number;
    percentUsed: number;
  } | null>(null);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [budgets, expenses, notifList] = await Promise.all([
        listBudgets(accessToken),
        listExpenses(accessToken),
        listNotifications(accessToken).catch(() => ({
          results: [] as InAppNotification[],
          count: 0,
          next: null,
          previous: null,
        })),
      ]);
      setNotifications((notifList.results ?? []).slice(0, 5));

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const dayOfMonth = Math.max(1, now.getDate());
      const monthExpenses = expenses.filter((e) => thisMonthOf(e.date));
      const monthlySpent = monthExpenses.reduce((s, e) => s + toNumber(e.amount), 0);
      setDailyAverage(monthlySpent / dayOfMonth);

      const current =
        budgets.find((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear()) ?? budgets[0] ?? null;

      if (current) {
        try {
          const s = await getBudgetSummary(accessToken, current.id);
          const limit = toNumber(s.total_limit);
          const spent = toNumber(s.total_spent);
          const rem = toNumber(s.remaining);
          setSummary({
            monthlySpent: spent,
            budgetLimit: limit,
            remaining: rem,
            percentUsed: toNumber(s.percent_total_used) || (limit > 0 ? (spent / limit) * 100 : 0),
          });
        } catch {
          const limit = toNumber(current.total_limit);
          const rem = Math.max(0, limit - monthlySpent);
          setSummary({
            monthlySpent,
            budgetLimit: limit,
            remaining: rem,
            percentUsed: limit > 0 ? (monthlySpent / limit) * 100 : 0,
          });
        }
      } else {
        setSummary({
          monthlySpent,
          budgetLimit: 0,
          remaining: 0,
          percentUsed: 0,
        });
      }
    } catch {
      setError("Unable to load your dashboard. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") void load();
  }, [status, load, eventVersion]);

  const formatted = useMemo(() => {
    if (!summary) {
      return {
        monthly: "—",
        saved: "—",
        dailyAvg: "—",
        spentLine: "—",
        remainLine: "—",
        barPct: 0,
        unreadCount: 0,
      };
    }
    return {
      monthly: formatEtb(summary.monthlySpent),
      saved: formatEtb(Math.max(0, summary.remaining)),
      dailyAvg: formatEtb(dailyAverage),
      spentLine: formatEtb(summary.monthlySpent) + " Spent",
      remainLine: formatEtb(Math.max(0, summary.remaining)) + " left",
      barPct: Math.min(100, Math.max(0, Math.round(summary.percentUsed))),
      unreadCount: notifications.filter((n) => !n.is_read).length,
    };
  }, [summary, dailyAverage, notifications]);

  return {
    status,
    loading,
    error,
    summary,
    dailyAverage,
    notifications,
    formatted,
    refetch: load,
  };
}
