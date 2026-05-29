"use client";

import type { AdminVendorRatingRow } from "@/services/adminDashboardService";
import Link from "next/link";
import { useMemo, useState } from "react";

type RankMode = "top" | "least";

type VendorRankingSwitcherProps = {
  topRatedVendors: AdminVendorRatingRow[];
  leastRatedVendors: AdminVendorRatingRow[];
};

export function VendorRankingSwitcher({ topRatedVendors, leastRatedVendors }: VendorRankingSwitcherProps) {
  const [mode, setMode] = useState<RankMode>("top");

  const rows = useMemo(
    () => (mode === "top" ? topRatedVendors : leastRatedVendors),
    [mode, topRatedVendors, leastRatedVendors],
  );

  const title = mode === "top" ? "Top 20 rated vendors" : "Top 10 least rated vendors";
  const subtitle =
    mode === "top"
      ? "Highest-rated vendors across the platform, ranked by average rating and review volume."
      : "Lowest-rated vendors across the platform, useful for support follow-up and quality review.";

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.14)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            Vendor ranking
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("top")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              mode === "top" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            Top 20
          </button>
          <button
            type="button"
            onClick={() => setMode("least")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              mode === "least" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            Least 10
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((vendor, index) => {
          const accent = mode === "top" ? "from-sky-50 to-white" : "from-rose-50 to-white";
          const badge = mode === "top" ? "bg-sky-100 text-sky-700" : "bg-rose-100 text-rose-700";
          return (
            <article
              key={vendor.id}
              className={["rounded-2xl border border-slate-100 bg-gradient-to-br p-4 shadow-sm", accent].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">#{index + 1}</p>
                  <h4 className="mt-1 font-bold text-slate-900 line-clamp-1">{vendor.shop_name}</h4>
                  <p className="text-sm text-slate-500">{vendor.city}</p>
                </div>
                <span className={[
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                  badge,
                ].join(" ")}
                >
                  {Number(vendor.rating_avg).toFixed(2)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Reviews</p>
                  <p className="font-semibold text-slate-900">{vendor.rating_count.toLocaleString("en-ET")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Status</p>
                  <p className="font-semibold text-slate-900">{vendor.verification_status.replace(/_/g, " ")}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                  {vendor.is_verified ? "Verified" : "Not verified"}
                </span>
                <Link
                  href={`/shop/vendors/${vendor.id}`}
                  className="text-xs font-semibold text-sky-700 transition hover:text-sky-900"
                >
                  Open shop
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}