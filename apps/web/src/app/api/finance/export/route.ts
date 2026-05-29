import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

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

function getIncomingBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.trim()) {
    return authHeader.trim();
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieParts = cookieHeader.split(";").map((part) => part.trim());
  const accessCookie = cookieParts.find((part) => part.startsWith("spendsense_access_token="));
  if (!accessCookie) {
    return null;
  }

  const tokenValue = accessCookie.split("=", 2)[1]?.trim();
  if (!tokenValue) {
    return null;
  }

  return tokenValue.startsWith("Bearer ") ? tokenValue : `Bearer ${tokenValue}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.search || "";

    const authHeader = getIncomingBearerToken(req);
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const baseUrls = getApiBaseUrls();
    let response: Response | null = null;

    for (const baseUrl of baseUrls) {
      const attempt = await fetch(`${baseUrl}/api/finance/export/${query}`.replace(/\?$/, ""), {
        method: "GET",
        headers,
        credentials: "include",
      });
      response = attempt;
      if (attempt.ok || attempt.status !== 401) {
        break;
      }
    }

    if (!response) {
      return NextResponse.json({ detail: "Proxy error" }, { status: 500 });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";
    const data = await response.arrayBuffer();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": contentType,
        "content-disposition": contentDisposition,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
