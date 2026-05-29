import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient, ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME, AUTH_REFRESH_COOKIE_NAME } from "@/lib/auth-constants";

export async function POST() {
  try {
    // read refresh token from incoming cookies and forward it in the cookie header
    const cookieStore = await cookies();
    const refresh = cookieStore.get(AUTH_REFRESH_COOKIE_NAME as any)?.value;

    const fetchOptions = refresh
      ? { headers: { cookie: `${AUTH_REFRESH_COOKIE_NAME}=${refresh}` } }
      : undefined;

    const body = await apiClient<{ access: string; refresh?: string }>(
      {
        method: "POST",
        endpoint: "/api/auth/token/refresh/",
        body: { refresh },
        fetchOptions,
      }
    );

    const tokens = body as { access: string; refresh?: string };
    const secure = process.env.NODE_ENV === "production";

    const res = NextResponse.json({ ok: true });

    if (tokens.access) {
      res.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: tokens.access,
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
    }

    if (tokens.refresh) {
      res.cookies.set({
        name: AUTH_REFRESH_COOKIE_NAME,
        value: tokens.refresh,
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.payload ?? { message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Refresh failed" }, { status: 500 });
  }
}
