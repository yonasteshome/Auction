import { apiClient } from "@/lib/api";
import {
  contributorStatsSchema,
  itemAveragesSchema,
  mySubmissionsListSchema,
} from "@/lib/validation/price-submissions";
import type {
  ContributorStatsResponse,
  ItemAveragesResponse,
  MySubmissionsListResponse,
  SubmissionStatus,
} from "@/types/api/price-submissions";

export async function getMySubmissions(params?: {
  status?: SubmissionStatus;
  page?: number;
  page_size?: number;
}): Promise<MySubmissionsListResponse> {
  const raw = await apiClient<MySubmissionsListResponse>({
    method: "GET",
    endpoint: "/api/market/prices/my-submissions/",
    query: {
      status: params?.status,
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 10,
    },
    next: { tags: ["my-price-submissions"] },
  });
  return mySubmissionsListSchema.parse(raw);
}

export async function getContributorStats(): Promise<ContributorStatsResponse> {
  const raw = await apiClient<ContributorStatsResponse>({
    method: "GET",
    endpoint: "/api/market/prices/contributor-stats/",
    next: { tags: ["contributor-stats"] },
  });
  return contributorStatsSchema.parse(raw);
}

export async function getItemAverages(params: {
  itemId: number;
  location?: string;
  city?: string;
}): Promise<ItemAveragesResponse> {
  const raw = await apiClient<ItemAveragesResponse>({
    method: "GET",
    endpoint: "/api/market/prices/item-averages/",
    query: {
      item_id: params.itemId,
      location: params.location,
      city: params.city,
    },
    next: { revalidate: 60, tags: [`item-averages-${params.itemId}`] },
  });
  return itemAveragesSchema.parse(raw);
}
