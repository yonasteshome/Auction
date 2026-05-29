import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient, ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import type { UserProfile } from "@/services/userService";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    
    const body = await apiClient<UserProfile>({ method: "GET", endpoint: "/api/users/me/" });
    return NextResponse.json({ ...body, accessToken: token });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.payload ?? { message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
