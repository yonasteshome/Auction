"use server";

import { apiClient, ApiError } from "@/lib/api";
import { revalidatePath } from "next/cache";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function suspendUser(userId: string, reason: string): Promise<ActionResult> {
  try {
    await apiClient({
      method: "POST",
      endpoint: `/api/users/admin/users/${userId}/suspend/`,
      body: { reason },
    });

    revalidatePath("/admin/users");

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function restoreUser(userId: string, reason: string): Promise<ActionResult> {
  try {
    await apiClient({
      method: "POST",
      endpoint: `/api/users/admin/users/${userId}/restore/`,
      body: { reason },
    });

    revalidatePath("/admin/users");

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}