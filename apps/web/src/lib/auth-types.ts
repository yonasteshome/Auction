export type AuthFieldErrors = Record<string, string[]>;

export class AuthApiError extends Error {
  status: number;
  fieldErrors: AuthFieldErrors;

  constructor(message: string, status: number, fieldErrors: AuthFieldErrors = {}) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function getAuthErrorStatus(error: unknown): number | undefined {
  if (error instanceof AuthApiError) {
    return error.status;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  return undefined;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  role?: "user" | "vendor";
  phone?: string;
  city?: string;
  household_size?: number;
  income_bracket?: string;
};

export type TokenPair = {
  access: string;
  refresh: string;
};

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  is_active?: boolean;
  city?: string;
  household_size?: number;
  income_bracket?: string;
  onboarding_completed?: boolean;
  created_at: string;
  vendor_info: {
    vendor_id: string;
    shop_name: string;
    city: string;
    address: string;
    contact_phone: string;
    is_verified: boolean;
    rating_avg: string;
    rating_count: number;
    latitude: string;
    longitude: string;
    image: null;
  };
}
