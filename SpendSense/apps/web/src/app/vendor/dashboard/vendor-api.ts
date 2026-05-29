export interface VendorRegistrationPayload {
  shop_name: string;
  city: string;
  address: string;
  contact_phone: string;
  latitude?: number;
  longitude?: number;
}

export interface VendorProfile {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  household_size?: number;
  income_bracket?: string;
}

export interface VendorProduct {
  id: string;
  title: string;
  category?: string;
  unit?: string;
  price: number;
  availability?: boolean;
  updated_at?: string;
}

export interface MarketItem {
  id: number;
  name: string;
  category: string;
  unit: string;
}

export interface VendorOrder {
  id: string;
  listing_id?: string;
  vendor_id?: string;
  amount?: number;
  quantity?: number;
  currency?: string;
  status?: string;
  payment_status?: string;
  delivery_status?: string;
  created_at?: string;
}

export class VendorApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = "VendorApiError";
    this.status = status;
    this.payload = payload;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const cookieToken = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("spendsense_access_token="))
    ?.split("=")
    .slice(1)
    .join("=");

  return (
    cookieToken ||
    window.localStorage.getItem("spendsense_access_token") ||
    window.localStorage.getItem("access") ||
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("accessToken") ||
    null
  );
}

export function getStoredVendorId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("spendsense_vendor_id") || "";
}

export function setStoredVendorId(vendorId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("spendsense_vendor_id", vendorId);
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = await response.text();
    }

    const message = extractApiErrorMessage(payload, response.status);

    throw new VendorApiError(message, response.status, payload);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function extractApiErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload) {
    const data = payload as Record<string, unknown>;

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const value = data[firstKey];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return String(value[0]);
      }
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return `Request failed with ${status}`;
}

function normalizeProduct(item: Record<string, unknown>): VendorProduct {
  return {
    id: String(item.id ?? item.listing_id ?? ""),
    title: String(item.title ?? item.item_name ?? item.name ?? "Untitled product"),
    category: item.category ? String(item.category) : undefined,
    unit: item.unit ? String(item.unit) : undefined,
    price: Number(item.price ?? item.price_value ?? 0),
    availability:
      typeof item.availability === "boolean"
        ? item.availability
        : typeof item.is_available === "boolean"
          ? item.is_available
          : undefined,
    updated_at: item.updated_at ? String(item.updated_at) : undefined,
  };
}

function normalizeOrder(item: Record<string, unknown>): VendorOrder {
  return {
    id: String(item.id ?? item.purchase_id ?? ""),
    listing_id: item.listing_id ? String(item.listing_id) : undefined,
    vendor_id: item.vendor_id ? String(item.vendor_id) : undefined,
    amount: item.amount !== undefined ? Number(item.amount) : undefined,
    quantity: item.quantity !== undefined ? Number(item.quantity) : undefined,
    currency: item.currency ? String(item.currency) : "ETB",
    status: item.status ? String(item.status) : undefined,
    payment_status: item.payment_status ? String(item.payment_status) : undefined,
    delivery_status: item.delivery_status ? String(item.delivery_status) : undefined,
    created_at: item.created_at ? String(item.created_at) : undefined,
  };
}

export async function registerVendor(payload: VendorRegistrationPayload): Promise<Record<string, unknown>> {
  return requestJson<Record<string, unknown>>("/api/ecommerce/vendors/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUserProfile(): Promise<VendorProfile> {
  const profile = await requestJson<Record<string, unknown>>("/api/users/me/", {
    method: "GET",
  });

  return profile
}

export async function updateCurrentUserProfile(
  payload: Partial<Pick<VendorProfile, "full_name" | "phone" | "city" | "income_bracket" | "household_size">>,
): Promise<VendorProfile> {
  const profile = await requestJson<Record<string, unknown>>("/api/users/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return {
    id: profile.id ? String(profile.id) : undefined,
    full_name: profile.full_name ? String(profile.full_name) : undefined,
    email: profile.email ? String(profile.email) : undefined,
    phone: profile.phone ? String(profile.phone) : undefined,
    city: profile.city ? String(profile.city) : undefined,
    role: profile.role ? String(profile.role) : undefined,
    household_size: profile.household_size ? Number(profile.household_size) : undefined,
    income_bracket: profile.income_bracket ? String(profile.income_bracket) : undefined,
  };
}

export async function getVendorProducts(vendorId: string): Promise<VendorProduct[]> {
  const data = await requestJson<unknown>(`/api/ecommerce/vendors/${vendorId}/listings/`, {
    method: "GET",
  });

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => normalizeProduct((item as Record<string, unknown>) || {}));
}

export async function getMarketItems(): Promise<MarketItem[]> {
  const data = await requestJson<unknown>("/api/market/items/", {
    method: "GET",
  });

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      const source = (item as Record<string, unknown>) || {};
      return {
        id: Number(source.id),
        name: String(source.name ?? ""),
        category: String(source.category ?? ""),
        unit: String(source.unit ?? ""),
      };
    })
    .filter((item) => Number.isFinite(item.id) && item.id > 0);
}

export async function createVendorProduct(
  vendorId: string,
  payload:
    | { item: number; price: number }
    | { item_name: string; category: string; unit: string; price_value: number; availability: boolean },
): Promise<Record<string, unknown>> {
  const body =
    "item" in payload
      ? { item: payload.item, price: payload.price }
      : {
          item_name: payload.item_name,
          category: payload.category,
          unit: payload.unit,
          price_value: payload.price_value,
          availability: payload.availability,
        };

  return requestJson<Record<string, unknown>>(`/api/ecommerce/vendors/${vendorId}/listings/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateVendorProduct(
  listingId: string,
  payload: Partial<{
    item: number;
    price: number;
    item_name: string;
    category: string;
    unit: string;
    price_value: number;
    availability: boolean;
  }>,
): Promise<Record<string, unknown>> {
  const normalized: Record<string, unknown> = {};

  if (typeof payload.item === "number") {
    normalized.item = payload.item;
  }

  if (typeof payload.price === "number") {
    normalized.price = payload.price;
  } else if (typeof payload.price_value === "number") {
    normalized.price = payload.price_value;
  }

  const body = Object.keys(normalized).length > 0 ? normalized : payload;

  return requestJson<Record<string, unknown>>(`/api/ecommerce/listings/${listingId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getVendorOrders(): Promise<VendorOrder[]> {
  const data = await requestJson<unknown>("/api/ecommerce/purchases/", {
    method: "GET",
  });

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => normalizeOrder((item as Record<string, unknown>) || {}));
}

export async function getVendorOrderDetail(orderId: string): Promise<VendorOrder> {
  const data = await requestJson<Record<string, unknown>>(`/api/ecommerce/purchases/${orderId}/`, {
    method: "GET",
  });

  return normalizeOrder(data);
}

export async function getVendorRecommendations(query: {
  item_id?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  limit?: number;
}): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams();

  if (query.item_id) params.set("item_id", query.item_id);
  if (query.city) params.set("city", query.city);
  if (query.latitude !== undefined) params.set("latitude", String(query.latitude));
  if (query.longitude !== undefined) params.set("longitude", String(query.longitude));
  if (query.limit !== undefined) params.set("limit", String(query.limit));

  const path = `/api/ecommerce/recommendations/${params.toString() ? `?${params.toString()}` : ""}`;
  const data = await requestJson<unknown>(path, { method: "GET" });

  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}

export function formatMoney(amount: number | undefined, currency = "ETB"): string {
  const value = Number.isFinite(amount) ? Number(amount) : 0;
  return `${currency} ${value.toLocaleString()}`;
}
