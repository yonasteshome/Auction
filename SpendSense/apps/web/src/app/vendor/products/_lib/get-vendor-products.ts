import { apiClient } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types/pagination";
import {
  marketCategorySchema,
  paginatedSchema,
  vendorPriceSchema,
} from "@/lib/validation/vendor";
import { type VendorPriceResponse } from "@/types/api/vendor";
import { z } from "zod";

const userProfileSchema = z
  .object({
    vendor_info: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        vendor_id: z.union([z.string(), z.number()]).optional(),
      })
      .optional(),
    vendor_id: z.union([z.string(), z.number()]).optional(),
    vendor: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        vendor_id: z.union([z.string(), z.number()]).optional(),
      })
      .optional(),
  })
  .passthrough();

const vendorPriceWithStockSchema = vendorPriceSchema
  .extend({
    quantity: z.number().optional(),
  })
  .passthrough();

const paginationMetadataSchema = z.object({
  total_records: z.number().nonnegative(),
  total_pages: z.number().int().positive(),
  page_size: z.number().int().positive(),
  current_page: z.number().int().positive(),
});

const legacyPaginatedListingsSchema = z.object({
  results: z.array(vendorPriceWithStockSchema),
  pagination: paginationMetadataSchema.optional(),
});

export type VendorProductWithStock = VendorPriceResponse & {
  quantity?: number;
};

export type VendorProductsFilters = {
  page: number;
  q: string;
  category: string;
  sort: string;
};

export type VendorProductsResult = {
  vendorId: string;
  products: VendorProductWithStock[];
  pagination: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
  };
};

export async function getVendorProductCategories(): Promise<string[]> {
  const categoriesRaw = await apiClient<unknown>({
    method: "GET",
    endpoint: "/api/market/categories/",
  });

  const parsed = z.array(marketCategorySchema).safeParse(categoriesRaw);
  if (!parsed.success) {
    return [];
  }

  return Array.from(
    new Set(
      parsed.data
          .map((item) => item.name.trim())
          .filter((name) => name.length > 0),
    ),
  );
}

function normalizeVendorId(profile: z.infer<typeof userProfileSchema>): string {
  const candidate =
    profile.vendor_info?.id ??
    profile.vendor_info?.vendor_id ??
    profile.vendor_id ??
    profile.vendor?.id ??
    profile.vendor?.vendor_id;
  return candidate ? String(candidate) : "";
}

function mapSortToOrdering(sort: string): string {
  switch (sort) {
    case "price_asc":
      return "price";
    case "price_desc":
      return "-price";
    case "oldest":
      return "date";
    case "recently_added":
    default:
      return "-date";
  }
}

export async function getVendorProducts(
  filters: VendorProductsFilters,
): Promise<VendorProductsResult> {
  const profileRaw = await apiClient<unknown>({
    method: "GET",
    endpoint: "/api/users/me/",
  });
  const profile = userProfileSchema.parse(profileRaw);
  const vendorId = normalizeVendorId(profile);

  if (!vendorId) {
    return {
      vendorId: "",
      products: [],
      pagination: {
        total_records: 0,
        total_pages: 1,
        page_size: 10,
        current_page: 1,
      },
    };
  }

  const query: Record<string, string | number | boolean | null | undefined> = {
    page: filters.page,
    ordering: mapSortToOrdering(filters.sort),
    q: filters.q || undefined,
    search: filters.q || undefined,
    category: filters.category !== "all" ? filters.category : undefined,
  };

  const dataRaw = await apiClient<any>({
    method: "GET",
    endpoint: `/api/ecommerce/vendors/${vendorId}/listings/`,
    query,
  });

  const results = dataRaw?.results || [];
  let pagination = dataRaw?.pagination;

  if (!pagination) {
    const count = dataRaw?.count ?? results.length;
    const pageSize = 10;
    pagination = {
      total_records: count,
      total_pages: Math.max(1, Math.ceil(count / pageSize)),
      page_size: pageSize,
      current_page: filters.page,
    };
  }

  return {
    vendorId,
    products: results,
    pagination,
  };
}
