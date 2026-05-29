import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import type { InAppNotification } from "@/services/userService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    is_read?: boolean;
    is_archived?: boolean;
  };

  try {
    const data = await apiClient<InAppNotification>({
      method: "PATCH",
      endpoint: `/api/users/me/notifications/${id}/`,
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
