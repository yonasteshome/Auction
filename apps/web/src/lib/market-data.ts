import { apiClient } from "@/lib/api";
import {
  forecastListSchema,
  inflationResponseSchema,
  priceAverageListSchema,
  trendListSchema,
  vendorPriceListSchema,
  priceAlertListSchema,
  livePriceResponseSchema,
} from "@/lib/validation/market";
import { marketItemSchema } from "@/lib/validation/vendor";
import type {
  ForecastListResponse,
  ForecastPoint,
  InflationResponse,
  PriceAverageListResponse,
  PriceAverageRow,
  TrendListResponse,
  TrendPoint,
  VendorPriceListResponse,
  VendorPriceRow,
  PriceAlert,
  PriceAlertListResponse,
  LivePriceResponse,
} from "@/types/api/market";
import type { MarketItem } from "@/types/api/vendor";

type PriceAverageParams = {
  item_id?: number;
  city?: string;
  from_date?: string;
  to_date?: string;
};

type TrendParams = {
  item_id: number;
  city?: string;
  from_date?: string;
  to_date?: string;
};

type ForecastParams = {
  item_id: number;
  city?: string;
  forecast_weeks?: number;
};

type InflationParams = {
  period?: "week" | "month";
  city?: string;
  item_id?: number;
};

export async function getPriceAverages(
  params?: PriceAverageParams,
): Promise<PriceAverageRow[]> {
  const data = await apiClient<PriceAverageListResponse>({
    method: "GET",
    endpoint: "/api/market/prices/averages/",
    query: params,
    cache: "no-store",
  });

  return priceAverageListSchema.parse(data);
}

export async function getMarketItem(itemId: number): Promise<MarketItem> {
  const data = await apiClient<MarketItem>({
    method: "GET",
    endpoint: `/api/market/items/${itemId}/`,
    cache: "no-store",
  });

  return marketItemSchema.parse(data);
}

export async function getPriceTrends(params: TrendParams): Promise<TrendPoint[]> {
  const data = await apiClient<TrendListResponse>({
    method: "GET",
    endpoint: "/api/market/trends/",
    query: params,
    cache: "no-store",
  });

  return trendListSchema.parse(data);
}

export async function getMarketForecasts(
  params: ForecastParams,
): Promise<ForecastPoint[]> {
  const data = await apiClient<ForecastListResponse>({
    method: "GET",
    endpoint: "/api/market/forecasts/",
    query: params,
    cache: "no-store",
  });

  return forecastListSchema.parse(data);
}

export async function getInflationData(
  params?: InflationParams,
): Promise<InflationResponse> {
  const data = await apiClient<InflationResponse>({
    method: "GET",
    endpoint: "/api/market/inflation/",
    query: params,
    cache: "no-store",
  });

  return inflationResponseSchema.parse(data);
}

export async function getItemVendorPrices(
  itemId: number,
): Promise<VendorPriceRow[]> {
  const data = await apiClient<VendorPriceListResponse>({
    method: "GET",
    endpoint: "/api/market/vendors/prices/",
    query: { item_id: itemId },
    cache: "no-store",
  });

  return vendorPriceListSchema.parse(data);
}

export async function getPriceAlerts(): Promise<PriceAlert[]> {
  try {
    const data = await apiClient<PriceAlertListResponse>({
      method: "GET",
      endpoint: "/api/market/price-alerts/",
      cache: "no-store",
    });
    return priceAlertListSchema.parse(data);
  } catch (error) {
    console.error("Failed to fetch price alerts:", error);
    return [];
  }
}

export type LivePriceParams = {
  search?: string;
  category?: string;
  city?: string;
  sort?: string;
  page?: number;
  page_size?: number;
};

export async function getLivePrices(params?: LivePriceParams): Promise<LivePriceResponse> {
  const data = await apiClient<LivePriceResponse>({
    method: "GET",
    endpoint: "/api/market/prices/averages/",
    query: params,
    cache: "no-store",
  });

  return livePriceResponseSchema.parse(data);
}

