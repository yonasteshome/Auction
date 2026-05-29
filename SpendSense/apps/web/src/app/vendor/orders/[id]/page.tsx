"use client";

import {
    ArrowLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatMoney, getVendorOrderDetail, VendorOrder } from "../../_lib/vendor-api";

export default function VendorOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = useMemo(() => String(params?.id || ""), [params]);

  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getVendorOrderDetail(orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order detail");
      } finally {
        setLoading(false);
      }
    }

    void loadOrder();
  }, [orderId]);

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-8">
      <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <span>Orders</span>
              <ChevronRight size={14} />
              <span className="text-[#135bec]">Order Detail</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-extrabold tracking-tight">Order #{orderId || "-"}</h2>
              <Link
                href="/vendor/orders"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#135bec] hover:text-[#135bec]"
              >
                <ArrowLeft size={16} />
                Back to Orders
              </Link>
            </div>
          </div>

          {loading ? <p className="mb-4 text-sm text-slate-600">Loading order detail...</p> : null}
          {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {order ? (
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Amount" value={formatMoney(order.amount, order.currency)} />
                <Detail label="Quantity" value={String(order.quantity || 0)} />
                <Detail label="Status" value={normalizeStatus(order.status) || "pending"} />
                <Detail label="Payment" value={normalizeStatus(order.payment_status) || "unknown"} />
                <Detail label="Delivery" value={normalizeStatus(order.delivery_status) || "unknown"} />
                <Detail label="Listing ID" value={order.listing_id || "N/A"} />
                <Detail label="Vendor ID" value={order.vendor_id || "N/A"} />
                <Detail label="Created At" value={order.created_at || "N/A"} />
                <Detail label="Order ID" value={order.id || "N/A"} />
              </div>
            </section>
          ) : null}
        </div>
      </main>
  );
}

function normalizeStatus(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#f0f2f4]/50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">{value}</p>
    </div>
  );
}
