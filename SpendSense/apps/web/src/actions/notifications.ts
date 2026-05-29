"use server";

import { apiClient } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(formData: FormData) {
  const id = formData.get("id");
  if (!id) return;


  try {
    await apiClient({
      method: "PATCH",
      endpoint: `/api/users/me/notifications/${String(id)}/`,
      body: { is_read: true },
    });
    // revalidate dashboard path so server component shows updated notifications
    revalidatePath("/dashboard");
  } catch (err) {
    // swallow — best effort
    console.error("markNotificationRead failed", err);
  }
}
