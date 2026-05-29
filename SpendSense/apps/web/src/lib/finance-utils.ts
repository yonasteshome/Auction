import { createApiClient as createBase } from "@/services/apiClient";

/** Authenticated API client; uses same base URL as `services/apiClient`. */
export const createApiClient = (token: string) => createBase(() => token);

export function formatMoney(value: string | number) {
  const amount = typeof value === "string" ? Number.parseFloat(value || "0") : value;
  return Number.isFinite(amount) ? amount.toLocaleString() : "0";
}

export function formatMonthLabel(month: number, year: number) {
  const date = new Date(year, Math.max(0, month - 1), 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}