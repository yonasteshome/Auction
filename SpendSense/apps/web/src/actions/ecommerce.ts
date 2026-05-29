"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, apiClient } from "@/lib/api";
import {
  normalizeCollection,
  normalizeCart,
  type Cart,
  type Purchase,
  type PaginatedResponse,
  type PurchaseKpiSummary,
  type Recommendation,
  type Review,
  type Vendor,
  type VendorListing,
  type Product,
  type Category,
  type StaticMetaResponse,
} from "@/lib/ecommerce-types";
import {
  addToCartSchema,
  checkoutSchema,
  bulkCheckoutSchema,
  purchaseStatusUpdateSchema,
  recommendationQuerySchema,
  reviewCreateSchema,
  vendorListingCreateSchema,
  vendorRegisterSchema,
  type AddToCartSchema,
  type CheckoutSchema,
  type BulkCheckoutSchema,
  type PaymentSchema,
  type PurchaseStatusUpdateSchema,
  type RecommendationQuerySchema,
  type ReviewCreateSchema,
  type VendorListingCreateSchema,
  type VendorRegisterSchema,
} from "@/lib/validation/ecommerce-schemas";

const CACHE_TAGS = {
  recommendations: "ecommerce:recommendations",
  vendors: "ecommerce:vendors",
  listings: "ecommerce:listings",
  reviews: "ecommerce:reviews",
  purchases: "ecommerce:purchases",
  cart: "ecommerce:cart",
} as const;

const CART_COOKIE_KEY = "spendsense_cart_v1";

class EcommerceApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = "EcommerceApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getApiPayloadMessage(payload: unknown): string | null {
  if (typeof payload === "string") {
    const chapaPrefix = "Chapa initialization failed: ";
    if (payload.startsWith(chapaPrefix)) {
      const rawGatewayPayload = payload.slice(chapaPrefix.length);
      try {
        const parsedGatewayPayload = JSON.parse(rawGatewayPayload) as unknown;
        return getApiPayloadMessage(parsedGatewayPayload) || payload;
      } catch {
        return payload;
      }
    }

    return payload;
  }

  if (Array.isArray(payload)) {
    const messages = payload
      .map(getApiPayloadMessage)
      .filter((message): message is string => Boolean(message));
    return messages.length ? messages.join(" ") : null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const errorObject = payload as Record<string, unknown>;
  const directMessage =
    errorObject.detail ||
    errorObject.message ||
    errorObject.error ||
    errorObject.payment;

  if (typeof directMessage === "string") {
    return directMessage;
  }

  const messages = Object.values(errorObject)
    .map(getApiPayloadMessage)
    .filter((message): message is string => Boolean(message));

  return messages.length ? messages.join(" ") : null;
}

function toEcommerceApiError(error: unknown): EcommerceApiError {
  if (error instanceof EcommerceApiError) {
    return error;
  }

  if (error instanceof ApiError) {
    const payloadMessage = getApiPayloadMessage(error.payload);
    const fallbackMessage =
      error.status >= 500
        ? "A server error occurred. Please try again."
        : payloadMessage ||
          error.message ||
          "Request failed. Please verify your input and retry.";

    return new EcommerceApiError(fallbackMessage, error.status, error.payload);
  }

  return new EcommerceApiError(
    "Unexpected network error. Please try again.",
    0,
    null,
  );
}

async function readCartFromCookie(): Promise<Cart> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE_KEY)?.value;

  if (!raw) {
    return normalizeCart(null);
  }

  try {
    return normalizeCart(JSON.parse(raw));
  } catch {
    return normalizeCart(null);
  }
}

async function writeCartToCookie(cart: Cart): Promise<void> {
  const jar = await cookies();
  jar.set(CART_COOKIE_KEY, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getRecommendations(
  input: RecommendationQuerySchema,
): Promise<Recommendation[]> {
  const query = recommendationQuerySchema.parse(input);

  try {
    return await apiClient<Recommendation[]>({
      method: "GET",
      endpoint: "/api/ecommerce/recommendations/",
      query,
      cache: "force-cache",
      next: {
        revalidate: 120,
        tags: [
          CACHE_TAGS.recommendations,
          `${CACHE_TAGS.recommendations}:${query.item_id}`,
        ],
      },
    });
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function getProducts(
  input: RecommendationQuerySchema,
): Promise<Recommendation[]> {
  return getRecommendations(input);
}

export async function getProductById(id: string): Promise<Recommendation> {
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new EcommerceApiError("Product ID must be a positive integer.", 400);
  }

  const recommendations = await getRecommendations({
    item_id: itemId,
    limit: 1,
  });
  if (!recommendations.length) {
    throw new EcommerceApiError("Product not found.", 404);
  }

  return recommendations[0];
}

export async function getVendors(): Promise<Vendor[]> {
  try {
    const response = await apiClient<Vendor[]>({
      method: "GET",
      endpoint: "/api/market/vendors/",
      cache: "force-cache",
      next: {
        revalidate: 300,
        tags: [CACHE_TAGS.vendors],
      },
    });

    return normalizeCollection(response);
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function getStaticMeta(): Promise<StaticMetaResponse> {
  try {
    const response = await apiClient<StaticMetaResponse>({
      method: "GET",
      endpoint: "/api/finance/expenses/",
      query: { include_products: 1 },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    const products = Array.isArray(response.products) ? response.products : [];
    const categories = Array.isArray(response.categories)
      ? response.categories
      : [];

    return { products, categories };
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function getVendorById(id: string): Promise<Vendor> {
  try {
    return await apiClient<Vendor>({
      method: "GET",
      endpoint: `/api/ecommerce/vendors/${id}/`,
      cache: "force-cache",
      next: {
        revalidate: 300,
        tags: [CACHE_TAGS.vendors, `${CACHE_TAGS.vendors}:${id}`],
      },
    });
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function registerVendor(
  input: VendorRegisterSchema,
): Promise<Vendor> {
  const payload = vendorRegisterSchema.parse(input);

  try {
    const response = await apiClient<Vendor>({
      method: "POST",
      endpoint: "/api/ecommerce/vendors/",
      body: payload,
      cache: "no-store",
    });

    revalidateTag(CACHE_TAGS.vendors, "max");
    revalidatePath("/shop/vendors");

    return response;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function getVendorListings(
  vendorId: string,
): Promise<VendorListing[]> {
  try {
    const response = await apiClient<VendorListing[]>({
      method: "GET",
      endpoint: `/api/ecommerce/vendors/${vendorId}/listings/`,
      cache: "force-cache",
      next: {
        revalidate: 120,
        tags: [CACHE_TAGS.listings, `${CACHE_TAGS.listings}:${vendorId}`],
      },
    });

    return normalizeCollection(response);
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function createVendorListing(
  input: VendorListingCreateSchema,
): Promise<VendorListing> {
  const payload = vendorListingCreateSchema.parse(input);

  try {
    const response = await apiClient<VendorListing>({
      method: "POST",
      endpoint: `/api/ecommerce/vendors/${payload.vendor_id}/listings/`,
      body: {
        item: payload.item,
        price: payload.price,
        base_price: payload.base_price,
        description: payload.description,
        variant: payload.variant,
        stock_count: payload.stock_count,
      },
      cache: "no-store",
    });

    revalidateTag(CACHE_TAGS.listings, "max");
    revalidateTag(CACHE_TAGS.recommendations, "max");
    revalidatePath(`/shop/vendors/${payload.vendor_id}`);
    revalidatePath("/shop");

    return response;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function getVendorReviews(vendorId: string): Promise<Review[]> {
  try {
    const response = await apiClient<Review[]>({
      method: "GET",
      endpoint: `/api/ecommerce/vendors/${vendorId}/reviews/`,
      cache: "force-cache",
      next: {
        revalidate: 120,
        tags: [CACHE_TAGS.reviews, `${CACHE_TAGS.reviews}:${vendorId}`],
      },
    });

    return normalizeCollection(response);
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function createReview(input: ReviewCreateSchema): Promise<Review> {
  const payload = reviewCreateSchema.parse(input);

  try {
    const response = await apiClient<Review>({
      method: "POST",
      endpoint: `/api/ecommerce/vendors/${payload.vendor_id}/reviews/`,
      body: {
        rating: payload.rating,
        comment: payload.comment || "",
      },
      cache: "no-store",
    });

    revalidateTag(CACHE_TAGS.reviews, "max");
    revalidateTag(CACHE_TAGS.vendors, "max");
    revalidatePath(`/shop/vendors/${payload.vendor_id}`);

    return response;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function getCart(): Promise<Cart> {
  try {
    return await readCartFromCookie();
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function addToCart(input: AddToCartSchema): Promise<Cart> {
  const payload = addToCartSchema.parse(input);

  try {
    const currentCart = await readCartFromCookie();
    const existingItem = currentCart.items.find(
      (item) =>
        item.listing_id === payload.listing_id &&
        item.vendor_id === payload.vendor_id,
    );

    const nextItems = existingItem
      ? currentCart.items.map((item) =>
          item.listing_id === payload.listing_id &&
          item.vendor_id === payload.vendor_id
            ? {
                ...item,
                quantity: Math.min(item.quantity + payload.quantity, 999),
              }
            : item,
        )
      : [
          ...currentCart.items,
          {
            listing_id: payload.listing_id,
            vendor_id: payload.vendor_id,
            vendor_name: payload.vendor_name,
            item_name: payload.item_name,
            unit: payload.unit,
            quantity: payload.quantity,
            unit_price: payload.unit_price,
          },
        ];

    const total = nextItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const nextCart: Cart = {
      items: nextItems,
      total,
      currency: "ETB",
      updated_at: new Date().toISOString(),
    };

    await writeCartToCookie(nextCart);

    revalidateTag(CACHE_TAGS.cart, "max");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return nextCart;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function removeBulkFromCart(listingIdsTarget: number[]): Promise<Cart> {
  try {
    const currentCart = await readCartFromCookie();
    const nextItems = currentCart.items.filter(
      (i) => !listingIdsTarget.includes(i.listing_id),
    );

    const total = nextItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const nextCart: Cart = {
      items: nextItems,
      total,
      currency: "ETB",
      updated_at: new Date().toISOString(),
    };

    await writeCartToCookie(nextCart);

    revalidateTag(CACHE_TAGS.cart, "max");
    revalidatePath("/cart");

    return nextCart;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function checkout(input: CheckoutSchema): Promise<Purchase> {
  const payload = checkoutSchema.parse(input);

  try {
    const response = await apiClient<Purchase>({
      method: "POST",
      endpoint: "/api/ecommerce/purchases/",
      body: payload,
      cache: "no-store",
    });

    revalidateTag(CACHE_TAGS.purchases, "max");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/orders");

    return response;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function bulkCheckout(input: BulkCheckoutSchema): Promise<Purchase[]> {
  const payload = bulkCheckoutSchema.parse(input);

  try {
    // The backend only supports single-item checkout at /api/ecommerce/purchases/.
    // We fan out one POST per selected item and collect the results in parallel.
    const results = await Promise.all(
      payload.items.map((item) =>
        apiClient<Purchase>({
          method: "POST",
          endpoint: "/api/ecommerce/purchases/",
          body: {
            vendor_id: item.vendor_id,
            listing_id: item.listing_id,
            quantity: item.quantity,
            payment_method: payload.payment_method,
          },
          cache: "no-store",
        }),
      ),
    );

    // We don't clear the entire cart here because the user might have unchecked
    // items they didn't pay for. Let the client remove only the purchased items.
    revalidateTag(CACHE_TAGS.purchases, "max");
    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath("/payment-history");

    return results;
  } catch (error) {
    console.log(error)
    // Throw a plain Error so Next.js can serialize it across the Server Action
    // boundary. Custom error subclasses with unknown payloads cause
    // "Error in input stream" on the client.
    throw new Error(toEcommerceApiError(error).message);
  }
}

export async function createPayment(input: PaymentSchema): Promise<Purchase> {
  const { purchase_id } = input;
  return getOrderById(String(purchase_id));
}

export async function getOrders(params?: { search?: string, page?: number, status?: string }): Promise<PaginatedResponse<Purchase>> {
  try {
    const query: Record<string, string | number> = {};
    if (params?.search) query.search = params.search;
    if (params?.page) query.page = params.page;
    if (params?.status && params.status !== "all") query.status = params.status;

    const response = await apiClient<PaginatedResponse<Purchase>>({
      method: "GET",
      endpoint: "/api/ecommerce/purchases/",
      query,
      cache: "force-cache",
      next: {
        revalidate: 60,
        tags: [CACHE_TAGS.purchases],
      },
    });

    return response;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function getPurchaseKpiSummary(): Promise<PurchaseKpiSummary> {
  try {
    const response = await apiClient<PurchaseKpiSummary>({
      method: "GET",
      endpoint: "/api/ecommerce/purchases/kpi-summary/",
      cache: "force-cache",
      next: {
        revalidate: 60,
        tags: [CACHE_TAGS.purchases, 'purchases-kpi'],
      },
    });
    return response;
  } catch (error) {
    // If the backend route isn't available yet return safe defaults so the
    // Orders page can render instead of surfacing the Django 404 HTML.
    try {
      if (error instanceof ApiError && (error as any).status === 404) {
        return {
          total_revenue: 0,
          average_order_value: 0,
          pending_orders: 0,
          top_vendors: [],
        } as PurchaseKpiSummary;
      }
    } catch (_) {
      // fall through to throwing a normalized error
    }

    throw toEcommerceApiError(error);
  }
}

export async function getOrderById(id: string): Promise<Purchase> {
  try {
    return await apiClient<Purchase>({
      method: "GET",
      endpoint: `/api/ecommerce/purchases/${id}/`,
      cache: "force-cache",
      next: {
        revalidate: 60,
        tags: [CACHE_TAGS.purchases, `${CACHE_TAGS.purchases}:${id}`],
      },
    });
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}

export async function updateOrderStatus(
  input: PurchaseStatusUpdateSchema,
): Promise<Purchase> {
  const payload = purchaseStatusUpdateSchema.parse(input);

  try {
    const response = await apiClient<Purchase>({
      method: "PATCH",
      endpoint: `/api/ecommerce/purchases/${payload.purchase_id}/status/`,
      body: {
        status: payload.status,
      },
      cache: "no-store",
    });

    revalidateTag(CACHE_TAGS.purchases, "max");
    revalidatePath("/orders");
    revalidatePath(`/orders/${payload.purchase_id}`);

    return response;
  } catch (error) {
    throw toEcommerceApiError(error);
  }
}
