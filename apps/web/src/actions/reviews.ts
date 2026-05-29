"use server";

import { apiClient, ApiError } from "@/lib/api";
import { revalidateTag } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export interface SubmitReviewInput {
  rating: number;
  comment: string;
}

export async function submitVendorReview(
  vendorId: string,
  input: SubmitReviewInput
): Promise<ActionResult<any>> {
  try {
    const data = await apiClient<any>({
      method: "POST",
      endpoint: `/api/ecommerce/vendors/${vendorId}/reviews/`,
      body: input,
    });

    // Revalidate reviews list cache for this vendor
    revalidateTag(`vendor:${vendorId}:reviews`, "max");
    revalidateTag(`vendor:${vendorId}`, "max");

    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to submit review" };
  }
}

export async function updateVendorReview(
  vendorId: string,
  reviewId: string,
  input: SubmitReviewInput
): Promise<ActionResult<any>> {
  try {
    const data = await apiClient<any>({
      method: "PATCH",
      endpoint: `/api/ecommerce/reviews/${reviewId}/`,
      body: input,
    });

    revalidateTag(`vendor:${vendorId}:reviews`, "max");
    revalidateTag(`vendor:${vendorId}`, "max");

    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to update review" };
  }
}

export async function deleteVendorReview(
  vendorId: string,
  reviewId: string
): Promise<ActionResult<any>> {
  try {
    await apiClient<void>({
      method: "DELETE",
      endpoint: `/api/ecommerce/reviews/${reviewId}/`,
    });

    revalidateTag(`vendor:${vendorId}:reviews`, "max");
    revalidateTag(`vendor:${vendorId}`, "max");

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete review" };
  }
}
