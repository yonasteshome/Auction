"use client";

import Link from "next/link";
import { useState } from "react";

type VendorReviewToggleProps = {
  vendorId: string;
  reportReason?: string;
  reportCount?: number;
};

export default function VendorReviewToggle({ vendorId, reportReason, reportCount }: VendorReviewToggleProps) {
  const [showReason, setShowReason] = useState(false);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setShowReason((value) => !value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        View reviews
      </button>
      {showReason && reportReason ? (
        <p className="max-w-[14rem] text-right text-xs text-rose-600 line-clamp-3">
          {reportReason}
        </p>
      ) : null}
      <Link
        href={`/shop/vendors/${vendorId}`}
        className="text-[11px] font-medium text-slate-400 transition hover:text-slate-600"
        title={reportCount ? `${reportCount} reports` : undefined}
      >
        Open vendor page{typeof reportCount === "number" ? ` (${reportCount} reports)` : ""}
      </Link>
    </div>
  );
}