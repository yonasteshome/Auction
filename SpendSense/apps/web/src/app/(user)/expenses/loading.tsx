import { Skeleton } from "@repo/ui/components/skeleton";

export default function ExpensesLoading() {
  return (
    <div className="max-w-7xl space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <div className="flex justify-between gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="border rounded-xl">
        <div className="p-4 border-b bg-slate-50/50">
          <Skeleton className="h-6 w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
