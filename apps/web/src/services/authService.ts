import { createApiClient } from "./apiClient";

export type TokenPair = { access: string; refresh: string };

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
};

export async function login(payload: LoginPayload): Promise<TokenPair> {
  const api = createApiClient();
  const { data } = await api.post<TokenPair>("/api/auth/token/", payload);
  return data;
}

export async function refreshAccessToken(refresh: string): Promise<{ access: string }> {
  const api = createApiClient();
  const { data } = await api.post<{ access: string }>("/api/auth/token/refresh/", { refresh });
  return data;
}

export async function register(payload: RegisterPayload): Promise<unknown> {
  const api = createApiClient();
  const { data } = await api.post("/api/users/register/", payload);
  return data;
}

export async function forgotPassword(email: string): Promise<{ detail?: string }> {
  const api = createApiClient();
  const { data } = await api.post<{ detail?: string }>("/api/users/password/reset/request/", { email });
  return data;
}

export async function resetPassword(payload: {
  uid: string;
  token: string;
  new_password: string;
}): Promise<{ detail?: string }> {
  const api = createApiClient();
  const { data } = await api.post<{ detail?: string }>("/api/users/password/reset/confirm/", payload);
  return data;
}

