"use server";

import { apiClient, ApiError } from "@/lib/api";
import { revalidatePath, revalidateTag } from "next/cache";
import { VendorPriceResponse } from "@/types/api/vendor";
import { vendorPriceSchema } from "@/lib/validation/vendor";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function createListingAction(
  vendorId: string,
  formData: FormData,
): Promise<ActionResult<VendorPriceResponse>> {
  const item = formData.get("item");
  const price = formData.get("price");
  const basePrice = formData.get("base_price");
  const stockCount = formData.get("stock_count");
  const description = formData.get("description");
  const variant = formData.get("variant");
  const image = formData.get("image");
  const images = formData.getAll("images");

  if (!item || !price || stockCount === null) {
    return { success: false, message: "Item, price, and stock are required." };
  }

  try {
    // Rebuild FormData on the server side to ensure File objects are intact
    const serverFormData = new FormData();
    serverFormData.append("item", String(item));
    serverFormData.append("price", String(price));
    if (basePrice !== null && basePrice !== "") {
      serverFormData.append("base_price", String(basePrice));
    }
    serverFormData.append("stock_count", String(stockCount));
    serverFormData.append("description", String(description ?? ""));
    serverFormData.append("variant", String(variant ?? ""));

    if (image && image instanceof File && image.size > 0) {
      serverFormData.append("image", image);
    }
    for (const imageFile of images) {
      if (imageFile instanceof File && imageFile.size > 0) {
        serverFormData.append("images", imageFile);
      }
    }

    const data = await apiClient<VendorPriceResponse>({
      method: "POST",
      endpoint: `/api/ecommerce/vendors/${vendorId}/listings/`,
      body: serverFormData,
    });

    // Validate with Zod
    const validated = vendorPriceSchema.parse(data);

    revalidateTag("vendor-products", "max");
    revalidateTag("market-items", "max");

    return {
      success: true,
      data: {
        ...validated,
        base_price: validated.base_price ?? null,
      } as VendorPriceResponse,
    };
  } catch (err: unknown) {
    console.error("Create listing error:", err);
    if (err instanceof ApiError) {
      // Try to extract a more specific error message from the payload
      const payload = err.payload as Record<string, unknown> | null;
      const detail =
        (payload?.detail as string) ||
        (payload?.non_field_errors as string[])?.join(", ") ||
        err.message;
      return { success: false, message: detail };
    }
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return {
      success: false,
      message: "An unexpected error occurred while creating the listing.",
    };
  }
}

export async function updateListingAction(
  listingId: string,
  formData: FormData,
): Promise<ActionResult<VendorPriceResponse>> {
  const item = formData.get("item");
  const price = formData.get("price");
  const basePrice = formData.get("base_price");
  const stockCount = formData.get("stock_count");
  const description = formData.get("description");
  const variant = formData.get("variant");
  const image = formData.get("image");
  const images = formData.getAll("images");

  if (!item || !price || stockCount === null) {
    return { success: false, message: "Item, price, and stock are required." };
  }

  try {
    const serverFormData = new FormData();
    serverFormData.append("item", String(item));
    serverFormData.append("price", String(price));
    if (basePrice !== null && basePrice !== "") {
      serverFormData.append("base_price", String(basePrice));
    }
    serverFormData.append("stock_count", String(stockCount));
    serverFormData.append("description", String(description ?? ""));
    serverFormData.append("variant", String(variant ?? ""));

    if (image && image instanceof File && image.size > 0) {
      serverFormData.append("image", image);
    }
    for (const imageFile of images) {
      if (imageFile instanceof File && imageFile.size > 0) {
        serverFormData.append("images", imageFile);
      }
    }

    const data = await apiClient<VendorPriceResponse>({
      method: "PATCH",
      endpoint: `/api/ecommerce/listings/${listingId}/`,
      body: serverFormData,
    });

    const validated = vendorPriceSchema.parse(data);

    revalidateTag("vendor-products", "max");
    revalidateTag("market-items", "max");

    return {
      success: true,
      data: {
        ...validated,
        base_price: validated.base_price ?? null,
      } as VendorPriceResponse,
    };
  } catch (err: unknown) {
    console.error("Update listing error:", err);
    if (err instanceof ApiError) {
      const payload = err.payload as Record<string, unknown> | null;
      const detail =
        (payload?.detail as string) ||
        (payload?.non_field_errors as string[])?.join(", ") ||
        err.message;
      return { success: false, message: detail };
    }
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return {
      success: false,
      message: "An unexpected error occurred while updating the listing.",
    };
  }
}

export async function deleteListingAction(
  listingId: string,
): Promise<ActionResult<{ id: string }>> {
  if (!listingId) {
    return { success: false, message: "Listing ID is required." };
  }

  try {
    await apiClient<void>({
      method: "DELETE",
      endpoint: `/api/ecommerce/listings/${listingId}/`,
    });

    revalidateTag("vendor-products", "max");
    revalidateTag("market-items", "max");
    revalidatePath("/vendor/products");

    return { success: true, data: { id: listingId } };
  } catch (err: unknown) {
    console.error("Delete listing error:", err);
    if (err instanceof ApiError) {
      const payload = err.payload as Record<string, unknown> | null;
      const detail =
        (payload?.detail as string) ||
        (payload?.non_field_errors as string[])?.join(", ") ||
        err.message;
      return { success: false, message: detail };
    }
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return {
      success: false,
      message: "An unexpected error occurred while deleting the listing.",
    };
  }
}
