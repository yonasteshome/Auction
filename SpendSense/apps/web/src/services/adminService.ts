import { createApiClient } from "./apiClient";

export async function getAdminSubmissions(accessToken: string) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<unknown>("/api/market/admin/submissions/");
  return data;
}

export async function getAdminSettings(accessToken: string) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<unknown>("/api/admin/settings/");
  return data;
}

export async function getAdminAudit(accessToken: string) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<unknown>("/api/admin/audit/");
  return data;
}

export async function getMlStatus(accessToken: string) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<unknown>("/api/admin/ml/status/");
  return data;
}

export async function postMlRetrain(accessToken: string, body?: { forecast_weeks?: number }) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.post<unknown>("/api/admin/ml/retrain/", body ?? {});
  return data;
}
