/*
  Deprecated client-side cookie helpers.

  This project has moved to server-set HttpOnly cookies for authentication tokens.
  Client-side code must NOT write or rely on document.cookie for access/refresh tokens.

  Use the Next API routes under `app/api/auth/`:
    - POST `/api/auth/login`  -> server sets HttpOnly cookies
    - POST `/api/auth/refresh`
    - GET  `/api/auth/me`
    - POST `/api/auth/logout`

  These stubs intentionally avoid writing cookies and will warn if used for reads
  and throw for writes so accidental client-side writes are prevented.
*/

export function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  // HttpOnly cookies are not readable from JS. Return null and let callers use server routes.
  console.warn("getAccessTokenFromCookie(): tokens are now HttpOnly; call /api/auth/me instead.");
  return null;
}

export function setAccessTokenCookie(_token: string): void {
  throw new Error(
    "setAccessTokenCookie() is deprecated. Use POST /api/auth/login which sets HttpOnly cookies on the server."
  );
}

export function clearAccessTokenCookie(): void {
  throw new Error(
    "clearAccessTokenCookie() is deprecated. Use POST /api/auth/logout which clears HttpOnly cookies on the server."
  );
}

export function getRefreshTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  console.warn("getRefreshTokenFromCookie(): tokens are now HttpOnly; call /api/auth/refresh instead.");
  return null;
}

export function setRefreshTokenCookie(_token: string): void {
  throw new Error(
    "setRefreshTokenCookie() is deprecated. Use POST /api/auth/login which sets HttpOnly cookies on the server."
  );
}

export function clearRefreshTokenCookie(): void {
  throw new Error(
    "clearRefreshTokenCookie() is deprecated. Use POST /api/auth/logout which clears HttpOnly cookies on the server."
  );
}

export function setTokenPairCookies(_tokenPair: { access: string; refresh: string }): void {
  throw new Error(
    "setTokenPairCookies() is deprecated. Use POST /api/auth/login which sets HttpOnly cookies on the server."
  );
}

export function clearAuthCookies(): void {
  throw new Error(
    "clearAuthCookies() is deprecated. Use POST /api/auth/logout which clears HttpOnly cookies on the server."
  );
}
