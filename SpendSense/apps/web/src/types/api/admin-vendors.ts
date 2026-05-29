export interface AdminVendor {
  id: string;
  shop_name: string;
  city: string;
  address: string;
  contact_phone: string;
  latitude: string | null;
  longitude: string | null;
  is_verified: boolean;
  verification_status: "unrequested" | "requested" | "pending" | "verified" | "rejected" | "suspended";
  verification_rejection_reason?: string;
  business_license: string | null;
  tin_number: string;
  rating_avg: string;
  rating_count: number;
  joined_at: string;
  report_count?: number;
  latest_report_reason?: string;
  latest_reported_at?: string;
  owner_name: string;
  owner_email: string;
}

export interface AdminVendorPagination {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
}

export interface AdminVendorListResponse {
  pagination: AdminVendorPagination;
  results: AdminVendor[];
  stats?: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    suspended: number;
    unrequested: number;
    status_breakdown: {
      verified: number;
      pending: number;
      rejected: number;
      suspended: number;
      unrequested: number;
    };
  };
  active_status?: "all" | "verified" | "pending" | "rejected" | "suspended";
  search?: string;
}
