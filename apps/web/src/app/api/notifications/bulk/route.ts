import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api";

type BulkNotificationPayload = {
  action: "mark_read" | "archive" | "delete";
  ids: number[];
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as BulkNotificationPayload;

  try {
    const data = await apiClient<{ status: string }>({
      method: "POST",
      endpoint: "/api/users/me/notifications/bulk/",
      body,
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
