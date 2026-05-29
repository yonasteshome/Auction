import { apiClient } from "@/lib/api";

export type AdminDashboardTrendPoint = {
  date: string;
  label: string;
  users: number;
  vendors: number;
  flags: number;
  suspensions: number;
  reviews: number;
};

export type AdminDashboardActivity = {
  id: number;
  actor_name: string | null;
  action: string;
  resource: string;
  resource_id: string;
  detail: Record<string, unknown>;
  created_at: string;
};

export type AdminVendorRatingRow = {
  id: string;
  shop_name: string;
  city: string;
  rating_avg: string;
  rating_count: number;
  is_verified: boolean;
  verification_status: string;
};

export type AdminDashboardStats = {
  total_users: number;
  active_users: number;
  total_vendors: number;
  verified_vendors: number;
  pending_vendors: number;
  rejected_vendors: number;
  suspended_vendors: number;
  price_flags_today: number;
  total_reviews: number;
  average_rating: number;
};

export type AdminDashboardSummary = {
  stats: AdminDashboardStats;
  activity_trend: AdminDashboardTrendPoint[];
  recent_activity: AdminDashboardActivity[];
  top_rated_vendors: AdminVendorRatingRow[];
  least_rated_vendors: AdminVendorRatingRow[];
};

export async function getAdminDashboard() {
  return apiClient<AdminDashboardSummary>({
    method: "GET",
    endpoint: "/api/admin/dashboard/",
    next: { tags: ["admin-dashboard"] },
  });
}