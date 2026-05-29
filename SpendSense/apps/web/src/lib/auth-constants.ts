export const AUTH_COOKIE_NAME = "spendsense_access_token";
export const AUTH_REFRESH_COOKIE_NAME = "spendsense_refresh_token";
export const DEFAULT_AUTH_REDIRECT = "/dashboard";
export const AUTH_PROFILE_COOKIE_NAME = "spendsense_profile";

export type AppRole = "user" | "vendor" | "admin" | "analyst";

export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toLowerCase();
  if (
    normalized === "user" ||
    normalized === "vendor" ||
    normalized === "admin" ||
    normalized === "analyst"
  ) {
    return normalized;
  }

  return null;
}

export function getDefaultRouteForRole(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case "vendor":
      return "/vendor/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "analyst":
      return "/analytics";
    case "user":
      return "/dashboard";
    default:
      return DEFAULT_AUTH_REDIRECT;
  }
}

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (!value.startsWith("/")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}
