import { z } from 'zod';

// Matches GET /api/market/items/<pk>/
export const itemResponseSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  description: z.string().default(''),
  image: z.string().nullable().default(null),
  image_url: z.string().nullable().optional(),
});

// Composed product detail schema
export const productDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  description: z.string(),
  imageUrls: z.array(z.string()),
  currentAveragePrice: z.coerce.number(),
  priceTrend: z.coerce.number(),
  priceTrendDirection: z.enum(['up', 'down', 'stable']),
  lastUpdated: z.string(),
  lowestPrice: z.object({ price: z.coerce.number(), vendorName: z.string(), location: z.string() }).nullable(),
  highestPrice: z.object({ price: z.coerce.number(), vendorName: z.string(), location: z.string() }).nullable(),
  nationalAveragePrice: z.coerce.number(),
});

// Matches GET /api/market/trends/?item_id=X data points
export const priceTrendPointSchema = z.object({
  date: z.string(),
  average_price: z.string(),
  count: z.coerce.number(),
});

// Composed price history schema
export const priceHistorySchema = z.object({
  itemId: z.string(),
  timeRange: z.string(),
  dataPoints: z.array(z.object({
    date: z.string(),
    price: z.coerce.number(),
    isForecast: z.boolean(),
    isLastHistorical: z.boolean().optional(),
    confidenceInterval: z.tuple([z.coerce.number(), z.coerce.number()]).optional(),
    confidenceLow: z.coerce.number().optional(),
    confidenceHigh: z.coerce.number().optional(),
  })),
  nationalAverageDataPoints: z.array(z.object({
    date: z.string(),
    price: z.coerce.number(),
  })),
});

// Matches GET /api/market/vendors/prices/?item_id=X (MarketVendorPrice serializer)
export const vendorPriceComparisonSchema = z.object({
  id: z.coerce.number(),
  vendor_id: z.string(),
  vendor_name: z.string(),
  city: z.string(),
  rating_avg: z.string(),
  is_verified: z.boolean(),
  price: z.string(),
  date: z.string(),
});

// Matches GET /api/market/items/?category=X (same-category items)
export const similarProductSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  description: z.string().default(''),
  image: z.string().nullable().default(null),
  image_url: z.string().nullable().optional(),
});

// Matches GET /api/market/prices/averages/?item_id=X
export const priceSubmissionSchema = z.object({
  item_id: z.coerce.number(),
  item_name: z.string(),
  average_price: z.string(),
  city: z.string(),
  source: z.string(),
  count: z.coerce.number(),
});

export const priceAlertInputSchema = z.object({
  targetPrice: z.coerce.number().positive(),
  itemId: z.string(),
  city: z.string().optional(),
});

export const productSearchParamsSchema = z.object({
  timeRange: z.enum(['1W', '1M', '3M', '6M', '1Y', 'ALL']).optional(),
  location: z.string().optional(),
});
