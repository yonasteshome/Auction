"use server"
import { ApiError, apiClient } from "@/lib/api";
import {
  AuthApiError,
  type AuthFieldErrors,
  type LoginPayload,
  type RegisterPayload,
  type TokenPair,
  type UserProfile,
} from "@/lib/auth-types";

function toAuthApiError(error: unknown): AuthApiError {
  if (error instanceof AuthApiError) {
    return error;
  }

  if (error instanceof ApiError) {
    const payload = error.payload;
    const fieldErrors =
      payload && typeof payload === "object"
        ? (payload as AuthFieldErrors)
        : {};

    const fallbackMessage =
      error.status >= 500
        ? "A server error occurred. Please try again."
        : error.message || "Request failed. Please check your input and try again.";

    return new AuthApiError(fallbackMessage, error.status, fieldErrors);
  }

  return new AuthApiError(
    "Unexpected network error. Please try again.",
    0,
    {},
  );
}

export async function login(payload: LoginPayload): Promise<TokenPair> {
  try {
    return await apiClient<TokenPair>({
      method: "POST",
      endpoint: "/api/auth/token/",
      body: payload,
    });
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export async function register(payload: RegisterPayload): Promise<UserProfile> {
  try {
    return await apiClient<UserProfile>({
      method: "POST",
      endpoint: "/api/users/register/",
      body: payload,
    });
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export async function getCurrentUser(accessToken: string): Promise<UserProfile> {
  try {
    return await apiClient<UserProfile>({
      method: "GET",
      endpoint: "/api/users/me/",
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access: string }> {
  try {
    return await apiClient<{ access: string }>({
      method: "POST",
      endpoint: "/api/auth/token/refresh/",
      body: { refresh: refreshToken },
    });
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export async function forgotPassword(email: string): Promise<{ detail?: string }> {
  try {
    return await apiClient<{ detail?: string }>({
      method: "POST",
      endpoint: "/api/users/password/reset/request/",
      body: { email },
    });
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export async function resetPassword(payload: {
  uid: string;
  token: string;
  new_password: string;
}): Promise<{ detail?: string }> {
  try {
    return await apiClient<{ detail?: string }>({
      method: "POST",
      endpoint: "/api/users/password/reset/confirm/",
      body: payload,
    });
  } catch (error) {
    throw toAuthApiError(error);
  }
}
