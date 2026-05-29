import { Skeleton } from "@repo/ui/components/skeleton";

export default function BudgetLoadingSkeleton() {
  return (
    <div className="space-y-8 pb-8" aria-busy="true" aria-label="Loading budget data">
      {/* Header Skeleton */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-28 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Col: Categories */}
        <section className="space-y-4 xl:col-span-8">
          <Skeleton className="h-6 w-40" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Col: Overview & Expenses */}
        <aside className="space-y-4 xl:col-span-4">
          {/* Overview Chart Skeleton */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center gap-4">
            <Skeleton className="h-5 w-32 self-start" />
            <Skeleton className="size-48 rounded-full" />
            <div className="flex w-full justify-between mt-2">
               <Skeleton className="h-8 w-20" />
               <Skeleton className="h-8 w-20" />
            </div>
          </div>

          {/* Recent Expenses Skeleton */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-32" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
