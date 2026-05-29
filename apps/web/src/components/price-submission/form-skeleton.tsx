import { Skeleton } from "@repo/ui/components/skeleton";

export function FormSkeleton() {
  return (
    <div className="space-y-6 lg:col-span-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="rounded-xl border border-[#cbd5e1]/30 bg-white p-8">
        <Skeleton className="mb-6 h-6 w-40" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-12 md:col-span-2" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12 md:col-span-2" />
        </div>
        <Skeleton className="mt-8 h-48 w-full" />
        <Skeleton className="mt-8 h-32 w-full" />
        <Skeleton className="mt-8 h-12 w-36 ml-auto" />
      </div>
    </div>
  );
}
