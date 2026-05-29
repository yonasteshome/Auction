/*
 Lightweight TypeScript client for E-commerce flows.
 Place under: apps/web/src/lib/api/ecommerceClient.ts
 Uses native fetch; pass `baseUrl` and `token` where needed.
*/

export type UUID = string;

export interface Item {
  id: number;
  name: string;
  category: string;
  unit: string;
}

export interface Vendor {
  id: string;
  shop_name: string;
  city: string | null;
  address: string | null;
  contact_phone: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  is_verified: boolean;
  rating_avg: number | string;
  rating_count: number;
  joined_at: string;
}

export interface VendorListing {
  id: number;
  item: number;
  item_name: string;
  unit: string;
  description?: string;
  variant?: string;
  price: number | string;
  base_price?: number | string | null;
  stock_count: number;
  date: string;
  is_verified: boolean;
  vendor?: string;
}

export interface Transaction {
  id: string;
  user?: string;
  vendor: string;
  vendor_price?: number | null;
  quantity: number;
  amount: string | number;
  currency: string;
  status: string;
  reference: string;
}

function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleJsonResponse(res: Response) {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    // ignore parse error
  }
  if (!res.ok) {
    const err = new Error(
      (json && (json.detail || json.error || json.message)) || res.statusText,
    );
    (err as any).status = res.status;
    (err as any).body = json;
    throw err;
  }
  return json;
}

export class EcommerceClient {
  baseUrl: string;

  constructor(baseUrl = "") {
    // baseUrl should be like: http://127.0.0.1:8000
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  // Items
  async getItems(): Promise<Item[]> {
    const res = await fetch(`${this.baseUrl}/api/market/items/`);
    return handleJsonResponse(res);
  }

  async createItem(
    payload: { name: string; category: string; unit: string },
    token: string,
  ) {
    const res = await fetch(`${this.baseUrl}/api/market/admin/items/`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleJsonResponse(res);
  }

  // Vendors
  async registerVendor(payload: unknown, token: string): Promise<Vendor> {
    const res = await fetch(`${this.baseUrl}/api/ecommerce/vendors/`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleJsonResponse(res);
  }

  async getVendorById(vendorId: UUID): Promise<Vendor> {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/vendors/${vendorId}/`,
    );
    return handleJsonResponse(res);
  }

  // Listings
  async getVendorListings(
    vendorId: UUID,
    token?: string,
  ): Promise<VendorListing[]> {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/vendors/${vendorId}/listings/`,
      {
        headers: token ? buildHeaders(token) : undefined,
      } as RequestInit,
    );
    return handleJsonResponse(res);
  }

  async createVendorListing(
    vendorId: UUID,
    payload: {
      item: number;
      price: number;
      stock_count: number;
      description?: string;
      variant?: string;
      base_price?: number | null;
    },
    token: string,
  ) {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/vendors/${vendorId}/listings/`,
      {
        method: "POST",
        headers: buildHeaders(token),
        body: JSON.stringify(payload),
      },
    );
    return handleJsonResponse(res);
  }

  async updateListing(
    listingId: number,
    payload: Partial<{
      price: number;
      base_price: number | null;
      stock_count: number;
      description: string;
      variant: string;
      is_verified: boolean;
    }>,
    token: string,
  ) {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/listings/${listingId}/`,
      {
        method: "PATCH",
        headers: buildHeaders(token),
        body: JSON.stringify(payload),
      },
    );
    return handleJsonResponse(res);
  }

  // Reviews
  async getVendorReviews(vendorId: UUID): Promise<any[]> {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/vendors/${vendorId}/reviews/`,
    );
    return handleJsonResponse(res);
  }

  async createReview(vendorId: UUID, payload: unknown, token: string) {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/vendors/${vendorId}/reviews/`,
      {
        method: "POST",
        headers: buildHeaders(token),
        body: JSON.stringify(payload),
      },
    );
    return handleJsonResponse(res);
  }

  // Orders / Purchases
  async createPurchase(
    payload: {
      vendor_id: UUID;
      listing_id: number;
      quantity?: number;
      delivery_address?: string;
      payment_method?: "chapa" | "telebirr" | "cash";
    },
    token: string,
  ): Promise<Transaction> {
    const res = await fetch(`${this.baseUrl}/api/ecommerce/purchases/`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleJsonResponse(res);
  }

  async getPurchase(orderId: UUID, token: string): Promise<Transaction> {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/purchases/${orderId}/`,
      {
        headers: buildHeaders(token),
      },
    );
    return handleJsonResponse(res);
  }

  async listPurchases(token: string): Promise<Transaction[]> {
    const res = await fetch(`${this.baseUrl}/api/ecommerce/purchases/`, {
      headers: buildHeaders(token),
    });
    return handleJsonResponse(res);
  }

  async updatePurchaseStatus(
    orderId: UUID,
    payload: {
      purchase_id: UUID;
      status: "shipped" | "delivered" | "cancelled";
    },
    token: string,
  ) {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/purchases/${orderId}/status/`,
      {
        method: "PATCH",
        headers: buildHeaders(token),
        body: JSON.stringify(payload),
      },
    );
    return handleJsonResponse(res);
  }

  // Admin vendor moderation
  async getAdminVendors(token: string) {
    const res = await fetch(`${this.baseUrl}/api/ecommerce/admin/vendors/`, {
      headers: buildHeaders(token),
    });
    return handleJsonResponse(res);
  }

  async adminVerifyVendor(vendorId: UUID, token: string) {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/admin/vendors/${vendorId}/verify/`,
      {
        method: "POST",
        headers: buildHeaders(token),
      },
    );
    return handleJsonResponse(res);
  }

  async adminRejectVendor(vendorId: UUID, token: string) {
    const res = await fetch(
      `${this.baseUrl}/api/ecommerce/admin/vendors/${vendorId}/reject/`,
      {
        method: "POST",
        headers: buildHeaders(token),
      },
    );
    return handleJsonResponse(res);
  }
}
