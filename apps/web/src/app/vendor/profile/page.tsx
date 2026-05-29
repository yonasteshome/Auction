export const dynamic = "force-dynamic";

import type { VendorProfile } from "../_lib/vendor-api";
import { apiClient } from "@/lib/api";
import VendorProfileClient from "./VendorProfileClient";

export default async function VendorProfilePage() {
  let profile: VendorProfile | null = null;

  try {
    const userProfile = await apiClient<VendorProfile>({ method: "GET", endpoint: "/api/users/me/" });
    let vendorData: any = {};
    try {
      vendorData = await apiClient<any>({ method: "GET", endpoint: "/api/users/vendors/me/" });
    } catch {
      // maybe not a vendor yet or fetch failed
    }
    profile = { ...userProfile, ...vendorData };
  } catch (err) {
    // server-side fetch failed; log and continue — client will render fallback
    console.error("Failed to load profile server-side:", err);
    profile = null;
  }

  return (
    <main className="min-h-[calc(100vh-64px)] p-4 md:ml-64 md:p-8">
      <VendorProfileClient initialProfile={profile} />
    </main>
  );
}

