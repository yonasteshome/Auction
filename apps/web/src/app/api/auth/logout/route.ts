import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    // Optionally notify backend about logout
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      await fetch(`${API_BASE}/api/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieHeader },
        body: await req.text(),
      });
    } catch (e) {
      // best-effort
    }

    const res = NextResponse.json({ ok: true });

    // Clear cookies
    res.cookies.set({ name: "MarketSight_access_token", value: "", path: "/", maxAge: 0 });
    res.cookies.set({ name: "MarketSight_refresh_token", value: "", path: "/", maxAge: 0 });

    return res;
  } catch (err) {
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}

