"use server";

import { apiClient, ApiError } from "@/lib/api";
import type { VendorProfile } from "../../app/vendor/_lib/vendor-api";

export type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

export async function updateProfile(payload: FormData | Partial<VendorProfile>): Promise<ActionResult<VendorProfile>> {
  try {
    const rawData = await apiClient<any>({ 
      method: "PATCH", 
      endpoint: "/api/users/me/", 
      body: payload 
    });

    // Flatten the vendor_info from the response for UI compatibility
    const vendorInfo = rawData.vendor_info || {};
    const flattened: VendorProfile = {
      ...rawData,
      shop_name: vendorInfo.shop_name || rawData.shop_name,
      address: vendorInfo.address || rawData.address,
      contact_phone: vendorInfo.contact_phone || rawData.contact_phone,
      image: vendorInfo.image || rawData.image,
      theme_image: vendorInfo.theme_image || rawData.theme_image,
    };

    return { success: true, data: flattened };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Unknown error" };
  }
}

export async function updateVendorProfile(payload: FormData): Promise<ActionResult<any>> {
  try {
    const data = await apiClient<any>({ 
      method: "PATCH", 
      endpoint: "/api/users/vendors/me/", 
      body: payload 
    });
    return { success: true, data };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Unknown error" };
  }
}
