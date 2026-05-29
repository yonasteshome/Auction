import { apiClient } from "@/lib/api";
import { VendorDetailResponse, VendorProductListResponse, VendorReviewListResponse } from "@/types/api/vendor-details";
import { vendorDetailSchema, vendorProductListSchema, vendorProductSchema, vendorReviewListSchema, productSearchParamsSchema, vendorPriceTrendSchema, similarVendorListSchema } from "@/lib/validation/vendor-details";

// Raw shape returned by GET /api/ecommerce/listings/<pk>/
interface RawListing {
  id: string | number;
  item: string | number;
  item_name: string;
  category?: string | null;
  image?: string | null;
  price: number | string;
  unit: string;
  stock_count: number | string;
  date: string;
  is_verified?: boolean;
  vendor_id?: string;
  vendor_name?: string;
}
import { z } from "zod";

type ProductQueryParams = z.infer<typeof productSearchParamsSchema>;

export async function getVendorDetail(vendorId: string) {
  const rawData = await apiClient<VendorDetailResponse>({
    method: "GET",
    endpoint: `/api/market/vendors/${vendorId}/`,
    next: { tags: [`vendor:${vendorId}`], revalidate: 60 },
  });
  return vendorDetailSchema.parse(rawData);
}

export async function getVendorProducts(vendorId: string, params?: ProductQueryParams) {
  const query = productSearchParamsSchema.parse(params || {});
  const rawData = await apiClient<VendorProductListResponse>({
    method: "GET",
    endpoint: `/api/ecommerce/vendors/${vendorId}/listings/`,
    query: query as Record<string, string | number | boolean | null | undefined>,
    next: { tags: [`vendor:${vendorId}:products`], revalidate: 60 },
  });
  return vendorProductListSchema.parse(rawData);
}

export async function getVendorCategories(vendorId: string) {
  const raw = await apiClient<{ categories: string[] }>({
    method: "GET",
    endpoint: `/api/ecommerce/vendors/${vendorId}/categories/`,
    next: { tags: [`vendor:${vendorId}:categories`], revalidate: 300 },
  });
  return Array.isArray(raw?.categories) ? raw.categories : [];
}

export async function getVendorReviews(vendorId: string, page: number = 1) {
  const rawData = await apiClient<VendorReviewListResponse>({
    method: "GET",
    endpoint: `/api/market/vendors/${vendorId}/reviews/`,
    query: { page },
    next: { tags: [`vendor:${vendorId}:reviews`], revalidate: 60 },
  });
  return vendorReviewListSchema.parse(rawData);
}

export async function getVendorListing(listingId: string) {
  const rawData = await apiClient<RawListing>({
    method: "GET",
    endpoint: `/api/ecommerce/listings/${listingId}/`,
    next: { tags: [`listing:${listingId}`], revalidate: 60 },
  });
  return vendorProductSchema.parse(rawData);
}

export async function getVendorPriceTrend(vendorId: string) {
  const rawData = await apiClient<any>({
    method: "GET",
    endpoint: `/api/market/vendors/${vendorId}/price-trend/`,
    next: { tags: [`vendor:${vendorId}:price-trend`], revalidate: 60 },
  });
  return vendorPriceTrendSchema.parse(rawData);
}

export async function getSimilarVendors(vendorId: string, region?: string, limit: number = 6) {
  const rawData = await apiClient<any>({
    method: "GET",
    endpoint: `/api/market/vendors/${vendorId}/similar/`,
    query: { region, limit },
    next: { tags: [`vendor:${vendorId}:similar`], revalidate: 60 },
  });
  return similarVendorListSchema.parse(rawData);
}

