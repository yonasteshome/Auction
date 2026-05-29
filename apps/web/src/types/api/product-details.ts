// MCP-generated types matching the actual /api/market/ backend responses

/** GET /api/market/items/<pk>/ */
export interface ItemResponse {
  id: number;
  name: string;
  category: string;
  unit: string;
  description: string;
  image: string | null;
  image_url?: string | null;
}

/** Composed product detail (built from multiple backend calls) */
export interface ProductDetailResponse {
  id: string;
  name: string;
  category: string;
  unit: string;
  description: string;
  imageUrls: string[];
  currentAveragePrice: number;
  priceTrend: number;
  priceTrendDirection: "up" | "down" | "stable";
  lastUpdated: string;
  lowestPrice: { price: number; vendorName: string; location: string } | null;
  highestPrice: { price: number; vendorName: string; location: string } | null;
  nationalAveragePrice: number;
}

/** GET /api/market/trends/?item_id=X */
export interface PriceTrendPoint {
  date: string;
  average_price: string;
  count: number;
}

/** Composed price history (built from /api/market/trends/) */
export interface PriceHistoryResponse {
  itemId: string;
  timeRange: string;
  dataPoints: {
    date: string;
    price: number;
    isForecast: boolean;
    isLastHistorical?: boolean;
    confidenceInterval?: [number, number];
    confidenceLow?: number;
    confidenceHigh?: number;
  }[];
  nationalAverageDataPoints: { date: string; price: number }[];
}

/** GET /api/market/vendors/prices/?item_id=X — MarketVendorPrice serializer */
export interface VendorPriceComparisonResponse {
  id: number;
  vendor_id: string;
  vendor_name: string;
  city: string;
  rating_avg: string;
  is_verified: boolean;
  price: string;
  date: string;
}

/** GET /api/market/items/?category=X — similar items in the same category */
export interface SimilarProductResponse {
  id: number;
  name: string;
  category: string;
  unit: string;
  description: string;
  image: string | null;
}

/** GET /api/market/prices/averages/?item_id=X */
export interface PriceAverageResponse {
  item_id: number;
  item_name: string;
  average_price: string;
  city: string;
  source: string;
  count: number;
}

// alias kept for backwards compatibility with page.tsx imports
export type PriceSubmissionResponse = PriceAverageResponse;
