import { apiClient } from "@/lib/api";
import {
    adminSubmissionSchema,
    adminSubmissionsListSchema,
} from "@/lib/validation/admin-submissions";
import {
    type AdminModerationStats,
    type AdminSubmission,
    type AdminSubmissionsListResponse,
} from "@/types/api/admin-submissions";
import { z } from "zod";

const moderationStatsSchema = z.object({
  pending: z.number(),
  approved_today: z.number(),
  rejected_today: z.number(),
  outlier_flagged: z.number(),
  ml: z.object({
    last_run_id: z.number().nullable(),
    last_run_status: z.string().nullable(),
    last_run_model: z.string().nullable(),
    last_run_at: z.string().nullable(),
    avg_mape: z.number().nullable(),
    avg_mse: z.number().nullable(),
    items_trained: z.number(),
    model_runs_total: z.number(),
    active_forecasts: z.number(),
  }),
});

export async function getAdminSubmissions(params: {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  page_size?: number;
  search?: string;
  outlier?: boolean;
} = {}): Promise<AdminSubmissionsListResponse> {
  const raw = await apiClient<AdminSubmissionsListResponse>({
    method: "GET",
    endpoint: "/api/market/admin/submissions",
    query: {
      status: params.status ?? "pending",
      page: params.page ?? 1,
      page_size: params.page_size ?? 12,
      search: params.search ?? "",
      outlier: params.outlier ? "true" : undefined,
    },
    next: { tags: ["admin-submissions"] },
  });
  return adminSubmissionsListSchema.parse(raw);
}

export async function getAdminModerationStats(): Promise<AdminModerationStats> {
  const raw = await apiClient<AdminModerationStats>({
    method: "GET",
    endpoint: "/api/market/admin/moderation-stats",
    next: { tags: ["admin-moderation-stats"], revalidate: 30 },
  });
  return moderationStatsSchema.parse(raw);
}

export async function getAdminSubmissionDetail(id: number): Promise<AdminSubmission> {
  const raw = await apiClient<AdminSubmission>({
    method: "GET",
    endpoint: `/api/market/admin/submissions/${id}`,
    next: { tags: [`admin-submission-${id}`] },
  });
  return adminSubmissionSchema.parse(raw);
}
