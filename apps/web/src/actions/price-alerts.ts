"use server";

import { priceAlertInputSchema } from "@/lib/validation/price-alerts";
import { apiClient, ApiError } from "@/lib/api";
import { revalidateTag } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

interface PriceAlertResponse {
  id: number;
  item: number;
  item_name?: string;
  target_price: string;
  city?: string;
  alert_methods?: string[];
  expiry_days?: number;
  is_active: boolean;
  triggered_at?: string | null;
  created_at: string;
  expires_at?: string;
}

export async function createPriceAlert(
  itemId: string,
  targetPrice: number,
  city?: string,
  alertMethods?: string[],
  expiryDays?: string,
): Promise<ActionResult<{ alertId: string }>> {
  const parsed = priceAlertInputSchema.parse({
    itemId,
    targetPrice,
    city,
    alertMethods: alertMethods ?? ["in-app"],
    expiryDays: expiryDays ?? "30",
  });
  try {
    const data = await apiClient<PriceAlertResponse>({
      method: "POST",
      endpoint: "/api/market/price-alerts/",
      body: {
        item: Number(parsed.itemId),
        target_price: parsed.targetPrice,
        city: parsed.city || undefined,
        alert_methods: parsed.alertMethods,
        expiry_days: Number(parsed.expiryDays),
      },
    });
    revalidateTag("price-alerts", "max");
    return { success: true, data: { alertId: String(data.id) } };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Internal Server Error" };
  }
}

export async function updatePriceAlert(
  alertId: string,
  targetPrice: number,
  alertMethods?: string[],
  expiryDays?: string,
): Promise<ActionResult<{ alertId: string }>> {
  try {
    const data = await apiClient<PriceAlertResponse>({
      method: "PATCH",
      endpoint: `/api/market/price-alerts/${alertId}/`,
      body: {
        target_price: targetPrice,
        alert_methods: alertMethods,
        expiry_days: expiryDays ? Number(expiryDays) : undefined,
      },
    });
    revalidateTag("price-alerts", "max");
    return { success: true, data: { alertId: String(data.id) } };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Internal Server Error" };
  }
}

export async function deletePriceAlert(alertId: string): Promise<ActionResult<void>> {
  try {
    await apiClient<void>({
      method: "DELETE",
      endpoint: `/api/market/price-alerts/${alertId}/`,
    });
    revalidateTag("price-alerts", "max");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Internal Server Error" };
  }
}

export async function getUserPriceAlerts(itemId?: string): Promise<ActionResult<PriceAlertResponse[]>> {
  try {
    const query: Record<string, string> = {};
    if (itemId) query.item = itemId;
    const data = await apiClient<PriceAlertResponse[]>({
      method: "GET",
      endpoint: "/api/market/price-alerts/",
      query,
      next: { tags: ["price-alerts"] },
    });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Internal Server Error" };
  }
}
