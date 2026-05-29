export const dynamic = "force-dynamic";

import { apiClient } from "@/lib/api";
import VendorDashboardClient from "./VendorDashboardClient";

import type { VendorOrder, VendorProduct } from "./vendor-api";

export default async function VendorDashboardPage() {
  try {
    const profile = await apiClient<Record<string, any>>({ method: "GET", endpoint: "/api/users/me/" });

    const vendorId = profile?.vendor_info?.vendor_id ?? "";

    const orders = await apiClient<{
      count: number;
      next: string | null;
      previous: string | null;
      results: VendorOrder[];
    }>({ method: "GET", endpoint: "/api/ecommerce/vendor/sales/" }).catch(() => ({ count: 0, next: null, previous: null, results: [] }));

    const products = await apiClient<{
      count: number;
      next: string | null;
      previous: string | null;
      results: VendorProduct[];
    }>({ method: "GET", endpoint: `/api/ecommerce/vendors/${vendorId}/listings/` }).catch(() => ({ count: 0, next: null, previous: null, results: [] }));

    return (
      <VendorDashboardClient
        initialVendorId={vendorId}
        initialProfile={profile}
        initialProducts={products.results || []}
        initialOrders={orders.results || []}
      />
    );
  } catch (err) {
    // If auth failed, show a minimal client with no data so UI can render and show message
    return (
      <VendorDashboardClient initialVendorId="" initialProfile={null} initialProducts={[]} initialOrders={[]} />
    );
  }
}
//         {!last ? <div className="absolute left-1/2 top-4 h-10 w-px -translate-x-1/2 bg-slate-300" /> : null}
//       </div>
//       <div>
//         <p className="text-xs font-bold">{title}</p>
//         <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
//         <span className="text-[10px] font-medium text-slate-400">{time}</span>
//       </div>
//     </div>
//   );
// }
