export interface VendorPriceListing {
  id: number | string;
  item: number | string;
  item_name: string;
  unit?: string;
  description?: string;
  variant?: string;
  price: number | string;
  base_price?: number | string | null;
  stock_count?: number;
  date?: string;
  is_verified?: boolean;
  vendor_id?: string | number;
  vendor_name?: string;
  city?: string | null;
  image_url?: string | null;
  category?: string | null;
  rating_avg?: number | string | null;
}

export interface VendorPriceListResponse {
  results: VendorPriceListing[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export type SortKey = 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'distance';
