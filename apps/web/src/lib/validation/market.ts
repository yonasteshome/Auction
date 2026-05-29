import { z } from "zod";
import { paginatedSchema } from "./vendor";

export const priceAverageRowSchema = z.object({
  item_id: z.number(),
  item_name: z.string(),
  average_price: z.string(),
  city: z.string(),
  source: z.string(),
  count: z.number(),
});

export const trendPointSchema = z.object({
  date: z.string(),
  average_price: z.string(),
  count: z.number(),
});

export const forecastPointSchema = z.object({
  item_id: z.number(),
  forecast_date: z.string(),
  predicted_price: z.string(),
  confidence_low: z.string().nullable(),
  confidence_high: z.string().nullable(),
  model_used: z.string(),
  city: z.string().nullable().optional(),
});

export const inflationResponseSchema = z.object({
  period: z.string(),
  city: z.string().nullable(),
  item_id: z.number().nullable(),
  current_avg: z.string().nullable(),
  previous_avg: z.string().nullable(),
  change_percent: z.number().nullable(),
});

export const vendorPriceRowSchema = z.object({
  id: z.number(),
  vendor_id: z.string(),
  vendor_name: z.string(),
  city: z.string(),
  rating_avg: z.string(),
  is_verified: z.boolean(),
  price: z.string(),
  date: z.string(),
  stock_count: z.number().optional().nullable(),
});

export const priceAverageListSchema = z
  .array(priceAverageRowSchema)
  .or(paginatedSchema(priceAverageRowSchema).transform((data) => data.results));

export const trendListSchema = z
  .array(trendPointSchema)
  .or(paginatedSchema(trendPointSchema).transform((data) => data.results));

export const forecastListSchema = z
  .array(forecastPointSchema)
  .or(paginatedSchema(forecastPointSchema).transform((data) => data.results));

export const vendorPriceListSchema = z
  .array(vendorPriceRowSchema)
  .or(paginatedSchema(vendorPriceRowSchema).transform((data) => data.results));

export const priceAlertSchema = z.object({
  id: z.number(),
  item: z.number(),
  item_name: z.string(),
  target_price: z.string(),
  city: z.string().nullable().optional(),
  is_active: z.boolean(),
  triggered_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const priceAlertListSchema = z
  .array(priceAlertSchema)
  .or(paginatedSchema(priceAlertSchema).transform((data) => data.results));

export const livePriceItemSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  avgPrice: z.number().nullable().optional(),
  bestPrice: z.number().nullable().optional(),
  bestCity: z.string().nullable().optional(),
  submissionCount: z.coerce.number(),
});

export const livePriceResponseSchema = z.object({
  results: z.array(livePriceItemSchema),
  pagination: z.object({
    total_records: z.number(),
    total_pages: z.number(),
    page_size: z.number(),
    current_page: z.number(),
  }),
  categories: z.array(z.string()),
  cities: z.array(z.string()),
  last_updated: z.string(),
  summaries: z.object({
    avgBasketCost: z.number().nullable().optional(),
    mostVolatileName: z.string().nullable().optional(),
    mostVolatileCount: z.coerce.number(),
    bestValueCity: z.string().nullable().optional(),
    bestValuePrice: z.number().nullable().optional(),
  }),
});
