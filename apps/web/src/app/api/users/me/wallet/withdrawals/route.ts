import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:8000';

function getApiBaseUrls() {
  const bases = [API_BASE_URL];
  if (API_BASE_URL.includes('127.0.0.1')) {
    bases.push(API_BASE_URL.replace('127.0.0.1', 'localhost'));
  }
  if (API_BASE_URL.includes('localhost')) {
    bases.push(API_BASE_URL.replace('localhost', '127.0.0.1'));
  }
  return [...new Set(bases)];
}

function getIncomingBearerToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.trim()) {
    return authHeader.trim();
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const cookieParts = cookieHeader.split(';').map((part) => part.trim());
  const accessCookie = cookieParts.find((part) => part.startsWith('MarketSight_access_token='));
  if (!accessCookie) {
    return null;
  }

  const tokenValue = accessCookie.split('=', 2)[1]?.trim();
  if (!tokenValue) {
    return null;
  }

  return tokenValue.startsWith('Bearer ') ? tokenValue : `Bearer ${tokenValue}`;
}

async function forwardToBackend(req: Request, method: 'GET' | 'POST', path: string, body?: unknown) {
  const authHeader = getIncomingBearerToken(req);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const baseUrls = getApiBaseUrls();
  let lastResponse: Response | null = null;

  for (const baseUrl of baseUrls) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    lastResponse = response;
    if (response.ok || response.status !== 401) {
      return response;
    }
  }

  return lastResponse;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await forwardToBackend(req, 'POST', '/api/users/me/wallet/withdrawals/', body);
    if (!response) {
      return new NextResponse(JSON.stringify({ detail: 'Proxy error' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    const payload = await response.text();
    return new NextResponse(payload, { status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
  } catch (err: unknown) {
    // Provide more verbose debug information in development to aid troubleshooting
    console.error('Proxy POST /api/users/me/wallet/withdrawals/ error:', err);
    const message = (err instanceof Error && err.message) ? err.message : 'Proxy error';
    const stack = (err instanceof Error && (process.env.NODE_ENV === 'development')) ? err.stack : undefined;
    return new NextResponse(JSON.stringify({ detail: message, stack }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const response = await forwardToBackend(req, 'GET', `/api/users/me/wallet/withdrawals/${url.search}`.replace(/\?$/, ''));
    if (!response) {
      return new NextResponse(JSON.stringify({ detail: 'Proxy error' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    const payload = await response.text();
    return new NextResponse(payload, { status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
  } catch (err: unknown) {
    console.error('Proxy GET /api/users/me/wallet/withdrawals/ error:', err);
    const message = (err instanceof Error && err.message) ? err.message : 'Proxy error';
    return new NextResponse(JSON.stringify({ detail: message }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

