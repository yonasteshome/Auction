import type { BudgetRecord, BudgetSummary, ExpenseRecord } from "@/types/finance";
import { createApiClient } from "./apiClient";

export async function listBudgets(accessToken: string): Promise<BudgetRecord[]> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<any>("/api/finance/budgets/");
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function getBudgetSummary(accessToken: string, budgetId: number): Promise<BudgetSummary> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<BudgetSummary>(`/api/finance/budgets/${budgetId}/summary/`);
  return data;
}

export async function listExpenses(accessToken: string): Promise<ExpenseRecord[]> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<any>("/api/finance/expenses/");
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/** Triggers a browser download of the export (CSV or PDF) using the user JWT. */
export async function downloadFinanceExport(
  accessToken: string,
  format: "csv" | "pdf",
  options?: { month?: number; year?: number }
): Promise<void> {
  const params = new URLSearchParams();
  params.set("format", format);
  if (options?.month) params.set("month", String(options.month));
  if (options?.year) params.set("year", String(options.year));

  const response = await fetch(`/api/finance/export/?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }

  const disposition = response.headers.get("content-disposition") || "";
  const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;\n]+)/i);
  const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/i);
  const filename = filenameStarMatch?.[1]
    ? decodeURIComponent(filenameStarMatch[1])
    : filenameMatch?.[1] ?? `export.${format === "pdf" ? "pdf" : "csv"}`;

  const data = await response.blob();
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
