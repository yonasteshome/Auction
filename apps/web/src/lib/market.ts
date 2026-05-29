import { apiClient } from "@/lib/api";
import { marketCategorySchema, marketItemSchema, paginatedSchema } from "@/lib/validation/vendor";
import { MarketCategory, MarketItem, PaginatedResponse } from "@/types/api/vendor";
import { z } from "zod";

/**
 * Fetches ALL market items across pages (DRF default page size is 20).
 * Recursively follows `next` URL until all items are collected.
 */
export async function getMarketItems(): Promise<MarketItem[]> {
  const allItems: MarketItem[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await apiClient<PaginatedResponse<MarketItem>>({
      method: "GET",
      endpoint: "/api/market/items/",
      query: { page },
      next: { tags: ["market-items"] },
    });

    const validated = paginatedSchema(marketItemSchema).parse(data);
    allItems.push(...validated.results);

    hasMore = validated.next !== null;
    page++;
  }

  return allItems;
}

/**
 * Categories endpoint uses a plain APIView (not ListAPIView),
 * so it returns a raw array — no pagination wrapper.
 */
export async function getMarketCategories(): Promise<MarketCategory[]> {
  const data = await apiClient<MarketCategory[]>({
    method: "GET",
    endpoint: "/api/market/categories/",
    cache: "no-store",
  });

  return z.array(marketCategorySchema).parse(data);
}
