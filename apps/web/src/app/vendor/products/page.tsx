import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Pencil,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { formatMoney } from "../_lib/vendor-api";
import { DeleteProductButton } from "./_components/delete-product-button";
import { ProductImage } from "./_components/product-image";
import { ProductsControls } from "./_components/products-controls";
import {
  getVendorProductCategories,
  getVendorProducts,
  type VendorProductWithStock,
} from "./_lib/get-vendor-products";

export default async function VendorProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Math.max(1, Number(searchParams?.page ?? 1));
  const q = getParam(searchParams, "q");
  const category = getParam(searchParams, "category") || "all";
  const sort = getParam(searchParams, "sort") || "recently_added";

  // let vendorId = "";
  let products: VendorProductWithStock[] = [];
  let error = "";
  let categories: string[] = [];
  let paginationInfo = {
    total_records: 0,
    total_pages: 1,
    page_size: 10,
    current_page: currentPage,
  };

  try {
    const [vendorProducts, serverCategories] = await Promise.all([
      getVendorProducts({
        page: currentPage,
        q,
        category,
        sort,
      }),
      getVendorProductCategories(),
    ]);
    // vendorId = vendorProducts.vendorId;
    products = vendorProducts.products;
    paginationInfo = vendorProducts.pagination;
    categories = serverCategories;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      error = err.message;
    } else if (err instanceof Error) {
      error = err.message;
    } else {
      error = "Failed to load products";
    }
  }

  const totalListings = paginationInfo.total_records;
  const lowStock = products.filter(
    (item) => getStockCount(item) > 0 && getStockCount(item) < 10,
  ).length;
  const outOfStock = products.filter(
    (item) => getStockCount(item) === 0,
  ).length;
  const inventoryValue = products.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Math.max(getStockCount(item), 0),
    0,
  );
  const tableRows = products;

  return (
    <main className="min-h-screen p-4 pt-24 md:ml-64 md:p-8 md:pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <span>Inventory</span>
              <ChevronRight size={14} />
              <span className="text-[#135bec]">All Products</span>
            </nav>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Product Catalog
            </h2>
            <p className="mt-1 text-slate-500">
              Manage your storefront inventory and real-time availability.
            </p>
            {error ? (
              <p className="mt-2 text-xs text-red-700">{error}</p>
            ) : null}
          </div>

          <Link
            href="/vendor/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#135bec] px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={18} />
            Add New Product
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Listings"
            value={String(totalListings)}
            badge="+4 this week"
            badgeClass="bg-green-100 text-green-700"
          />
          <StatCard
            label="Low Stock Items"
            value={String(lowStock)}
            valueClass="text-[#e73908]"
            badge="Requires Action"
            badgeClass="bg-red-100 text-red-700"
          />
          <StatCard
            label="Out of Stock"
            value={String(outOfStock)}
            badge="Archived"
            badgeClass="bg-[#f0f2f4] text-slate-600"
          />
          <StatCard
            label="Inventory Value"
            value={(inventoryValue / 1000).toFixed(1) + "k"}
            badge="ETB"
            badgeClass="bg-[#e2e6ff] text-[#135bec]"
          />
        </div>

        <ProductsControls categories={categories} />

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/50 bg-[#f0f2f4]/40">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Product Info
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Price (ETB)
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Stock Status
                  </th>
                  <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40">
                {!tableRows.length ? (
                  <tr>
                    <td
                      className="px-6 py-6 text-sm text-slate-500"
                      colSpan={5}
                    >
                      No products returned from /api/ecommerce/vendors/
                      {"{vendor_id}"}/listings/.
                    </td>
                  </tr>
                ) : null}

                {tableRows.map((product) => {
                  const stockCount = getStockCount(product);
                  const stockState =
                    stockCount === 0
                      ? "Out of Stock"
                      : stockCount > 0 && stockCount < 10
                        ? "Low Stock"
                        : "In Stock";
                  const stockClass =
                    stockState === "Out of Stock"
                      ? "bg-[#e73908]"
                      : stockState === "Low Stock"
                        ? "bg-orange-400"
                        : "bg-green-500";
                  const stockTextClass =
                    stockState === "Out of Stock"
                      ? "text-[#e73908]"
                      : stockState === "Low Stock"
                        ? "text-orange-700"
                        : "text-green-700";

                  return (
                    <tr
                      key={product.id}
                      className="group transition-colors hover:bg-[#f0f2f4]/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[#f0f2f4]">
                            <ProductImage
                              alt={product.item_name}
                              src={product.image}
                            />
                          </div>
                          <div>
                            <p className="mb-0.5 flex items-center gap-1 text-sm font-bold leading-tight">
                              <span>{product.item_name}</span>
                              {product.is_verified ? (
                                <CheckCircle2
                                  size={14}
                                  className="text-[#135bec]"
                                  aria-label="Verified product"
                                />
                              ) : null}
                            </p>
                            <p className="font-mono text-[10px] text-slate-500">
                              SKU: ETH-{product.id}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {formatDate(product.date)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-[#dbe1ff] px-2 py-1 text-[10px] font-bold text-[#111318]">
                          {product.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black italic">
                          {formatMoney(product.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={[
                              "h-2 w-2 rounded-full",
                              stockClass,
                            ].join(" ")}
                          />
                          <span
                            className={[
                              "text-xs font-bold",
                              stockTextClass,
                            ].join(" ")}
                          >
                            {stockState}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] font-semibold text-slate-500">
                          {stockCount >= 0
                            ? `${stockCount} ${product.unit || "units"} available`
                            : "Stock not set"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f2f4] text-slate-500 transition-all hover:bg-[#e2e6ff] hover:text-[#135bec]"
                            href={`/vendor/products/${product.id}/edit`}
                          >
                            <Pencil size={16} />
                          </Link>
                          <DeleteProductButton
                            listingId={String(product.id)}
                            productName={product.item_name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/40 bg-[#f0f2f4]/20 px-6 py-4">
            <p className="text-xs font-bold text-slate-500">
              Showing{" "}
              {tableRows.length
                ? (paginationInfo.current_page - 1) * paginationInfo.page_size +
                  1
                : 0}
              -
              {Math.min(
                paginationInfo.current_page * paginationInfo.page_size,
                paginationInfo.total_records,
              )}{" "}
              of {paginationInfo.total_records} products
            </p>
            <div className="flex items-center gap-2">
              {paginationInfo.current_page > 1 ? (
                <Link
                  href={buildPageHref(
                    searchParams,
                    paginationInfo.current_page - 1,
                  )}
                  className="flex h-8 w-8 items-center justify-center rounded bg-[#f0f2f4] text-slate-500 hover:bg-[#e2e6ff] hover:text-[#135bec]"
                >
                  <ChevronLeft size={14} />
                </Link>
              ) : (
                <button
                  disabled
                  className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded bg-[#f0f2f4] text-slate-500/50"
                  type="button"
                >
                  <ChevronLeft size={14} />
                </button>
              )}

              {Array.from(
                { length: paginationInfo.total_pages },
                (_, i) => i + 1,
              )
                .filter(
                  (page) =>
                    page === 1 ||
                    page === paginationInfo.total_pages ||
                    Math.abs(page - paginationInfo.current_page) <= 1,
                )
                .map((page, index, array) => {
                  const content = (
                    <Link
                      key={page}
                      href={buildPageHref(searchParams, page)}
                      className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold ${page === paginationInfo.current_page ? "bg-[#135bec] text-white" : "bg-[#f0f2f4] text-slate-600 hover:bg-[#e2e6ff] hover:text-[#135bec]"}`}
                    >
                      {page}
                    </Link>
                  );

                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <div
                        key={`ellipsis-${page}`}
                        className="flex items-center gap-2"
                      >
                        <span className="flex h-8 w-8 items-center justify-center text-slate-500">
                          ...
                        </span>
                        {content}
                      </div>
                    );
                  }
                  return content;
                })}

              {paginationInfo.current_page < paginationInfo.total_pages ? (
                <Link
                  href={buildPageHref(
                    searchParams,
                    paginationInfo.current_page + 1,
                  )}
                  className="flex h-8 w-8 items-center justify-center rounded bg-[#f0f2f4] text-slate-500 hover:bg-[#e2e6ff] hover:text-[#135bec]"
                >
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <button
                  disabled
                  className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded bg-[#f0f2f4] text-slate-500/50"
                  type="button"
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#135bec] to-[#2f4380] p-6 text-white shadow-xl shadow-blue-500/10">
          <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Lightbulb size={20} />
            </div>
            <div className="text-center md:text-left">
              <h4 className="mb-1 text-lg font-bold">
                Growth Tip: Enhance your Product Visuals
              </h4>
              <p className="max-w-2xl text-sm text-white/80">
                Products with at least 3 high-resolution images see a 40% higher
                conversion rate among Ethiopian shoppers.
              </p>
            </div>
            <button
              className="whitespace-nowrap rounded-xl bg-white px-5 py-2 text-xs font-bold text-[#135bec] transition-colors hover:bg-[#f0f2f4] md:ml-auto"
              type="button"
            >
              Learn More
            </button>
          </div>
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5" />
        </div>
      </div>
    </main>
  );
}
function getStockCount(product: VendorProductWithStock): number {
  return product.stock_count ?? product.quantity ?? -1;
}

function getParam(
  searchParams: { [key: string]: string | string[] | undefined } | undefined,
  key: string,
): string {
  const raw = searchParams?.[key];
  return Array.isArray(raw) ? raw[0] || "" : raw || "";
}

function buildPageHref(
  searchParams: { [key: string]: string | string[] | undefined } | undefined,
  page: number,
): string {
  const params = new URLSearchParams();
  if (!searchParams) {
    params.set("page", String(page));
    return `/vendor/products?${params.toString()}`;
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (Array.isArray(value)) {
      if (value[0]) params.set(key, value[0]);
      continue;
    }
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  return `/vendor/products?${params.toString()}`;
}

function formatDate(dateValue: string): string {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function StatCard({
  label,
  value,
  badge,
  badgeClass,
  valueClass,
}: {
  label: string;
  value: string;
  badge: string;
  badgeClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-transparent bg-white p-5 transition-all hover:border-[#135bec]/20">
      <p className="mb-2 text-xs font-bold uppercase text-slate-500">{label}</p>
      <div className="flex items-baseline gap-2">
        <span
          className={["text-2xl font-black italic", valueClass || ""].join(" ")}
        >
          {value}
        </span>
        <span
          className={[
            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
            badgeClass,
          ].join(" ")}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}
