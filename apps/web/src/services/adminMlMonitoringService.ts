import { apiClient } from "@/lib/api";

export type AdminMlMonitoringDriftRow = {
  label: string;
  value: string;
  width: string;
  tone: "error" | "ok";
};

export type AdminMlMonitoringTimelineItem = {
  title: string;
  subtitle: string;
  tag: string;
  tone: "blue" | "gray";
  faded?: boolean;
};

export type AdminMlMonitoringEvent = {
  type: string;
  entity: string;
  trigger: string;
  ts: string;
  status: string;
};

export type AdminMlMonitoringSummary = {
  live_model: {
    model_used: string | null;
    status: string | null;
    item_count: number;
    detail: Record<string, unknown>;
    created_at: string | null;
  };
  trend: {
    values: number[];
    labels: string[];
  };
  performance: {
    values: number[];
  };
  drift: {
    rows: AdminMlMonitoringDriftRow[];
    critical: string | null;
  };
  timeline: AdminMlMonitoringTimelineItem[];
  events: AdminMlMonitoringEvent[];
  generated_at: string;
};

export async function getAdminMlMonitoring() {
  return apiClient<AdminMlMonitoringSummary>({
    method: "GET",
    endpoint: "/api/admin/ml/monitoring/",
    next: { tags: ["admin-ml-monitoring"] },
  });
}
