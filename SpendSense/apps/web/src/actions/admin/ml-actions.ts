"use server";

import { apiClient, ApiError } from "@/lib/api";
import { revalidateTag } from "next/cache";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function triggerMlRetrain(forecastWeeks = 4): Promise<ActionResult> {
  try {
    await apiClient({
      method: "POST",
      endpoint: "/api/admin/ml/retrain/",
      body: { forecast_weeks: forecastWeeks },
    });

    revalidateTag("admin-ml-monitoring", "max");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("admin-moderation-stats", "max");

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
