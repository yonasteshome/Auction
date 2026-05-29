import { Skeleton } from "@repo/ui/components/skeleton";

export default function VendorProductsLoading() {
  return (
    <main className="min-h-screen p-4 pt-24 md:ml-64 md:p-8 md:pt-24">
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-200/50 p-4">
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/40 p-4">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-8 w-44" />
          </div>
        </div>
      </div>
    </main>
  );
}
