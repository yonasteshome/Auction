"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { SubmissionForm } from "./submission-form";
import { SubmissionHistory } from "./submission-history";
import type { MarketItem } from "@/types/api/vendor";
import type {
  ContributorStatsResponse,
  MySubmissionsListResponse,
  MySubmissionResponse,
  SubmissionStatus,
} from "@/types/api/price-submissions";

interface SubmitPageClientProps {
  items: MarketItem[];
  stats: ContributorStatsResponse | null;
  submissionsByStatus: Record<SubmissionStatus, MySubmissionsListResponse>;
  allRecentSubmissions: MySubmissionResponse[];
}

export function SubmitPageClient({
  items,
  stats,
  submissionsByStatus,
  allRecentSubmissions,
}: SubmitPageClientProps) {
  const [editing, setEditing] = useState<MySubmissionResponse | null>(null);

  return (
    <main className="bg-[#f6f6f8] px-4 py-8 text-[#111318] antialiased md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <nav className="mb-2 flex items-center gap-2 text-sm text-[#616f89]">
            <span>Market</span>
            <ChevronRight size={14} />
            <span className="font-medium text-[#135bec]">Submit Price</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight">
            Contribute Price Data
          </h1>
          <p className="mt-1 max-w-2xl text-[#616f89]">
            Help your community track living costs. Your submission will be
            reviewed and added to our database.
          </p>
          {stats && (
            <p className="mt-3 text-sm font-semibold text-[#135bec]">
              {stats.total_week_submissions.toLocaleString()} prices submitted
              this week community-wide
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <SubmissionForm
            items={items}
            stats={stats}
            recentSubmissions={allRecentSubmissions}
            editing={editing}
            onEditComplete={() => setEditing(null)}
            onSuccess={() => setEditing(null)}
          />
        </div>

        <SubmissionHistory
          initialByStatus={submissionsByStatus}
          onEdit={(sub) => {
            setEditing(sub);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </main>
  );
}
