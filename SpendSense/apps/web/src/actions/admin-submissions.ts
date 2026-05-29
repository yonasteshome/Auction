"use server";

import { apiClient, ApiError } from "@/lib/api";
import type { AdminModerationStats, AdminSubmission } from "@/types/api/admin-submissions";
import { revalidateTag } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function approveSubmission(
  id: number
): Promise<ActionResult<AdminSubmission>> {
  try {
    const data = await apiClient<AdminSubmission>({
      method: "POST",
      endpoint: `/api/market/admin/submissions/${id}/approve`,
    });
    revalidateTag("admin-submissions", "max");
    revalidateTag("admin-moderation-stats", "max");
    revalidateTag(`admin-submission-${id}`, "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    throw error;
  }
}

export async function rejectSubmission(
  id: number,
  reason: string
): Promise<ActionResult<AdminSubmission>> {
  try {
    const data = await apiClient<AdminSubmission>({
      method: "POST",
      endpoint: `/api/market/admin/submissions/${id}/reject`,
      body: { reason },
    });
    revalidateTag("admin-submissions", "max");
    revalidateTag("admin-moderation-stats", "max");
    revalidateTag(`admin-submission-${id}`, "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    throw error;
  }
}

export async function bulkApproveSubmissions(
  ids: number[]
): Promise<ActionResult<{ approved: number[] }>> {
  const results: number[] = [];
  const errors: string[] = [];

  for (const id of ids) {
    try {
      await apiClient({
        method: "POST",
        endpoint: `/api/market/admin/submissions/${id}/approve`,
      });
      results.push(id);
    } catch (error) {
      if (error instanceof ApiError) {
        errors.push(`#${id}: ${error.message}`);
      }
    }
  }

  revalidateTag("admin-submissions", "max");
  revalidateTag("admin-moderation-stats", "max");

  if (errors.length > 0 && results.length === 0) {
    return { success: false, message: errors.join("; ") };
  }
  return { success: true, data: { approved: results } };
}

export async function fetchModerationStats(): Promise<ActionResult<AdminModerationStats>> {
  try {
    const data = await apiClient<AdminModerationStats>({
      method: "GET",
      endpoint: "/api/market/admin/moderation-stats",
      cache: "no-store",
    });
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to refresh stats" };
  }
}
