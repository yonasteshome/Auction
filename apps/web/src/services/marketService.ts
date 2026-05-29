import { createApiClient } from "./apiClient";

export type MarketItem = {
  id: number;
  name: string;
  category: string;
  unit: string;
};

export type PriceAverageRow = {
  item_id: number;
  item_name: string;
  average_price: string;
  city: string;
  source: string;
  count: number;
};

export type SubmitPricePayload = {
  item_id: number;
  price_value: number | string;
  market_location: string;
  city: string;
  date_observed: string; // YYYY-MM-DD
};

export type PriceSubmissionResponse = {
  id: string;
  item_id: number;
  price_value: string;
  market_location: string;
  city: string;
  date_observed: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  outlier_warning?: string | null;
};

export async function fetchPriceAverages(params?: {
  item_id?: number;
  city?: string;
  from_date?: string;
  to_date?: string;
}): Promise<PriceAverageRow[]> {
  const api = createApiClient();
  const { data } = await api.get<any>("/api/market/prices/averages/", { params });
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function fetchMarketItems(params?: { category?: string; search?: string }): Promise<MarketItem[]> {
  const api = createApiClient();
  const { data } = await api.get<any>("/api/market/items/", { params });
  return data.results ? data.results : data;
}

export async function fetchMarketItem(itemId: number): Promise<MarketItem> {
  const api = createApiClient();
  const { data } = await api.get<MarketItem>(`/api/market/items/${itemId}/`);
  return data;
}

export type TrendPoint = { date: string; average_price: string; count: number };

export async function fetchPriceTrends(params: {
  item_id: number;
  city?: string;
  from_date?: string;
  to_date?: string;
}): Promise<TrendPoint[]> {
  const api = createApiClient();
  const { data } = await api.get<any>("/api/market/trends/", { params });
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export type ForecastPoint = {
  item_id: number;
  forecast_date: string;
  predicted_price: string;
  confidence_low: string | null;
  confidence_high: string | null;
  model_used: string;
  city?: string | null;
};

export async function fetchMarketForecasts(params: {
  item_id: number;
  city?: string;
  forecast_weeks?: number;
}): Promise<ForecastPoint[]> {
  const api = createApiClient();
  const { data } = await api.get<any>("/api/market/forecasts/", { params });
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export type InflationResponse = {
  period: string;
  city: string | null;
  item_id: number | null;
  current_avg: string | null;
  previous_avg: string | null;
  change_percent: number | null;
};

export async function fetchInflationData(params?: {
  period?: "week" | "month";
  city?: string;
  item_id?: number;
}): Promise<InflationResponse> {
  const api = createApiClient();
  const { data } = await api.get<InflationResponse>("/api/market/inflation/", { params });
  return data;
}

export async function createPriceSubmission(accessToken: string, payload: SubmitPricePayload): Promise<PriceSubmissionResponse> {
  const api = createApiClient(() => accessToken);
  const { data } = await api.post<PriceSubmissionResponse>("/api/market/prices/submit/", payload);
  return data;
}

export type VendorPriceRow = {
  id: number;
  vendor_id: string;
  vendor_name: string;
  city: string;
  rating_avg: string;
  is_verified: boolean;
  price: string;
  date: string;
};

export async function fetchItemVendorPrices(itemId: number): Promise<VendorPriceRow[]> {
  const api = createApiClient();
  const { data } = await api.get<any>("/api/market/vendors/prices/", { params: { item_id: itemId } });
  return Array.isArray(data) ? data : (data?.results ?? []);
}

