import React, { Suspense } from "react";
import { apiClient, ApiError } from "@/lib/api";
import type { VendorPriceListResponse, VendorPriceListing } from "@/types/api/product-listing";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { Card, CardContent } from "@repo/ui/components/card";
import { ProductPaginationControls } from "@/components/products/product-pagination-controls";
import { Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | MarketSight Ethiopia",
  description:
    "Browse aggregated product listings with real-time prices from verified vendors across Ethiopia.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getProducts(params: URLSearchParams): Promise<{
  listings: VendorPriceListing[];
  total: number;
  page: number;
}> {
  const page = Number(params.get("page") ?? 1);
  try {
    const query: Record<string, string | number | boolean> = {};
    const q = params.get("q");
    const category = params.get("category");
    const city = params.get("city");
    const minPrice = params.get("minPrice");
    const maxPrice = params.get("maxPrice");
    const verified = params.get("verified");

    if (q) query.search = q;
    if (category && category !== "all") query.category = category;
    if (city && city !== "all") query.city = city;
    if (minPrice) query.min_price = minPrice;
    if (maxPrice) query.max_price = maxPrice;
    if (verified === "true") query.is_verified = true;
    query.page = page;
    query.page_size = Number(params.get("pageSize") ?? 12);

    const res = await apiClient<VendorPriceListResponse>({
      method: "GET",
      endpoint: "/api/market/vendors/prices",
      query,
      next: { tags: ["vendor-prices"], revalidate: 60 },
    });

    const listings = res?.results ?? [];
    const total = res?.count ?? listings.length;
    return { listings, total, page };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { listings: [], total: 0, page };
    }
    console.error("[products/page] Failed to load listings:", err);
    return { listings: [], total: 0, page };
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams();

  if (sp?.q) params.set("q", String(sp.q));
  if (sp?.category) params.set("category", String(sp.category));
  if (sp?.city) params.set("city", String(sp.city));
  if (sp?.minPrice) params.set("minPrice", String(sp.minPrice));
  if (sp?.maxPrice) params.set("maxPrice", String(sp.maxPrice));
  if (sp?.verified) params.set("verified", String(sp.verified));
  params.set("page", String(sp?.page ?? "1"));
  params.set("pageSize", String(sp?.pageSize ?? "12"));

  const { listings, total, page } = await getProducts(params);
  const pageSize = Number(params.get("pageSize") ?? 12);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filterParams = Object.fromEntries(params.entries());

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-1">
          Browse real-time prices across verified vendors · {total} listing{total !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Top Filters */}
      <div className="mb-8">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <ProductFilters params={filterParams} />
          </CardContent>
        </Card>
      </div>

      {/* Product Grid */}
      <section className="space-y-6">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 border border-dashed rounded-2xl bg-card text-center">
              <div className="p-5 bg-muted rounded-full">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">No products found</p>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                  Try adjusting your search or filters to discover more listings.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(
                listings.reduce<Record<string, VendorPriceListing[]>>((acc, l) => {
                  const cat = l.category || "Uncategorized";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(l);
                  return acc;
                }, {})
              ).map(([catName, catListings]) => (
                <div key={catName} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                      {catName}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {catListings.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catListings.map((l) => (
                      <ProductCard key={String(l.id)} listing={l} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <ProductPaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                params={filterParams}
              />
            </div>
          )}
        </section>
    </div>
  );
}

