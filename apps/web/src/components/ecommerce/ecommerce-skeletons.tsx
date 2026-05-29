import { Skeleton } from "@repo/ui/components/skeleton";

export function EcommercePageSkeleton() {
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4 shadow-sm">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="mt-3 h-4 w-2/5" />
            <Skeleton className="mt-6 h-4 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}
