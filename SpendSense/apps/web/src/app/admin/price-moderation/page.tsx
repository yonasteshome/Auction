import { Suspense } from "react";
import AdminPanelShell from "../_components/admin-panel-shell";
import PriceModerationClient from "./price-moderation-client";
import { getAdminSubmissions, getAdminModerationStats } from "@/lib/admin-submissions";
import { ApiError } from "@/lib/api";

async function ModerationContent() {
  try {
    const [{ results, pagination }, stats] = await Promise.all([
      getAdminSubmissions({ status: "pending", page: 1, page_size: 12 }),
      getAdminModerationStats(),
    ]);

    return (
      <PriceModerationClient
        initialSubmissions={results}
        initialPagination={pagination}
        stats={stats}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
          <p className="text-red-700 font-semibold">Access denied — admin role required.</p>
        </div>
      );
    }
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500">
        <p className="font-semibold">Failed to load moderation queue.</p>
        <p className="text-sm mt-1">Check your connection or try refreshing.</p>
      </div>
    );
  }
}

function ModerationSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-100" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-[450px] animate-pulse rounded-2xl bg-slate-100 lg:col-span-3" />
      </div>
    </div>
  );
}

export default function PriceModerationPage() {
  return (
    <AdminPanelShell
      activeTab="moderation"
      subtitle="Verify crowdsourced market data from user submissions across Ethiopia."
      title="Price Moderation Queue"
    >
      <Suspense fallback={<ModerationSkeleton />}>
        <ModerationContent />
      </Suspense>
    </AdminPanelShell>
  );
}
