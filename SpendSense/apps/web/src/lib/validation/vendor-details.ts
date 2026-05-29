import { z } from "zod";
import { topItemSchema, vendorPaginationSchema } from "./vendors";

export const vendorDetailSchema = z.object({
  id: z.string(),
  vendorName: z.string(),
  shopName: z.string(),
  location: z.string(),
  region: z.string(),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  rating: z.coerce.number(),
  reviewCount: z.coerce.number(),
  competitivenessScore: z.coerce.number(),
  verifiedStatus: z.enum(["Verified", "Unverified", "Pending"]),
  contactInfo: z.string(),
  itemsListed: z.coerce.number(),
  priceRangeMin: z.coerce.number(),
  priceRangeMax: z.coerce.number(),
  topItems: z.array(topItemSchema),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  description: z.string(),
  businessHours: z.union([
    z.string(),
    z.array(z.object({
      day: z.string(),
      start: z.string(),
      end: z.string(),
    }))
  ]).nullable().optional().default(""),
  deliveryAvailable: z.boolean(),
  deliveryEstimate: z.string().nullable(),
  paymentMethods: z.array(z.string()),
  totalSales: z.coerce.number(),
  memberSince: z.string(),
  responseTimeMinutes: z.coerce.number(),
  socialLinks: z.record(z.string(), z.string()).nullable(),
});

export const vendorProductSchema = z.object({
  id: z.coerce.string(),
  item: z.coerce.string(),
  item_name: z.string(),
  category: z.string().nullable().default("Uncategorized"),
  image: z.string().nullable(),
  description: z.string().default(""),
  variant: z.string().default(""),
  price: z.coerce.number(),
  base_price: z.coerce.number().nullable().optional(),
  unit: z.string(),
  stock_count: z.coerce.number(),
  date: z.string(),
  is_verified: z.boolean().optional(),
  vendor_id: z.string().optional(),
  vendor_name: z.string().optional(),
}).transform((data) => ({
  id: data.id,
  itemId: data.item,
  itemName: data.item_name,
  category: data.category || "Uncategorized",
  imageUrl: data.image,
  description: data.description,
  variant: data.variant,
  price: data.price,
  basePrice: data.base_price ?? data.price,
  unit: data.unit,
  comparePrice: null,
  stockStatus: (data.stock_count > 10 ? "InStock" : data.stock_count > 0 ? "LowStock" : "OutOfStock") as "InStock" | "LowStock" | "OutOfStock",
  stockQuantity: data.stock_count,
  priceTrend: 0,
  nationalAveragePrice: 0,
  nationalAverageDiff: 0,
  createdAt: data.date,
  updatedAt: data.date,
  vendorId: data.vendor_id,
  vendorName: data.vendor_name,
}));

export const vendorProductListSchema = z.object({
  results: z.array(vendorProductSchema),
  pagination: vendorPaginationSchema,
}).transform((data) => {
  const products = data.results;
  const prices = products.map((p) => p.price);
  // Prefer backend-provided categories if available; otherwise derive from results
  const backendCats = (data as any).categories;
  const categories = Array.isArray(backendCats) && backendCats.length
    ? Array.from(new Set(backendCats.map((c: any) => String(c))))
    : Array.from(new Set(products.map((p) => p.category)));

  return {
    products,
    pagination: data.pagination,
    categories,
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
});

export const vendorReviewSchema = z.object({
  id: z.string(),
  userName: z.string(),
  userInitial: z.string(),
  rating: z.number(),
  comment: z.string(),
  date: z.string(),
  helpfulCount: z.number(),
  verifiedPurchase: z.boolean(),
});

export const vendorReviewListSchema = z.object({
  reviews: z.array(vendorReviewSchema),
  pagination: vendorPaginationSchema,
  averageRating: z.number(),
  totalReviews: z.number(),
  distribution: z.record(z.string(), z.number()),
  eligibility: z.enum(["eligible", "ineligible", "already_reviewed"]).optional().nullable(),
  verifiedPurchaseDetails: z.object({
    itemName: z.string(),
    date: z.string(),
  }).optional().nullable(),
  userReview: z.object({
    id: z.string(),
    rating: z.number(),
    comment: z.string(),
    createdAt: z.string(),
    canEdit: z.boolean(),
    expiresInSeconds: z.number(),
  }).optional().nullable(),
});

export const productSearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(["popularity", "price", "newest"]).optional(),
  page: z.coerce.number().optional(),
  page_size: z.coerce.number().optional(),
});

export const vendorPriceTrendSchema = z.object({
  weeks: z.array(z.string()),
  vendorPrices: z.array(z.number()),
  marketPrices: z.array(z.number()),
});

export const similarVendorSchema = z.object({
  id: z.string(),
  shopName: z.string(),
  imageUrl: z.string().nullable(),
  rating: z.number(),
  reviewCount: z.number(),
  location: z.string(),
  itemsListed: z.number(),
  competitivenessScore: z.number(),
});

export const similarVendorListSchema = z.array(similarVendorSchema);

