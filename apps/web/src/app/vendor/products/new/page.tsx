export const dynamic = "force-dynamic";

import { getMarketItems, getMarketCategories } from "@/lib/market";
import ProductCreateForm from "./ProductCreateForm";
import { Suspense } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { apiClient } from "@/lib/api";
import { VendorProfile } from "../../_lib/vendor-api";

export const metadata = {
  title: "New Product | SpendSense Vendor",
  description: "Create a new product listing on the SpendSense marketplace.",
};

async function ProductCreatePageContent() {
  try {
    const [items, categories] = await Promise.all([
      getMarketItems(),
      getMarketCategories(),
    ]);

      let profile: VendorProfile | null = null;
    
      try {
        const userProfile = await apiClient<VendorProfile>({ method: "GET", endpoint: "/api/users/me/" });
        let vendorData: any = {};
        try {
          vendorData = await apiClient<any>({ method: "GET", endpoint: "/api/users/vendors/me/" });
        } catch {
          // maybe not a vendor yet or fetch failed
        }
        profile = { ...userProfile, ...vendorData };
      } catch (err) {
        // server-side fetch failed; log and continue — client will render fallback
        console.error("Failed to load profile server-side:", err);
        profile = null;
      }

    return (
      <ProductCreateForm
        vendorId={profile?.id || null}
        initialItems={items}
        initialCategories={categories}
      />
    );
  } catch (error) {
    console.error("Error loading product creation data:", error);
    return (
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-12 text-center shadow-sm">
        <div className="mb-4 flex justify-center text-red-500">
          <Info size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Unable to load form</h2>
        <p className="mt-2 text-slate-500">
          We couldn&apos;t load the product catalog. Please check your connection and try again.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/vendor/products" className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
}

export default function VendorProductCreatePage() {
  return (
    <main className="bg-[#f6f6f8] min-h-screen p-8 text-[#111318] antialiased">
      <Suspense fallback={<ProductFormSkeleton />}>
        <ProductCreatePageContent />
      </Suspense>
    </main>
  );
}

function ProductFormSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="mb-8 space-y-4">
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
        <div className="h-10 w-64 bg-slate-200 rounded"></div>
        <div className="h-4 w-96 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white rounded-xl shadow-sm"></div>
          <div className="h-48 bg-white rounded-xl shadow-sm"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-white rounded-xl shadow-sm"></div>
          <div className="h-32 bg-blue-100 rounded-xl shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}