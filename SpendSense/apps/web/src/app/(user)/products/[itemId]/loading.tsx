import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="pb-20 max-w-[1600px] mx-auto px-4 md:px-6 space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-5">
          <Skeleton className="w-full aspect-square rounded-2xl" />
        </div>
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
          
          <div className="flex gap-4 border-b pb-6">
            <Skeleton className="h-16 w-40" />
            <Skeleton className="h-8 w-24 self-end" />
          </div>
          
          <Skeleton className="h-5 w-40" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-12 sm:col-span-2 rounded-lg" />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      {/* Chart & Community Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-8">
          <Skeleton className="h-[450px] rounded-3xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-[450px] rounded-3xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Skeleton className="h-80 w-full rounded-3xl" />
    </div>
  );
}
