import { Suspense } from "react";
import { getMarketItems } from "@/lib/market";
import {
  getContributorStats,
  getMySubmissions,
} from "@/lib/price-submissions";
import { SubmitPageClient } from "@/components/price-submission/submit-page-client";
import { FormSkeleton } from "@/components/price-submission/form-skeleton";
import type {
  MySubmissionsListResponse,
  SubmissionStatus,
} from "@/types/api/price-submissions";

const EMPTY_PAGE: MySubmissionsListResponse = {
  results: [],
  pagination: {
    total_records: 0,
    total_pages: 0,
    page_size: 10,
    current_page: 1,
  },
};

async function SubmitPageContent() {
  const [items, statsResult, pending, approved, rejected] = await Promise.all([
    getMarketItems(),
    getContributorStats().catch(() => null),
    getMySubmissions({ status: "pending" }).catch(() => EMPTY_PAGE),
    getMySubmissions({ status: "approved" }).catch(() => EMPTY_PAGE),
    getMySubmissions({ status: "rejected" }).catch(() => EMPTY_PAGE),
  ]);

  const submissionsByStatus: Record<SubmissionStatus, MySubmissionsListResponse> =
    {
      pending,
      approved,
      rejected,
    };

  const allRecentSubmissions = [
    ...pending.results,
    ...approved.results,
    ...rejected.results,
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <SubmitPageClient
      items={items}
      stats={statsResult}
      submissionsByStatus={submissionsByStatus}
      allRecentSubmissions={allRecentSubmissions}
    />
  );
}

export default function MarketSubmitPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-[#f6f6f8] px-4 py-8 md:px-8">
          <div className="mx-auto max-w-6xl">
            <FormSkeleton />
          </div>
        </main>
      }
    >
      <SubmitPageContent />
    </Suspense>
  );
}
