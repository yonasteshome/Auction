"use client";

import { useTransition } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { SubmissionCard } from "./submission-card";
import { deletePriceSubmission } from "@/actions/price-submissions";
import { toast } from "sonner";
import type {
  MySubmissionResponse,
  MySubmissionsListResponse,
  SubmissionStatus,
} from "@/types/api/price-submissions";

const TABS: { value: SubmissionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

interface SubmissionHistoryProps {
  initialByStatus: Record<SubmissionStatus, MySubmissionsListResponse>;
  onEdit: (submission: MySubmissionResponse) => void;
}

export function SubmissionHistory({
  initialByStatus,
  onEdit,
}: SubmissionHistoryProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("pending").withOptions({ shallow: true }),
  );
  const [isPending, startTransition] = useTransition();

  const activeTab = (TABS.some((t) => t.value === tab) ? tab : "pending") as SubmissionStatus;
  const data = initialByStatus[activeTab];

  const handleDelete = (id: number) => {
    startTransition(async () => {
      const result = await deletePriceSubmission(id);
      if (result.success) {
        toast.success("Submission deleted.");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <section className="mt-12">
      <h3 className="mb-4 text-xl font-bold text-[#111318]">My submissions</h3>
      <Tabs
        value={activeTab}
        onValueChange={(v) => void setTab(v)}
      >
        <TabsList className="mb-6">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-2 rounded-full bg-[#f0f2f4] px-2 py-0.5 text-xs">
                {initialByStatus[t.value].pagination.total_records}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="space-y-4">
            {initialByStatus[t.value].results.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#cbd5e1] bg-white p-8 text-center text-sm text-[#616f89]">
                No {t.label.toLowerCase()} submissions yet.
              </p>
            ) : (
              initialByStatus[t.value].results.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub}
                  onEdit={onEdit}
                  onDelete={t.value === "pending" ? handleDelete : undefined}
                  deleting={isPending}
                />
              ))
            )}
            {data.pagination.total_pages > 1 && (
              <p className="text-center text-xs text-[#616f89]">
                Page {data.pagination.current_page} of{" "}
                {data.pagination.total_pages}
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
