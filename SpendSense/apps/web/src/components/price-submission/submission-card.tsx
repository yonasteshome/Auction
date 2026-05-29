"use client";

import { MapPin, Calendar, Trash2, Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { SubmissionStatusBadge } from "./submission-status-badge";
import type { MySubmissionResponse } from "@/types/api/price-submissions";

interface SubmissionCardProps {
  submission: MySubmissionResponse;
  onEdit?: (submission: MySubmissionResponse) => void;
  onDelete?: (id: number) => void;
  deleting?: boolean;
}

export function SubmissionCard({
  submission,
  onEdit,
  onDelete,
  deleting,
}: SubmissionCardProps) {
  const canEdit =
    submission.status === "pending" || submission.status === "rejected";
  const canDelete = submission.status === "pending";

  return (
    <article className="rounded-xl border border-[#cbd5e1]/40 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-bold text-[#111318]">{submission.item_name}</h4>
          <p className="text-xs text-[#616f89]">{submission.item_category}</p>
        </div>
        <SubmissionStatusBadge status={submission.status} />
      </div>

      <p className="mt-3 text-lg font-bold text-[#135bec]">
        {Number(submission.price_value).toLocaleString()} ETB
        <span className="ml-1 text-sm font-medium text-[#616f89]">
          / {submission.unit}
        </span>
      </p>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#616f89]">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" />
          {submission.market_location}, {submission.city}
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5" />
          {submission.date_observed}
        </span>
      </div>

      {submission.rejection_reason && submission.status === "rejected" && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {submission.rejection_reason}
        </p>
      )}

      {(canEdit || canDelete) && (
        <div className="mt-4 flex gap-2">
          {canEdit && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => onEdit(submission)}
            >
              <Pencil className="mr-1 size-3.5" />
              {submission.status === "rejected" ? "Edit & resubmit" : "Edit"}
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-red-600 hover:bg-red-50"
              disabled={deleting}
              onClick={() => onDelete(submission.id)}
            >
              <Trash2 className="mr-1 size-3.5" />
              Delete
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
