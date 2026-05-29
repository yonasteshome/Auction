"use client";

import {
    BarChart3,
    Bell,
    CalendarDays,
    CircleUserRound,
    Download,
    Lightbulb,
    Package2,
    Search,
    TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    formatMoney,
    getStoredVendorId,
    getVendorOrders,
    getVendorProducts,
    getVendorRecommendations,
    VendorOrder,
    VendorProduct,
} from "../_lib/vendor-api";

export default function VendorAnalyticsPage() {
  const [vendorId, setVendorId] = useState("");
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [recommendationsCount, setRecommendationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = getStoredVendorId();
    setVendorId(id);

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const [ordersData, productsData] = await Promise.all([
          getVendorOrders(),
          id ? getVendorProducts(id) : Promise.resolve([]),
        ]);

        setOrders(ordersData);
        setProducts(productsData);

        const firstProduct = productsData[0];
        if (firstProduct) {
          const rec = await getVendorRecommendations({ item_id: firstProduct.id, limit: 10 });
          setRecommendationsCount(rec.length);
        } else {
          setRecommendationsCount(0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [orders],
  );

  const averageOrderValue = useMemo(() => {
    if (!orders.length) return 0;
    return totalRevenue / orders.length;
  }, [orders, totalRevenue]);

  const topProducts = useMemo(() => products.slice(0, 5), [products]);

  const priceScore = useMemo(() => {
    if (!products.length) return 0;
    const available = products.filter((item) => item.availability !== false).length;
    return Number(((available / products.length) * 100).toFixed(1));
  }, [products]);

  const growthRate = useMemo(() => {
    if (!orders.length) return 0;
    const recentOrders = orders.filter((order) => {
      if (!order.created_at) return false;
      const createdAt = new Date(order.created_at);
      if (Number.isNaN(createdAt.getTime())) return false;
      const daysAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).length;

    return Number(((recentOrders / orders.length) * 100).toFixed(1));
  }, [orders]);
  const activeProducts = useMemo(() => products.filter((item) => item.availability !== false).length, [products]);

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8 md:ml-64">
      <section className="mb-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight">Vendor Analytics</h2>
              <p className="text-slate-500">Performance overview for SpendSense Ethiopia (Last 30 Days)</p>
              {vendorId ? <p className="mt-1 text-xs text-slate-500">Vendor id: {vendorId}</p> : null}
              {error ? <p className="mt-1 text-xs text-slate-500">Backend note: {error}</p> : null}
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-[#f0f2f4]" type="button">
                <CalendarDays size={16} />
                June 2024
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#135bec] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90" type="button">
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <MetricCard title="Price Score" value={String(priceScore)} badge="+2.4%" icon="analytics" />
          <MetricCard title="Growth Rate" value={`${growthRate}%`} badge="+5.1%" icon="trending" />
          <MetricCard title="Total Revenue" value={loading ? "..." : formatMoney(totalRevenue)} icon="payments" />
          <MetricCard title="Active Products" value={String(activeProducts)} badge="High" icon="inventory" />
        </section>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-lg font-bold">Monthly Sales Revenue</h3>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#135bec]" /> Current</div>
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-slate-300" /> Previous</div>
              </div>
            </div>
            <div className="flex h-64 items-end justify-between gap-2">
              {[55, 60, 75, 65, 85, 95].map((cur, idx) => (
                <div key={idx} className="group flex flex-1 flex-col items-center">
                  <div className="flex h-full w-full items-end gap-1">
                    <div className="h-[45%] w-1/2 rounded-t-sm bg-slate-300 transition-all group-hover:opacity-80" />
                    <div className="w-1/2 rounded-t-sm bg-[#135bec] transition-all group-hover:scale-y-105" style={{ height: `${cur}%` }} />
                  </div>
                  <span className="mt-3 text-[10px] font-bold uppercase text-slate-500">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][idx]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-8 text-lg font-bold">Product Breakdown</h3>
            <div className="relative mb-6 flex flex-1 items-center justify-center">
              <svg className="h-48 w-48 drop-shadow-sm" viewBox="0 0 36 36">
                <path className="text-[#e2e6ff]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="4" />
                <path className="text-[#135bec]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="45, 100" strokeWidth="4" />
                <path className="text-[#485c9a]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="25, 100" strokeDashoffset="-45" strokeWidth="4" />
                <path className="text-[#902e00]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="15, 100" strokeDashoffset="-70" strokeWidth="4" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">45%</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Electronics</span>
              </div>
            </div>
            <div className="space-y-2">
              <LegendRow label="Electronics" value="45%" color="bg-[#135bec]" />
              <LegendRow label="Apparel" value="25%" color="bg-[#485c9a]" />
              <LegendRow label="Home Goods" value="15%" color="bg-[#902e00]" />
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="grid gap-8 p-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <h3 className="mb-4 text-xl font-bold">Customer Demographics</h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                Distribution of your customer base across Ethiopia's major regions.
              </p>
              <div className="space-y-4">
                <div className="rounded-lg bg-[#f0f2f4] p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-[#135bec]">Top Region</p>
                  <p className="text-lg font-bold">Addis Ababa (62%)</p>
                </div>
                <div className="rounded-lg bg-[#f0f2f4] p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-[#485c9a]">Fastest Growing</p>
                  <p className="text-lg font-bold">Dire Dawa (+12%)</p>
                </div>
              </div>
            </div>

            <div className="relative h-[400px] overflow-hidden rounded-xl border border-slate-300/30 bg-slate-100 md:col-span-2">
              <img
                alt="Ethiopia demographics map"
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=700&fit=crop"
              />
              <div className="pointer-events-none absolute inset-0 bg-[#135bec]/10" />
              <div className="absolute left-[45%] top-1/2 h-4 w-4 animate-pulse rounded-full bg-[#135bec] shadow-[0_0_15px_rgba(19,91,236,0.6)]" />
              <div className="absolute left-[65%] top-[40%] h-3 w-3 animate-pulse rounded-full bg-[#135bec]/70 shadow-[0_0_10px_rgba(19,91,236,0.4)]" />
              <div className="absolute left-[40%] top-[60%] h-2 w-2 animate-pulse rounded-full bg-[#135bec]/50" />
              <div className="absolute bottom-6 left-6 rounded-xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#135bec]/10">
                    <CircleUserRound className="text-[#135bec]" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Active Users</p>
                    <p className="text-lg font-bold">12,482</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4">
          <div className="pointer-events-auto flex max-w-xs items-start gap-4 rounded-2xl bg-[#135bec] p-6 text-white shadow-xl transition-transform duration-300 hover:-translate-y-2">
            <Lightbulb className="text-3xl" size={28} />
            <div>
              <h4 className="mb-1 text-sm font-bold">Growth Opportunity</h4>
              <p className="text-xs leading-relaxed text-blue-100">
                Increasing inventory in Apparel by 15% could boost Addis revenue by ETB 45k next month.
              </p>
            </div>
          </div>
        </div>
      </main>
  );
}

function MetricCard({ title, value, badge, icon }: { title: string; value: string; badge?: string; icon: "analytics" | "trending" | "payments" | "inventory" }) {
  const Icon = icon === "trending" ? TrendingUp : icon === "payments" ? Download : icon === "inventory" ? Package2 : BarChart3;
  return (
    <div className={[
      "rounded-xl p-6 shadow-sm transition-transform duration-300 hover:scale-[1.02]",
      title === "Active Products" ? "bg-gradient-to-br from-[#135bec] to-blue-700 text-white" : "bg-white",
    ].join(" ")}>
      <div className="mb-4 flex items-center justify-between">
        <span className={[
          "text-xs font-bold uppercase tracking-wider",
          title === "Active Products" ? "text-white/80" : "text-slate-500",
        ].join(" ")}>
          {title}
        </span>
        <Icon className={title === "Active Products" ? "text-white" : "text-[#135bec]"} size={18} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{value}</span>
        {badge ? <span className={[
          "rounded-full px-2 py-1 text-xs font-bold",
          title === "Active Products" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700",
        ].join(" ")}>{badge}</span> : null}
      </div>
    </div>
  );
}

function LegendRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-xs font-medium">
      <span className="flex items-center gap-2"><span className={["h-2 w-2 rounded-full", color].join(" ")} />{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
