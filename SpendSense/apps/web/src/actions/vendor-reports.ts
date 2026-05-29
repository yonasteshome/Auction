"use server";

import { z } from "zod";
import { apiClient, ApiError } from "@/lib/api";
import { vendorReportSchema } from "@/lib/validation/vendor-reports";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

type ReportInput = z.infer<typeof vendorReportSchema>;

export async function reportVendor(input: ReportInput): Promise<ActionResult<void>> {
  const parsed = vendorReportSchema.parse(input);
  
  try {
    await apiClient<void>({
      method: "POST",
      endpoint: `/api/market/vendors/${parsed.vendorId}/reports/`,
      body: {
        reason: parsed.reason,
        details: parsed.details,
        evidence_urls: parsed.evidenceUrls || [],
      },
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Internal Server Error" };
  }
}
