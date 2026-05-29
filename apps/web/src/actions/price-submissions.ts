"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { apiClient, ApiError } from "@/lib/api";
import {
  createPriceSubmissionSchema,
  priceSubmissionResponseSchema,
} from "@/lib/validation/price-submissions";
import type { PriceSubmissionResponse } from "@/types/api/price-submissions";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function extractApiMessage(err: ApiError): string {
  if (typeof err.payload === "string" && err.payload.includes("ProgrammingError")) {
    return "Server database schema is out of date. Contact support or retry after migrations run.";
  }
  const payload = err.payload as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object") return err.message;
  if (typeof payload.detail === "string") return payload.detail;
  const firstKey = Object.keys(payload)[0];
  const val = payload[firstKey];
  if (Array.isArray(val)) return String(val[0]);
  if (typeof val === "string") return val;
  return err.message;
}

export async function createPriceSubmission(
  formData: FormData,
): Promise<ActionResult<PriceSubmissionResponse>> {
  const raw = {
    item_id: formData.get("item_id"),
    price_value: formData.get("price_value"),
    unit: formData.get("unit"),
    market_location: formData.get("market_location"),
    city: formData.get("city"),
    vendor_name: formData.get("vendor_name") ?? "",
    date_observed: formData.get("date_observed"),
    time_observed: formData.get("time_observed") ?? "",
    quality_grade: formData.get("quality_grade") ?? "",
    quantity_available: formData.get("quantity_available") || null,
    notes: formData.get("notes") ?? "",
    confirm_outlier: formData.get("confirm_outlier") === "true",
  };

  let parsed;
  try {
    parsed = createPriceSubmissionSchema.parse(raw);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid submission data.";
    return { success: false, message };
  }

  const image = formData.get("image");
  const hasImage = image instanceof File && image.size > 0;

  let requestBody: FormData | Record<string, string | number>;
  if (hasImage) {
    const body = new FormData();
    body.append("item_id", String(parsed.item_id));
    body.append("price_value", String(parsed.price_value));
    body.append("unit", parsed.unit);
    body.append("market_location", parsed.market_location);
    body.append("city", parsed.city);
    body.append("date_observed", formatDate(parsed.date_observed));
    if (parsed.vendor_name) body.append("vendor_name", parsed.vendor_name);
    if (parsed.time_observed) body.append("time_observed", parsed.time_observed);
    if (parsed.quality_grade) body.append("quality_grade", parsed.quality_grade);
    if (parsed.quantity_available != null) {
      body.append("quantity_available", String(parsed.quantity_available));
    }
    if (parsed.notes) body.append("notes", parsed.notes);
    body.append("image", image);
    requestBody = body;
  } else {
    requestBody = {
      item_id: parsed.item_id,
      price_value: parsed.price_value,
      unit: parsed.unit,
      market_location: parsed.market_location,
      city: parsed.city,
      date_observed: formatDate(parsed.date_observed),
      vendor_name: parsed.vendor_name,
      time_observed: parsed.time_observed,
      quality_grade: parsed.quality_grade,
      ...(parsed.quantity_available != null
        ? { quantity_available: parsed.quantity_available }
        : {}),
      notes: parsed.notes,
    };
  }

  try {
    const data = await apiClient<PriceSubmissionResponse>({
      method: "POST",
      endpoint: "/api/market/prices/submit/",
      body: requestBody,
    });
    const validated = priceSubmissionResponseSchema.parse(data);
    revalidateTag("my-price-submissions", "max");
    revalidateTag("contributor-stats", "max");
    revalidatePath("/market/submit");
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: extractApiMessage(error) };
    }
    throw error;
  }
}

export async function updatePriceSubmission(
  submissionId: number,
  formData: FormData,
): Promise<ActionResult<PriceSubmissionResponse>> {
  const body = new FormData();
  for (const key of [
    "item_id",
    "price_value",
    "unit",
    "market_location",
    "city",
    "vendor_name",
    "date_observed",
    "time_observed",
    "quality_grade",
    "quantity_available",
    "notes",
  ]) {
    const val = formData.get(key);
    if (val !== null && val !== "") body.append(key, String(val));
  }
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    body.append("image", image);
  }

  try {
    const data = await apiClient<PriceSubmissionResponse>({
      method: "PATCH",
      endpoint: `/api/market/prices/my-submissions/${submissionId}/`,
      body,
    });
    const validated = priceSubmissionResponseSchema.parse(data);
    revalidateTag("my-price-submissions", "max");
    revalidatePath("/market/submit");
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: extractApiMessage(error) };
    }
    throw error;
  }
}

export async function deletePriceSubmission(
  submissionId: number,
): Promise<ActionResult<void>> {
  try {
    await apiClient<void>({
      method: "DELETE",
      endpoint: `/api/market/prices/my-submissions/${submissionId}/`,
    });
    revalidateTag("my-price-submissions", "max");
    revalidateTag("contributor-stats", "max");
    revalidatePath("/market/submit");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: extractApiMessage(error) };
    }
    throw error;
  }
}
