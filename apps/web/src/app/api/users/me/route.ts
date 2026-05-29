import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import type { UserProfile } from "@/services/userService";

export async function PATCH(req: Request) {
  try {
    const payload = await req.json();

    const body = await apiClient<UserProfile>({ method: "PATCH", endpoint: "/api/users/me/", body: payload });

    return NextResponse.json(body);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.payload ?? { message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
