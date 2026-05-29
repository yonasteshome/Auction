export interface VendorDetailResponse {
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
  verifiedStatus: "Verified" | "Unverified" | "Pending";
  contactInfo: string;
  itemsListed: number;
  priceRangeMin: number;
  priceRangeMax: number;
  topItems: VendorTopItemResponse[];
  imageUrl: string | null;
  createdAt: string;
  description: string;
  businessHours: string | { day: string; start: string; end: string }[] | null;
  deliveryAvailable: boolean;
  deliveryEstimate: string | null;
  paymentMethods: string[];
  totalSales: number;
  memberSince: string;
  responseTimeMinutes: number;
  socialLinks: Record<string, string> | null;
}

export interface VendorTopItemResponse {
  itemName: string;
  price: number;
  unit: string;
}

export interface VendorProductResponse {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  imageUrl: string | null;
  description: string;
  variant: string;
  price: number;
  basePrice: number | null;
  unit: string;
  comparePrice: number | null;
  stockStatus: "InStock" | "LowStock" | "OutOfStock";
  stockQuantity: number;
  priceTrend: number;
  nationalAveragePrice: number;
  nationalAverageDiff: number;
  createdAt: string;
  updatedAt: string;
  vendorId?: string;
  vendorName?: string;
}

export interface VendorPagination {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
}

export interface VendorProductListResponse {
  products: VendorProductResponse[];
  pagination: VendorPagination;
  categories: string[];
  priceRange: { min: number; max: number };
}

export interface VendorReviewResponse {
  id: string;
  userName: string;
  userInitial: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
}

export interface VendorReviewListResponse {
  reviews: VendorReviewResponse[];
  pagination: VendorPagination;
  averageRating: number;
  totalReviews: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
  eligibility?: "eligible" | "ineligible" | "already_reviewed" | null;
  verifiedPurchaseDetails?: {
    itemName: string;
    date: string;
  } | null;
  userReview?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    canEdit: boolean;
    expiresInSeconds: number;
  } | null;
}
