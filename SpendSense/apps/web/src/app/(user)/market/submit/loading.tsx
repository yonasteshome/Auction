import { FormSkeleton } from "@/components/price-submission/form-skeleton";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function MarketSubmitLoading() {
  return (
    <main className="bg-[#f6f6f8] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Skeleton className="mb-2 h-4 w-48" />
        <Skeleton className="mb-8 h-10 w-80" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <FormSkeleton />
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
