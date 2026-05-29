import axios, { type AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

export function createApiClient(getAccessToken?: () => string | null): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    // Only send credentials (cookies) when a token accessor is provided.
    // Many public endpoints (market/items, price averages, etc.) should not include cookies
    // to avoid CORS/credential issues in the browser.
    withCredentials: Boolean(getAccessToken),
    headers: {
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken?.();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

