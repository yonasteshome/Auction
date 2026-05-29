"use client";

import { Activity, AlertTriangle, Package, Plus, Star, Wallet } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { formatMoney, getStoredVendorId, setStoredVendorId, VendorOrder, VendorProduct } from "./vendor-api";

export default function VendorDashboardClient({
  initialVendorId,
  initialProfile,
  initialProducts,
  initialOrders,
}: {
  initialVendorId: string;
  initialProfile: Record<string, any> | null;
  initialProducts: VendorProduct[];
  initialOrders: VendorOrder[];
}) {
  const [vendorId, setVendorId] = useState(initialVendorId || getStoredVendorId());
  const [products] = useState<VendorProduct[]>(initialProducts || []);
  const [orders] = useState<VendorOrder[]>(initialOrders || []);
  const [loading] = useState(false);
  const [error] = useState("");

  const vendorInfo = (initialProfile?.vendor_info || {}) as Record<string, any>;
  const profileName = initialProfile?.full_name || initialProfile?.email || "Vendor Team";
  const vendorRating = Number(vendorInfo.rating_avg ?? 0);
  const vendorRatingCount = Number(vendorInfo.rating_count ?? 0);

  const walletBalance = useMemo(() => {
    const rawBalance = initialProfile?.vendor_info?.wallet_balance;
    const numericBalance = typeof rawBalance === "string" ? Number(rawBalance) : Number(rawBalance ?? 0);
    return Number.isFinite(numericBalance) ? numericBalance : 0;
  }, [initialProfile]);

  useEffect(() => {
    try {
      if (vendorId) setStoredVendorId(vendorId);
    } catch {}
  }, [vendorId]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [orders],
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => (order.status || "").toLowerCase() !== "delivered").length,
    [orders],
  );

  const pendingOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = normalizeStatus(order.status);
        return statusHas(status, "pending") || statusHas(status, "processing");
      }).length,
    [orders],
  );

  const totalUnitsSold = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.quantity || 0), 0),
    [orders],
  );

  const salesBars = useMemo(() => {
    const toLocalDayKey = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const days: { key: string; label: string; fullDate: string; value: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(now.getDate() - i);
      days.push({
        key: toLocalDayKey(d),
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        fullDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: 0,
      });
    }

    const totalsByDay = new Map(days.map((d) => [d.key, 0]));

    orders.forEach((order) => {
      if (!order.created_at) return;
      const createdAt = new Date(order.created_at);
      if (Number.isNaN(createdAt.getTime())) return;

      const key = toLocalDayKey(createdAt);
      if (!totalsByDay.has(key)) return;
      totalsByDay.set(key, (totalsByDay.get(key) || 0) + Number(order.amount || 0));
    });

    const totals = days.map((d) => totalsByDay.get(d.key) || 0);
    const max = Math.max(...totals, 1);

    return days.map((day, idx) => {
      const value = totals[idx];
      const scaled = value > 0 ? Math.max(12, Math.round((value / max) * 100)) : 4;
      return {
        ...day,
        value,
        height: scaled,
      };
    });
  }, [orders]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => typeof product.stock_count === "number" && product.stock_count <= 5).slice(0, 3),
    [products],
  );
  const productsById = useMemo(() => {
    return new Map(products.map((product) => [String(product.id), product.title]));
  }, [products]);
  const sortedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bt - at;
      }),
    [orders],
  );
  const tableOrders = useMemo(() => sortedOrders.slice(0, 3), [sortedOrders]);

  const latestOrderAmount = tableOrders[0]?.amount;
  const pendingAmount = useMemo(
    () =>
      sortedOrders.reduce((sum, order) => {
        const status = normalizeStatus(order.status);
        if (statusHas(status, "pending") || statusHas(status, "processing")) {
          return sum + Number(order.amount || 0);
        }
        return sum;
      }, 0),
    [sortedOrders],
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Vendor Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Welcome back, {profileName}. Here's what's happening with your store today.</p>
        {vendorId ? (
          <p className="mt-2 text-xs text-slate-500">Vendor ID: <span className="font-semibold">{vendorId}</span></p>
        ) : (
          <p className="mt-2 text-xs text-amber-700">No vendor id found. Register vendor to sync product listings.</p>
        )}
        {error ? <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          badge={initialProfile?.vendor_info?.wallet_currency || "ETB"}
          badgeClass="bg-emerald-100 text-emerald-700"
          iconClass="bg-[#e2e6ff] text-[#135bec]"
          icon={<Wallet size={18} />}
          label="Wallet Balance"
          value={loading ? "..." : formatMoney(walletBalance, initialProfile?.vendor_info?.wallet_currency || "ETB")}
        />
        <MetricCard
          badge={`${pendingOrders || 0} Pending`}
          badgeClass="bg-amber-100 text-amber-700"
          iconClass="bg-[#dbe1ff] text-[#485c9a]"
          icon={<Package size={18} />}
          label="Active Orders"
          value={loading ? "..." : String(activeOrders)}
        />
        <MetricCard
          badge={`${products.length} Listed`}
          badgeClass="bg-emerald-100 text-emerald-700"
          iconClass="bg-[#ffdbcf] text-[#902e00]"
          icon={<Activity size={18} />}
          label="Units Sold"
          value={loading ? "..." : totalUnitsSold.toLocaleString()}
        />
        <MetricCard
          badge={vendorRatingCount > 0 ? `${vendorRatingCount} Reviews` : "No Reviews"}
          badgeClass="bg-slate-200 text-slate-700"
          iconClass="bg-[#f0f2f4] text-slate-700"
          icon={<Star size={18} />}
          label="Average Rating"
          value={vendorRatingCount > 0 ? `${vendorRating.toFixed(1)} / 5.0` : "Not rated"}
        />
      </div>

      <div className="mb-8 flex justify-end">
        <Link
          className="rounded-full bg-[#135bec] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f48c5]"
          href="/vendor/wallet"
        >
          View Wallet History
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold">Sales Performance</h3>
            <div className="flex gap-2">
              <button className="rounded-full bg-[#135bec] px-3 py-1 text-xs font-bold text-white" type="button">Weekly</button>
              <button className="rounded-full px-3 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100" type="button">Monthly</button>
            </div>
          </div>

          <div className="flex h-64 items-end justify-between gap-2 px-2">
            {salesBars.map((bar, idx) => (
              <div
                key={bar.key}
                className={[
                  "group relative w-full rounded-t-lg transition-all",
                  idx === salesBars.length - 1 ? "bg-[#135bec] shadow-lg shadow-blue-500/20" : "bg-[#135bec]/10 hover:bg-[#135bec]/20",
                ].join(" ")}
                style={{ height: `${bar.height}%` }}
              >
                <div className={[
                  "absolute left-1/2 -translate-x-1/2 rounded bg-[#101622] px-2 py-1 text-[10px] text-[#f6f6f8] shadow",
                  idx === salesBars.length - 1 ? "-top-10" : "-top-8 opacity-0 transition-opacity group-hover:opacity-100",
                ].join(" ")}>
                  {bar.fullDate}: {formatMoney(bar.value)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-tight text-slate-500">
            {salesBars.map((bar) => (
              <span key={bar.key}>{bar.label}</span>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <AlertTriangle className="text-[#e73908]" size={18} />
            <h3 className="font-bold">Inventory Alerts</h3>
          </div>

          <div className="space-y-4">
            {lowStockProducts.length ? (
              lowStockProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className={[
                    "flex items-center gap-3 rounded-lg border p-3",
                    idx === 0 ? "border-red-100 bg-red-50/40" : "border-slate-200 bg-[#f0f2f4]",
                  ].join(" ")}
                >
                  <img
                    alt={product.title}
                    className="h-12 w-12 rounded-lg object-cover"
                    src={idx === 0
                      ? "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=120&h=120&fit=crop"
                      : "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=120&h=120&fit=crop"}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold">{product.title}</p>
                    <p className={[("text-[10px] font-medium"), idx === 0 ? "text-red-600" : "text-amber-700"].join(" ")}>
                      {typeof product.stock_count === "number" ? `${product.stock_count} items left` : "Low stock"}
                    </p>
                  </div>
                  <button
                    className={[("rounded-lg px-3 py-1 text-[10px] font-bold"), idx === 0 ? "bg-[#e73908] text-white" : "bg-slate-800 text-white"].join(" ")}
                    type="button"
                  >
                    {idx === 0 ? "Restock" : "View"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No inventory alerts right now.</p>
            )}

            <div className="border-t border-slate-200 pt-2 text-center">
              <Link className="text-xs font-bold text-[#135bec] hover:underline" href="/vendor/products">
                Manage All Inventory
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-xl bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200/70 p-6">
            <h3 className="font-bold">Recent Orders</h3>
            <Link className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#135bec] transition hover:bg-[#135bec]/5" href="/vendor/orders">
              View Full History
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f0f2f4] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {tableOrders.map((order, idx) => {
                  const customer = order.customer_name || order.customer_email || "Customer";
                  const initials = customer
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() || "")
                    .join("") || "CU";
                  const productName = order.listing_id ? productsById.get(String(order.listing_id)) || "Store Product" : "Store Product";
                  const status = normalizeStatus(order.status) || "processing";
                  const paymentStatus = normalizeStatus(order.payment_status);
                  const isPaid =
                    statusHas(status, "paid") ||
                    statusHas(status, "ship") ||
                    statusHas(status, "deliver") ||
                    statusHas(paymentStatus, "paid");
                  const paidAmount = isPaid ? Number(order.amount || 0) : 0;
                  const badgeClass = statusHas(status, "deliver")
                    ? "bg-emerald-100 text-emerald-700"
                    : statusHas(status, "ship")
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700";

                  return (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 text-xs font-bold">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dbe1ff] text-[10px] font-bold text-[#00174c]">
                            {initials}
                          </div>
                          <span className="text-xs font-medium">{customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{productName}</td>
                      <td className="px-6 py-4 text-xs font-bold">{formatMoney(paidAmount, order.currency)}</td>
                      <td className="px-6 py-4">
                        <span className={["rounded-full px-2 py-1 text-[10px] font-bold capitalize", badgeClass].join(" ")}>
                          {status || "processing"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!loading && !tableOrders.length ? (
                  <tr>
                    <td className="px-6 py-5 text-sm text-slate-500" colSpan={5}>No recent orders found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-bold">Activity Feed</h3>
          <div className="space-y-6">
            <FeedItem
              color="bg-[#135bec] ring-[#135bec]/10"
              title={tableOrders[0] ? "New Order Received" : "No Recent Orders"}
              description={tableOrders[0] ? `Order #${tableOrders[0].id.slice(0, 8).toUpperCase()} for ${formatMoney(latestOrderAmount, tableOrders[0].currency)} was created.` : "New order activity will appear here."}
              time={tableOrders[0]?.created_at ? new Date(tableOrders[0].created_at).toLocaleString() : "-"}
            />
            <FeedItem
              color="bg-amber-500 ring-amber-500/10"
              title="Pending Orders"
              description={pendingOrders > 0 ? `${pendingOrders} orders pending, total ${formatMoney(pendingAmount)}.` : "All orders are currently up to date."}
              time="Live"
            />
            <FeedItem
              color="bg-emerald-500 ring-emerald-500/10"
              title="Wallet Status"
              description={`Current balance: ${formatMoney(walletBalance, initialProfile?.vendor_info?.wallet_currency || "ETB")}`}
              time="Live"
              last
            />
            <button className="w-full rounded-lg bg-[#f0f2f4] py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-200" type="button">
              Clear Notifications
            </button>
          </div>
        </section>
      </div>

      <button className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#135bec] text-white shadow-xl shadow-blue-500/30 transition-transform hover:scale-110 active:scale-95" type="button">
        <Plus size={24} />
      </button>
    </main>
  );
}

function normalizeStatus(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}

function statusHas(value: unknown, needle: string): boolean {
  return typeof value === "string" && value.includes(needle);
}

function MetricCard({ icon, iconClass, badge, badgeClass, label, value }: { icon: React.ReactNode; iconClass: string; badge: string; badgeClass: string; label: string; value: string; }) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={"rounded-lg p-2 " + iconClass}>{icon}</div>
        <span className={"rounded-full px-2 py-1 text-xs font-bold " + badgeClass}>{badge}</span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function FeedItem({ color, title, description, time, last }: { color: string; title: string; description: string; time: string; last?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="relative">
        <div className={["mt-1.5 h-2 w-2 rounded-full ring-4", color].join(" ")} />
        {!last ? <div className="absolute left-1/2 top-4 h-10 w-px -translate-x-1/2 bg-slate-300" /> : null}
      </div>
      <div>
        <p className="text-xs font-bold">{title}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
        <span className="text-[10px] font-medium text-slate-400">{time}</span>
      </div>
    </div>
  );
}
