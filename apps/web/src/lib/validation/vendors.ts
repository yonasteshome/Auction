import { z } from "zod";

export const topItemSchema = z.object({
  itemName: z.string(),
  price: z.number(),
  unit: z.string(),
});

export const verifiedStatusSchema = z.enum(["Verified", "Unverified", "Pending"]);

export const vendorSchema = z.object({
  id: z.string(),
  vendorName: z.string(),
  shopName: z.string(),
  location: z.string(),
  region: z.string(),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().nonnegative(),
  competitivenessScore: z.number().min(0).max(100),
  verifiedStatus: verifiedStatusSchema,
  contactInfo: z.string(),
  itemsListed: z.number().nonnegative(),
  priceRangeMin: z.number().nonnegative(),
  priceRangeMax: z.number().nonnegative(),
  priceForSearchedItem: z.number().nullable().optional(),
  topItems: z.array(topItemSchema),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
});

export const vendorPaginationSchema = z.object({
  total_records: z.number().nonnegative(),
  total_pages: z.number().nonnegative(),
  page_size: z.number().nonnegative(),
  current_page: z.number().nonnegative(),
});

export const vendorListSchema = z.object({
  pagination: vendorPaginationSchema,
  results: z.array(vendorSchema),
});

export const vendorSearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  sortBy: z.enum(["popularity", "price", "rating", "nearest", "value", "reliability"]).default("value").optional(),
  page: z.coerce.number().default(1).optional(),
  pageSize: z.coerce.number().default(12).optional(),
});

