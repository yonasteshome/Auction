import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import type { NotificationListResponse } from "@/services/userService";

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const data = await apiClient<NotificationListResponse>({
      method: "GET",
      endpoint: "/api/users/me/notifications/",
      query,
      cache: "no-store",
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    throw error;
  }
}
