import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./auth-constants";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000"
).trim();

function getApiBaseUrls() {
  const bases = [API_BASE_URL];

  if (API_BASE_URL.includes("127.0.0.1")) {
    bases.push(API_BASE_URL.replace("127.0.0.1", "localhost"));
  }

  if (API_BASE_URL.includes("localhost")) {
    bases.push(API_BASE_URL.replace("localhost", "127.0.0.1"));
  }

  return [...new Set(bases)];
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError;
}

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

type QueryValue = string | number | boolean | null | undefined;

export interface ApiClientConfig {
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  endpoint: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  fetchOptions?: RequestInit;
  next?: NextFetchOptions;
  cache?: RequestCache;
  responseType?: "json" | "blob" | "text";
  skipAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return { ...headers };
}

function getErrorMessage(parsedError: unknown, status: number, contentType: string) {
  if (contentType.includes("text/html")) {
    return `Request failed with status ${status}`;
  }

  const errorObject =
    parsedError && typeof parsedError === "object"
      ? (parsedError as Record<string, unknown>)
      : null;

  return (
    (errorObject?.message as string | undefined) ||
    (errorObject?.error as string | undefined) ||
    (typeof parsedError === "string" ? parsedError : undefined) ||
    `Request failed with status ${status}`
  );
}

export async function apiClient<T>(config: ApiClientConfig): Promise<T> {
  const {
    method,
    endpoint,
    query = {},
    body,
    fetchOptions,
    cache,
    next,
    responseType = "json",
    skipAuth = false,
  } = config;

  let authHeader: Record<string, string> | undefined;

  if (!skipAuth) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(AUTH_COOKIE_NAME as any)?.value;
      if (accessToken) {
        authHeader = { Authorization: `Bearer ${accessToken}` };
      }
    } catch (e) {
      // Ignore if called in static rendering / non-request context
    }
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  }

  const baseUrls = getApiBaseUrls();
  const requestPath = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
  const requestQuery = searchParams.toString() ? `?${searchParams}` : "";
  const requestUrls = baseUrls.map((baseUrl) => `${baseUrl}${requestPath}${requestQuery}`);

  if (process.env.NODE_ENV === "development") {
    const bodyLog =
      body instanceof FormData
        ? Object.fromEntries(body.entries())
        : body;
    console.log("Prepared url:", requestUrls[0], "Method:", method, "Body:", bodyLog);
  }
  
  const headers = normalizeHeaders(fetchOptions?.headers);
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const mergedHeaders = { ...headers, ...(authHeader ?? {}) };
  const finalFetchOptions = { ...fetchOptions, headers: mergedHeaders };

  let response: Response | null = null;
  let lastNetworkError: unknown = null;

  for (const requestUrl of requestUrls) {
    try {
      response = await fetch(requestUrl, {
        method,
        body: requestBody,
        credentials: "include",
        ...finalFetchOptions,
        ...(next ? { next } : {}),
        ...(cache ? { cache } : {}),
      });
      break;
    } catch (error) {
      lastNetworkError = error;
      if (!isNetworkError(error) || requestUrl === requestUrls[requestUrls.length - 1]) {
        throw error;
      }
    }
  }

  if (!response) {
    throw lastNetworkError instanceof Error
      ? lastNetworkError
      : new TypeError("fetch failed");
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let parsedError: unknown = null;

    try {
      if (contentType.includes("application/json")) {
        parsedError = await response.json();
      } else {
        parsedError = await response.text();
      }
    } catch {
      parsedError = null;
    }

    const message = getErrorMessage(parsedError, response.status, contentType);
    console.log({contentType});
    console.log("Prepared failed url:", requestUrls[0], "Method:", method);

    throw new ApiError(message, response.status, parsedError);
  }

  switch (responseType) {
    case "blob":
      return (await response.blob()) as T;
    case "text":
      return (await response.text()) as T;
    default:
      if (!response.headers.get("content-type")?.includes("application/json")) {
        return undefined as T;
      }
      return (await response.json()) as T;
  }
}

