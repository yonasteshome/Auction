import { createApiClient } from "./apiClient";

export type PurchasePayload = {
  vendor_id: string;
  listing_id: number;
  quantity: number;
  delivery_address?: string;
  payment_method?: string;
};

export async function listRecommendations(
  accessToken: string,
  params?: { item_id?: number; city?: string; limit?: number }
) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<unknown>("/api/ecommerce/recommendations/", { params });
  return data;
}

export async function createPurchase(accessToken: string, payload: PurchasePayload) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.post<unknown>("/api/ecommerce/purchases/", payload);
  return data;
}

export async function getPurchase(accessToken: string, id: string) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<unknown>(`/api/ecommerce/purchases/${id}/`);
  return data;
}

export async function listPurchases(accessToken: string) {
  const api = createApiClient(() => accessToken);
  const { data } = await api.get<unknown>("/api/ecommerce/purchases/");
  return data;
}
