import { AlertCircle } from "lucide-react";

interface BudgetErrorBannerProps {
  error: string | null;
}

export function BudgetErrorBanner({ error }: BudgetErrorBannerProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="size-4" />
      {error}
    </div>
  );
}
