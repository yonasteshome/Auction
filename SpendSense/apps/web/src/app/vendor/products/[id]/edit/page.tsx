export const dynamic = "force-dynamic";

import { apiClient, ApiError } from "@/lib/api";
import { getMarketCategories, getMarketItems } from "@/lib/market";
import type { VendorPriceResponse } from "@/types/api/vendor";
import { Info } from "lucide-react";
import Link from "next/link";
import ProductEditForm from "./ProductEditForm";

export default async function VendorProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = String(id || "");

  if (!productId) {
    return <ErrorCard message="Missing product ID." />;
  }

  try {
    const [items, categories, product] = await Promise.all([
      getMarketItems(),
      getMarketCategories(),
      apiClient<VendorPriceResponse>({
        method: "GET",
        endpoint: `/api/ecommerce/listings/${productId}/`,
      }),
    ]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f6f6f8] p-4 md:ml-64 md:p-8">
      <div className="mx-auto max-w-5xl">
        <ProductEditForm
          productId={productId}
          initialItems={items}
          initialCategories={categories}
          initialProduct={product}
        />
      </div>
    </main>
  );
  } catch (error: unknown) {
    const message =
      error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Unable to load product details.";
    return <ErrorCard message={message} />;
  }
}

function ErrorCard({ message }: { message: string }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f6f6f8] p-4 md:ml-64 md:p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-center shadow-sm">
        <div className="mb-4 flex justify-center text-red-500">
          <Info size={44} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Unable to load product editor</h2>
        <p className="mt-2 text-slate-500">{message}</p>
        <div className="mt-8">
          <Link href="/vendor/products" className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200">
            Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
}
