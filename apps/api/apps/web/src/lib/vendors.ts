import { apiClient } from "@/lib/api";
import { VendorListResponse } from "@/types/api/vendors";
import { vendorListSchema, vendorSearchParamsSchema } from "@/lib/validation/vendors";
import { z } from "zod";

type QueryParams = z.infer<typeof vendorSearchParamsSchema>;

export async function getVendors(params?: QueryParams) {
  const query = vendorSearchParamsSchema.parse(params || {});
  
  const rawData = await apiClient<VendorListResponse>({
    method: "GET",
    endpoint: "/vendors",
    query: query as Record<string, string | number | boolean | null | undefined>,
    next: {
      tags: ["vendors"],
      revalidate: 60,
    },
  });

  return vendorListSchema.parse(rawData);
}
