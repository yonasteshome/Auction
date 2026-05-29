export type VerifiedStatus = "Verified" | "Unverified" | "Pending";

export interface TopItem {
  itemName: string;
  price: number;
  unit: string;
}

export interface VendorResponse {
  id: string;
  vendorName: string;
  shopName: string;
  location: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  reviewCount: number;
  competitivenessScore: number;
  verifiedStatus: VerifiedStatus;
  contactInfo: string;
  itemsListed: number;
  priceRangeMin: number;
  priceRangeMax: number;
  priceForSearchedItem?: number | null;
  topItems: TopItem[];
  imageUrl: string | null;
  createdAt: string;
}

export interface VendorPagination {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
}

export interface VendorListResponse {
  pagination: VendorPagination;
  results: VendorResponse[];
}
