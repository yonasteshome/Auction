import type { PaginatedResponse } from "./vendor";

export interface PriceAverageRow {
  item_id: number;
  item_name: string;
  average_price: string;
  city: string;
  source: string;
  count: number;
}

export type PriceAverageListResponse =
  | PriceAverageRow[]
  | PaginatedResponse<PriceAverageRow>;

export interface TrendPoint {
  date: string;
  average_price: string;
  count: number;
}

export type TrendListResponse = TrendPoint[] | PaginatedResponse<TrendPoint>;

export interface ForecastPoint {
  item_id: number;
  forecast_date: string;
  predicted_price: string;
  confidence_low: string | null;
  confidence_high: string | null;
  model_used: string;
  city?: string | null;
}

export type ForecastListResponse =
  | ForecastPoint[]
  | PaginatedResponse<ForecastPoint>;

export interface InflationResponse {
  period: string;
  city: string | null;
  item_id: number | null;
  current_avg: string | null;
  previous_avg: string | null;
  change_percent: number | null;
}

export interface VendorPriceRow {
  id: number;
  vendor_id: string;
  vendor_name: string;
  city: string;
  rating_avg: string;
  is_verified: boolean;
  price: string;
  date: string;
  stock_count?: number | null;
}

export type VendorPriceListResponse =
  | VendorPriceRow[]
  | PaginatedResponse<VendorPriceRow>;

export interface PriceAlert {
  id: number;
  item: number;
  item_name: string;
  target_price: string;
  city?: string | null;
  is_active: boolean;
  triggered_at?: string | null;
  created_at: string;
}

export type PriceAlertListResponse =
  | PriceAlert[]
  | PaginatedResponse<PriceAlert>;

export interface LivePriceItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  avgPrice?: number | null;
  bestPrice?: number | null;
  bestCity?: string | null;
  submissionCount: number;
}

export interface LivePriceResponse {
  results: LivePriceItem[];
  pagination: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
  };
  categories: string[];
  cities: string[];
  last_updated: string;
  summaries: {
    avgBasketCost?: number | null;
    mostVolatileName?: string | null;
    mostVolatileCount: number;
    bestValueCity?: string | null;
    bestValuePrice?: number | null;
  };
}
