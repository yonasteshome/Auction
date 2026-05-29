"use server";

import { apiClient, ApiError } from "@/lib/api";
import { revalidateTag } from "next/cache";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function approveVendor(vendorId: string): Promise<ActionResult> {
  try {
    await apiClient({
      method: "POST",
      endpoint: `/api/ecommerce/admin/vendors/${vendorId}/verify/`,
    });

    revalidateTag("admin-vendors", "max");
    revalidateTag("profile", "max"); // Vendor's profile might be cached
    revalidateTag("vendors", "max"); // Public market list
    
    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function rejectVendor(vendorId: string, reason: string): Promise<ActionResult> {
  try {
    await apiClient({
      method: "POST",
      endpoint: `/api/ecommerce/admin/vendors/${vendorId}/reject/`,
      body: { reason },
    });

    revalidateTag("admin-vendors", "max");
    revalidateTag("profile", "max");
    revalidateTag("vendors", "max");

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function suspendVendor(vendorId: string, reason: string): Promise<ActionResult> {
  try {
    await apiClient({
      method: "POST",
      endpoint: `/api/ecommerce/admin/vendors/${vendorId}/suspend/`,
      body: { reason },
    });

    revalidateTag("admin-vendors", "max");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("profile", "max");
    revalidateTag("vendors", "max");

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function restoreVendor(vendorId: string, reason: string): Promise<ActionResult> {
  try {
    await apiClient({
      method: "POST",
      endpoint: `/api/ecommerce/admin/vendors/${vendorId}/restore/`,
      body: { reason },
    });

    revalidateTag("admin-vendors", "max");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("profile", "max");
    revalidateTag("vendors", "max");

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
