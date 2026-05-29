import {
    AUTH_COOKIE_NAME,
    AUTH_PROFILE_COOKIE_NAME,
    AUTH_REFRESH_COOKIE_NAME,
    getDefaultRouteForRole,
    normalizeRole,
} from "@/lib/auth-constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const ANY_AUTHENTICATED_ROLE = new Set(["user", "vendor", "admin", "analyst"]);

const ROLE_PROTECTED_ROUTES = [
  { prefix: "/onboarding", allowedRoles: new Set(["user"]) },
  { prefix: "/dashboard", allowedRoles: new Set(["user"]) },
  { prefix: "/notifications", allowedRoles: new Set(["user"]) },
  { prefix: "/profile", allowedRoles: new Set(["user"]) },
  { prefix: "/settings", allowedRoles: new Set(["user"]) },
  { prefix: "/budget", allowedRoles: new Set(["user"]) },
  { prefix: "/expenses", allowedRoles: new Set(["user"]) },
  { prefix: "/reports", allowedRoles: new Set(["user"]) },
  { prefix: "/market", allowedRoles: new Set(["user"]) },
  { prefix: "/shop", allowedRoles: new Set(["user"]) },
  { prefix: "/cart", allowedRoles: new Set(["user"]) },
  { prefix: "/checkout", allowedRoles: new Set(["user"]) },
  { prefix: "/orders", allowedRoles: new Set(["user"]) },
  { prefix: "/reviews", allowedRoles: new Set(["user"]) },
  { prefix: "/vendor", allowedRoles: new Set(["vendor"]) },
  { prefix: "/vendor/register", allowedRoles: new Set(["user", "vendor", "admin"]) },
  { prefix: "/live-prices", allowedRoles: ANY_AUTHENTICATED_ROLE },
  { prefix: "/admin", allowedRoles: new Set(["admin"]) },
  { prefix: "/analytics", allowedRoles: new Set(["analyst", "admin"]) },
];

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function findProtectedRoute(pathname: string) {
  return ROLE_PROTECTED_ROUTES.find((route) => matchesPath(pathname, route.prefix));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payloadJson = atob(padded);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    return payload;
  } catch {
    return null;
  }
}

function extractRoleFromAccessToken(token: string | undefined): string | null {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  // 1) Direct keys
  const directRoleKeys = ["role", "user_role", "userRole"];
  for (const key of directRoleKeys) {
    const value = (payload as any)[key];
    if (typeof value === "string" && value.trim()) {
      return normalizeRole(value as string);
    }
  }

  // 2) Top-level roles array
  if (Array.isArray((payload as any).roles)) {
    const firstRole = (payload as any).roles.find((r: unknown) => typeof r === "string" && (r as string).trim());
    if (typeof firstRole === "string") {
      return normalizeRole(firstRole as string);
    }
  }

  // 3) Common nested locations (Keycloak-style)
  const realmRoles = (payload as any).realm_access?.roles;
  if (Array.isArray(realmRoles)) {
    const first = realmRoles.find((r: unknown) => typeof r === "string" && (r as string).trim());
    if (typeof first === "string") return normalizeRole(first as string);
  }

  const resourceAccess = (payload as any).resource_access;
  if (resourceAccess && typeof resourceAccess === "object") {
    for (const clientKey of Object.keys(resourceAccess)) {
      const client = (resourceAccess as any)[clientKey];
      if (client && Array.isArray(client.roles)) {
        const first = client.roles.find((r: unknown) => typeof r === "string" && (r as string).trim());
        if (typeof first === "string") return normalizeRole(first as string);
      }
    }
  }

  // 4) Shallow recursive scan for keys containing "role"/"roles" (limited depth)
  const queue: unknown[] = [payload];
  const maxDepth = 3;
  let depth = 0;
  while (queue.length && depth < maxDepth) {
    const obj = queue.shift();
    if (!obj || typeof obj !== "object") {
      depth++;
      continue;
    }
    for (const k of Object.keys(obj as Record<string, unknown>)) {
      const v = (obj as any)[k];
      if (typeof k === "string" && k.toLowerCase().includes("role")) {
        if (typeof v === "string" && v.trim()) return normalizeRole(v as string);
        if (Array.isArray(v)) {
          const first = v.find((r: unknown) => typeof r === "string" && (r as string).trim());
          if (typeof first === "string") return normalizeRole(first as string);
        }
      }
      if (typeof v === "object" && v !== null) queue.push(v);
    }
    depth++;
  }

  // For debugging: log available top-level keys when no role found
  // try {
  //   console.log("middleware: JWT payload keys:", Object.keys(payload));
  // } catch {}

  return null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      return data as { access: string; refresh?: string };
    }
  } catch (error) {
    console.error("proxy: Failed to refresh token:", error);
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value;
  const profileCookie = request.cookies.get(AUTH_PROFILE_COOKIE_NAME)?.value;

  let responseCookiesToSet: { name: string; value: string; options: any }[] = [];
  let payload = accessToken ? decodeJwtPayload(accessToken) : null;
  let needsRefresh = false;

  // Check if access token is expired or expires in less than 60 seconds
  if (payload && typeof payload.exp === "number") {
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    if (expiresAt - now < 60 * 1000) {
      needsRefresh = true;
    }
  } else if (!accessToken && refreshToken) {
    needsRefresh = true;
  }

  // Proactive Token Refresh
  if (needsRefresh && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed && refreshed.access) {
      accessToken = refreshed.access;
      if (refreshed.refresh) {
        refreshToken = refreshed.refresh;
      }
      payload = decodeJwtPayload(accessToken);

      const isProduction = process.env.NODE_ENV === "production";
      
      responseCookiesToSet.push({
        name: AUTH_COOKIE_NAME,
        value: accessToken,
        options: {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60, // 15 mins
        }
      });

      if (refreshed.refresh) {
        responseCookiesToSet.push({
          name: AUTH_REFRESH_COOKIE_NAME,
          value: refreshToken,
          options: {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          }
        });
      }

      // Update the request cookies so subsequent logic sees the new tokens
      request.cookies.set(AUTH_COOKIE_NAME, accessToken);
      if (refreshed.refresh) {
        request.cookies.set(AUTH_REFRESH_COOKIE_NAME, refreshToken);
      }
    } else {
      // Refresh failed; clear tokens
      accessToken = undefined;
      request.cookies.delete(AUTH_COOKIE_NAME);
      request.cookies.delete(AUTH_REFRESH_COOKIE_NAME);
    }
  }

  const hasAccessCookie = Boolean(accessToken);
  const hasRefreshCookie = Boolean(refreshToken);
  const hasSessionCookie = hasAccessCookie || hasRefreshCookie;

  // Prefer role from server-set profile cookie when available
  let role: string | null = null;
  if (profileCookie) {
    try {
      const parsed = JSON.parse(profileCookie) as { role?: string };
      role = normalizeRole(parsed?.role ?? null);
    } catch {
      role = normalizeRole(extractRoleFromAccessToken(accessToken));
    }
  } else {
    role = normalizeRole(extractRoleFromAccessToken(accessToken));
  }
  const effectiveRole = role ?? (hasSessionCookie ? "user" : null);
  const matchedProtectedRoute = findProtectedRoute(pathname);
  // console.log(
  //   `proxy: pathname=${pathname}, search=${search}, hasSessionCookie=${hasSessionCookie}, effectiveRole=${effectiveRole}, matchedProtectedRoute=${matchedProtectedRoute?.prefix}`)

  let response = NextResponse.next();

  if (matchedProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
    response = NextResponse.redirect(loginUrl);
  } else if (
    matchedProtectedRoute &&
    hasSessionCookie &&
    (!effectiveRole || !matchedProtectedRoute.allowedRoles.has(effectiveRole))
  ) {
    response = NextResponse.redirect(new URL(getDefaultRouteForRole(effectiveRole), request.url));
  } else if (AUTH_ROUTES.has(pathname) && hasSessionCookie) {
    response = NextResponse.redirect(new URL(getDefaultRouteForRole(effectiveRole), request.url));
  }

  // Attach any refreshed cookies to the response
  for (const cookie of responseCookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}

export const config = {
  matcher: [
    "/onboarding",
    "/dashboard/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/budget/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/market/:path*",
    "/shop/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/reviews/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/analytics/:path*",
    "/live-prices/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};