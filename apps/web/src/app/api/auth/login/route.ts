import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME, AUTH_REFRESH_COOKIE_NAME, AUTH_PROFILE_COOKIE_NAME } from "@/lib/auth-constants";
import type { UserProfile } from "@/lib/auth-types";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const body = await apiClient<{ access: string; refresh: string }>(
      {
        method: "POST",
        endpoint: "/api/auth/token/",
        body: payload,
      }
    );

    const tokens = body as { access: string; refresh: string };
    const secure = process.env.NODE_ENV === "production";

    const res = NextResponse.json({ ok: true, accessToken: tokens.access });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: tokens.access,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    res.cookies.set({
      name: AUTH_REFRESH_COOKIE_NAME,
      value: tokens.refresh,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Fetch the current user profile using the freshly obtained access token
    try {
      const profile = await apiClient<UserProfile>({
        method: "GET",
        endpoint: "/api/users/me/",
        fetchOptions: { headers: { Authorization: `Bearer ${tokens.access}` } },
      });

      // Store minimal profile info in a server-set cookie for middleware role checks
      try {
        const profileValue = JSON.stringify({ id: profile.id, role: profile.role, email: profile.email });
        res.cookies.set({
          name: AUTH_PROFILE_COOKIE_NAME,
          value: profileValue,
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      } catch (e) {
        console.log("login: failed to set profile cookie", e);
      }
    } catch (e) {
      console.log("login: failed to fetch user profile", e);
    }

    return res;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.payload ?? { message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
