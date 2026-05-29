export const dynamic = "force-dynamic";

import { restoreVendor, suspendVendor } from "@/actions/admin/vendor-actions";
import { getAdminVendors } from "@/lib/admin/vendors";
import type { AdminVendor } from "@/types/api/admin-vendors";
import Link from "next/link";
import AdminPanelShell from "../_components/admin-panel-shell";
import VendorReviewToggle from "./_components/vendor-review-toggle";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "verified", label: "Verified" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "suspended", label: "Suspended" },
] as const;

function getVendorBucket(vendor: AdminVendor) {
  if (vendor.verification_status === "suspended") {
    return "suspended";
  }
  if (vendor.is_verified || vendor.verification_status === "verified") {
    return "verified";
  }
  if (vendor.verification_status === "rejected" || Boolean(vendor.verification_rejection_reason?.trim())) {
    return "rejected";
  }
  if (vendor.verification_status === "requested" || vendor.verification_status === "pending") {
    return "pending";
  }
  return "unrequested";
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminPanelVendorsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = Array.isArray(params?.search) ? params.search[0] : (params?.search as string | undefined) ?? "";
  const status = (Array.isArray(params?.status) ? params.status[0] : (params?.status as string | undefined)) ?? "all";
  const page = Number(Array.isArray(params?.page) ? params.page[0] : (params?.page as string | undefined)) || 1;
  const pageSize = Number(Array.isArray(params?.pageSize) ? params.pageSize[0] : (params?.pageSize as string | undefined)) || 10;

  let data;
  let loadError: string | null = null;

  try {
    data = await getAdminVendors({
      status: (STATUS_TABS.some((tab) => tab.key === status) ? status : "all") as "all" | "verified" | "pending" | "rejected" | "suspended",
      search,
      page,
      pageSize,
    });
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load vendors";
  }

  if (loadError || !data) {
    return (
      <AdminPanelShell
        activeTab="vendors"
        subtitle="Review vendor onboarding status, search businesses, and inspect the live review data from the marketplace."
        title="Vendor Management"
      >
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="text-sm font-semibold">Failed to load vendors</p>
          <p className="mt-1 text-sm">{loadError}</p>
        </div>
      </AdminPanelShell>
    );
  }

  const vendors = data.results;
  const stats = data.stats ?? {
    total: vendors.length,
    verified: vendors.filter((vendor) => getVendorBucket(vendor) === "verified").length,
    pending: vendors.filter((vendor) => getVendorBucket(vendor) === "pending").length,
    rejected: vendors.filter((vendor) => getVendorBucket(vendor) === "rejected").length,
    suspended: vendors.filter((vendor) => getVendorBucket(vendor) === "suspended").length,
    unrequested: vendors.filter((vendor) => getVendorBucket(vendor) === "unrequested").length,
    status_breakdown: {
      verified: vendors.filter((vendor) => getVendorBucket(vendor) === "verified").length,
      pending: vendors.filter((vendor) => getVendorBucket(vendor) === "pending").length,
      rejected: vendors.filter((vendor) => getVendorBucket(vendor) === "rejected").length,
      suspended: vendors.filter((vendor) => getVendorBucket(vendor) === "suspended").length,
      unrequested: vendors.filter((vendor) => getVendorBucket(vendor) === "unrequested").length,
    },
  };

  return (
    <AdminPanelShell
      activeTab="vendors"
      subtitle="Review vendor onboarding status, search businesses, and inspect the live review data from the marketplace."
      title="Vendor Management"
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <StatCard label="Total Vendors" value={stats.total} tone="slate" />
        <StatCard label="Verified" value={stats.verified} tone="green" />
        <StatCard label="Pending" value={stats.pending} tone="amber" />
        <StatCard label="Rejected" value={stats.rejected} tone="red" />
        <StatCard label="Suspended" value={stats.suspended} tone="slate" />
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Vendor Directory</h3>
            <p className="text-sm text-slate-500">Use the tabs and search box to narrow the vendor queue.</p>
          </div>

          <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input type="hidden" name="status" value={status} />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search vendor, city, owner, TIN..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white sm:w-80"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const active = tab.key === status;
            const href = buildVendorHref({ search, status: tab.key, page: 1, pageSize });
            return (
              <Link
                key={tab.key}
                href={href}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  active ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Each vendor is counted once using a normalized status bucket: verified, pending, rejected, or unrequested.
        </p>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Reviews</th>
                <th className="px-6 py-4">Reports</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Review</th>
                <th className="px-6 py-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No vendors match the current filter.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => <VendorRow key={vendor.id} vendor={vendor} />)
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          <div>
            Showing {vendors.length} of {data.pagination.total_records} vendors
            {data.search ? <> for <span className="font-semibold text-slate-700">{data.search}</span></> : null}
          </div>
          <div className="flex items-center gap-2">
            <PagerLink label="Prev" href={buildVendorHref({ search, status, page: Math.max(1, data.pagination.current_page - 1), pageSize })} disabled={data.pagination.current_page <= 1} />
            <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
              {data.pagination.current_page} / {data.pagination.total_pages || 1}
            </span>
            <PagerLink label="Next" href={buildVendorHref({ search, status, page: Math.min(data.pagination.total_pages || 1, data.pagination.current_page + 1), pageSize })} disabled={data.pagination.current_page >= data.pagination.total_pages} />
          </div>
        </div>
      </section>
    </AdminPanelShell>
  );
}

function VendorRow({ vendor }: { vendor: AdminVendor }) {
  const statusBucket = getVendorBucket(vendor);
  const statusLabel = statusBucket === "rejected"
    ? "Rejected"
    : statusBucket === "suspended"
      ? "Suspended"
    : statusBucket === "verified"
      ? "Verified"
      : statusBucket === "pending"
        ? "Pending"
        : "Unrequested";

  const statusClasses = statusBucket === "rejected"
    ? "bg-rose-100 text-rose-700"
    : statusBucket === "suspended"
      ? "bg-slate-200 text-slate-700"
    : statusLabel === "Verified"
      ? "bg-emerald-100 text-emerald-700"
      : statusLabel === "Pending"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="space-y-1">
          <p className="font-bold text-slate-900">{vendor.shop_name}</p>
          <p className="text-xs text-slate-500">{vendor.owner_name} · {vendor.owner_email}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600">
        <div className="space-y-1">
          <p>{vendor.city}</p>
          <p className="text-xs text-slate-400">{vendor.address || "No address provided"}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-700">
        <div className="space-y-1">
          <p className="font-semibold">⭐ {vendor.rating_avg} <span className="text-slate-400">({vendor.rating_count})</span></p>
          <p className="text-xs text-slate-500">Live review data</p>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-700">
        <div className="space-y-1">
          <p className="font-semibold">{vendor.report_count ?? 0} reports</p>
          {vendor.latest_report_reason ? (
            <p className="max-w-[16rem] text-xs text-slate-500 line-clamp-2">{vendor.latest_report_reason}</p>
          ) : (
            <p className="text-xs text-slate-400">No recent reports</p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-slate-500">{new Date(vendor.joined_at).toLocaleDateString()}</td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-bold", statusClasses].join(" ")}>{statusLabel}</span>
          {vendor.verification_rejection_reason && statusBucket !== "suspended" ? (
            <p className="max-w-[18rem] text-xs text-rose-600 line-clamp-2">{vendor.verification_rejection_reason}</p>
          ) : null}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <VendorReviewToggle
          vendorId={vendor.id}
          reportReason={statusBucket === "suspended" ? vendor.verification_rejection_reason || vendor.latest_report_reason : undefined}
          reportCount={vendor.report_count ?? 0}
        />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end">
          {statusBucket === "suspended" ? (
            <form
              action={async () => {
                "use server";
                const result = await restoreVendor(
                  vendor.id,
                  vendor.latest_report_reason || vendor.verification_rejection_reason || "Restored after admin review.",
                );
                if (!result.success) {
                  throw new Error(result.message);
                }
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Restore & Verify
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                const reportReason = vendor.latest_report_reason || vendor.verification_rejection_reason || "Suspended after admin review.";
                const result = await suspendVendor(vendor.id, reportReason);
                if (!result.success) {
                  throw new Error(result.message);
                }
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
              >
                Suspend
              </button>
            </form>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "slate" | "green" | "amber" | "red" }) {
  const toneClasses = {
    slate: "bg-slate-50 text-slate-900 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
  }[tone];

  return (
    <div className={["rounded-2xl border p-5 shadow-sm", toneClasses].join(" ")}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value.toLocaleString("en-ET")}</p>
    </div>
  );
}

function PagerLink({ label, href, disabled }: { label: string; href: string; disabled?: boolean }) {
  return (
    <Link
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      href={disabled ? "#" : href}
      className={[
        "rounded-full px-3 py-1.5 font-semibold transition",
        disabled ? "pointer-events-none bg-slate-100 text-slate-300" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function buildVendorHref({
  search,
  status,
  page,
  pageSize,
}: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (page) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));
  const query = params.toString();
  return query ? `/admin/vendors?${query}` : "/admin/vendors";
}
