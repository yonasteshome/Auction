/**
 * Django REST API auth helpers. Base URL: NEXT_PUBLIC_API_URL or http://127.0.0.1:8000
 */

export const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "http://127.0.0.1:8000";

const ACCESS_KEY = "spendsense_access_token";
const REFRESH_KEY = "spendsense_refresh_token";

export function saveTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<TokenPair> {
  const res = await fetch(`${API_BASE}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(formatApiError(data));
  }

  const parsed = data as { access?: string; refresh?: string };
  if (!parsed.access || !parsed.refresh) {
    throw new Error("Invalid response from server.");
  }

  return { access: parsed.access, refresh: parsed.refresh };
}

export interface RegisterProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  city?: string | null;
  household_size?: number | null;
  income_bracket?: string | null;
  created_at?: string;
}

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
}): Promise<RegisterProfile> {
  const res = await fetch(`${API_BASE}/api/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(formatApiError(data));
  }

  return data as RegisterProfile;
}

/** Register then obtain JWT tokens (same as logging in). */
export async function registerAndLogin(payload: {
  full_name: string;
  email: string;
  password: string;
}): Promise<TokenPair> {
  await registerUser(payload);
  const tokens = await loginWithEmailPassword(payload.email, payload.password);
  saveTokens(tokens.access, tokens.refresh);
  return tokens;
}

export function formatApiError(data: unknown): string {
  if (data == null) return "Something went wrong.";
  if (typeof data === "string") return data;

  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    if (Array.isArray(obj.detail) && obj.detail.length) {
      return obj.detail.map(String).join(" ");
    }
    if (typeof obj.non_field_errors === "object" && Array.isArray(obj.non_field_errors)) {
      return (obj.non_field_errors as string[]).join(" ");
    }

    const parts: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (key === "detail") continue;
      if (Array.isArray(value)) {
        parts.push(`${key}: ${value.join(", ")}`);
      } else if (value != null) {
        parts.push(`${key}: ${String(value)}`);
      }
    }
    if (parts.length) return parts.join("\n");
  }

  return "Request failed. Please try again.";
}
