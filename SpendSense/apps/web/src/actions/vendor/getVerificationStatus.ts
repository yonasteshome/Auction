"use server";

import { apiClient } from "@/lib/api";

interface VendorStatus {
  is_verified: boolean;
  verification_status: 'unrequested' | 'requested' | 'pending' | 'verified' | 'rejected' | 'suspended';
  shop_name?: string;
  verification_rejection_reason?: string | null;
}

export async function getVerificationStatus() {
  try {
    const rawData = await apiClient<any>({
      method: "GET",
      endpoint: "/api/users/me/",
      next: { tags: ["profile"] },
    });
    
    const vendorInfo = rawData.vendor_info || {};
    return {
      is_verified: vendorInfo.is_verified || false,
      verification_status: vendorInfo.verification_status || 'unrequested',
      shop_name: vendorInfo.shop_name,
      verification_rejection_reason: vendorInfo.verification_rejection_reason || null,
    } as VendorStatus;
  } catch (error) {
    console.error("Failed to get verification status:", error);
    return null;
  }
}
