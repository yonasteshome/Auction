import { apiClient } from "@/lib/api";
import type { UserProfile } from "@/lib/auth-types";

export type DashboardCategorySpending = {
  category_name: string;
  limit_amount: string;
  spent: string;
  remaining: string;
  percent_used: number;
  warning_80: boolean;
  warning_100: boolean;
};

export type DashboardTrendPoint = {
  day: number;
  label: string;
  amount: string;
};

export type DashboardExpense = {
  id: number;
  category: string;
  amount: string;
  date: string;
  description?: string | null;
  item?: number | null;
  vendor?: number | null;
  payment_method?: string | null;
  receipt?: string | null;
};

export type DashboardNotification = {
  id: number;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
};

export type DashboardSummary = {
  user: UserProfile;
  overview: {
    monthly_spent: string;
    budget_limit: string;
    remaining: string;
    percent_used: number;
    daily_average: string;
    expense_count: number;
    budget_count: number;
    unread_notifications: number;
  };
  current_budget: {
    id: number;
    month: number;
    year: number;
    total_limit: string;
    total_spent: string;
    remaining: string;
    percent_total_used: number;
    warning_total_80: boolean;
    warning_total_100: boolean;
    by_category: DashboardCategorySpending[];
  } | null;
  category_spending: DashboardCategorySpending[];
  monthly_trend: DashboardTrendPoint[];
  recent_expenses: DashboardExpense[];
  notifications: DashboardNotification[];
};

export async function getUserDashboard(): Promise<DashboardSummary> {
  return apiClient<DashboardSummary>({
    method: "GET",
    endpoint: "/api/users/me/dashboard/",
  });
}
