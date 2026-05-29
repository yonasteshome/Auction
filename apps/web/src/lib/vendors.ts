import { apiClient } from "@/lib/api";
import { VendorListResponse } from "@/types/api/vendors";
import { vendorListSchema, vendorSearchParamsSchema } from "@/lib/validation/vendors";
import { z } from "zod";
import { unstable_cache } from "next/cache";

type QueryParams = z.infer<typeof vendorSearchParamsSchema>;

async function fetchVendorsRaw(query: QueryParams): Promise<VendorListResponse> {
  return apiClient<VendorListResponse>({
    method: "GET",
    endpoint: "/api/market/vendors/",
    query: query as Record<string, string | number | boolean | null | undefined>,
    skipAuth: true,
  });
}

export async function getVendors(params?: QueryParams) {
  const query = vendorSearchParamsSchema.parse(params || {});
  
  const cacheKey = JSON.stringify(query);
  const getCachedVendors = unstable_cache(
    async () => fetchVendorsRaw(query),
    ["vendors-list", cacheKey],
    {
      revalidate: 300,
      tags: ["vendors"],
    }
  );

  const rawData = await getCachedVendors();
  return vendorListSchema.parse(rawData);
}
