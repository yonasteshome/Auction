"use server";

import { apiClient, ApiError } from "@/lib/api";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function forgotPassword(email: string): Promise<ActionResult<void>> {
  try {
    await apiClient<void>({
      method: "POST",
      endpoint: "/api/users/password/reset/request/",
      body: { email },
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function confirmResetPassword(
  uid: string,
  token: string,
  newPassword: string
): Promise<ActionResult<void>> {
  try {
    await apiClient<void>({
      method: "POST",
      endpoint: "/api/users/password/reset/confirm/",
      body: { uid, token, new_password: newPassword },
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ActionResult<void>> {
  try {
    await apiClient<void>({
      method: "POST",
      endpoint: "/api/users/password/change/",
      body: { old_password: oldPassword, new_password: newPassword },
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}
