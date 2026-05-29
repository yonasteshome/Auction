import { apiClient } from "@/lib/api";
import { adminVendorListSchema } from "@/lib/validation/admin-vendors";
import { AdminVendorListResponse } from "@/types/api/admin-vendors";

export type AdminVendorQuery = {
  status?: "all" | "verified" | "pending" | "rejected" | "suspended";
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminVendors(query: AdminVendorQuery = {}) {
  const raw = await apiClient<AdminVendorListResponse>({
    method: "GET",
    endpoint: "/api/ecommerce/admin/vendors/",
    query: {
      status: query.status ?? "all",
      search: query.search,
      page: query.page ?? 1,
      page_size: query.pageSize ?? 10,
    },
    next: { tags: ["admin-vendors"] },
  });

  return adminVendorListSchema.parse(raw);
}

export async function getPendingVendors() {
  return getAdminVendors({ status: "pending" });
}
