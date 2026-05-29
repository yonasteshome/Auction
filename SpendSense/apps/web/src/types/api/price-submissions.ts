/**
 * API response interfaces for crowdsource price submission endpoints.
 * Shapes mirror Django market serializers (PriceSubmission, MySubmission, ContributorStats, ItemAverages).
 */

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type TimeObserved = "morning" | "afternoon" | "evening" | "" | string;

export interface PriceSubmissionResponse {
  id: number;
  item_id: number;
  item_name: string;
  item_category: string;
  price_value: string;
  unit: string;
  market_location: string;
  city: string;
  vendor_name: string;
  date_observed: string;
  time_observed: TimeObserved;
  quality_grade: string;
  quantity_available: string | null;
  notes: string;
  status: SubmissionStatus;
  rejection_reason: string;
  outlier_flag: boolean;
  image: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  created_at: string;
  outlier_warning: string | null;
}

export interface MySubmissionResponse {
  id: number;
  item_name: string;
  item_category: string;
  price_value: string;
  unit: string;
  market_location: string;
  city: string;
  vendor_name: string;
  date_observed: string;
  time_observed: TimeObserved;
  quality_grade: string;
  quantity_available: string | null;
  notes: string;
  status: SubmissionStatus;
  rejection_reason: string;
  outlier_flag: boolean;
  image_url: string | null;
  created_at: string;
}

export interface MySubmissionsListResponse {
  results: MySubmissionResponse[];
  pagination: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
  };
}

export interface ContributorStatsResponse {
  total_submissions: number;
  approved: number;
  pending: number;
  rejected: number;
  points: number;
  level: string;
  badge_color: "gold" | "silver" | "bronze";
  rank_progress: number;
  week_submissions: number;
  total_week_submissions: number;
  items_covered: number;
  markets_covered: number;
}

export interface RecentSubmissionContext {
  price: string;
  date: string;
  location: string;
  city: string;
}

export interface ItemAveragesResponse {
  item_id: number;
  national_average: string | null;
  city_average: string | null;
  location_average: string | null;
  recent_submissions: RecentSubmissionContext[];
  total_submissions: number;
}
