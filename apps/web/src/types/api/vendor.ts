/**
 * MCP-generated interfaces for vendor / market API responses.
 * Matches Django ItemSerializer, VendorPriceSerializer (ecommerce), and MarketCategoriesView.
 */

export interface VendorPriceResponse {
  id: number;
  item: number;
  item_name: string;
  unit: string;
  category: string;
  description: string;
  variant: string;
  price: number;
  base_price: number | null;
  stock_count: number;
  image: string | null;
  images?: {
    id: number;
    url: string;
    position: number;
  }[];
  date: string;
  is_verified: boolean;
}

export interface MarketItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  description: string;
  image: string | null;
}

export interface MarketCategory {
  name: string;
}

/**
 * DRF PageNumberPagination envelope.
 * All ListAPIView endpoints return this shape by default.
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
