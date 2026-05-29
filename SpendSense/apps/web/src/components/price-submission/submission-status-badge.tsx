import { Badge } from "@repo/ui/components/badge";
import type { SubmissionStatus } from "@/types/api/price-submissions";

const STATUS_STYLES: Record<
  SubmissionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const cfg = STATUS_STYLES[status];
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
