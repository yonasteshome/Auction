import { Skeleton } from "@repo/ui/components/skeleton";

function NotificationCardSkeleton({ unread = false }: { unread?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        unread
          ? "border-l-4 border-l-primary border-y-slate-200 border-r-slate-200 bg-primary/5 dark:border-y-slate-800 dark:border-r-slate-800"
          : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-4/5 max-w-sm" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}

function NotificationGroupSkeleton({
  titleWidth,
  count,
}: {
  titleWidth: string;
  count: number;
}) {
  return (
    <div className="space-y-4">
      <Skeleton className={`h-4 ${titleWidth}`} />
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <NotificationCardSkeleton key={i} unread={i === 0} />
        ))}
      </div>
    </div>
  );
}

export function NotificationsListSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading notifications">
      <NotificationGroupSkeleton titleWidth="w-12" count={2} />
      <NotificationGroupSkeleton titleWidth="w-20" count={1} />
      <NotificationGroupSkeleton titleWidth="w-24" count={2} />
    </div>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl space-y-6 pb-20"
      aria-busy="true"
      aria-label="Loading notifications"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b pb-4 dark:border-slate-800">
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="ml-auto h-8 w-24 rounded-md" />
      </div>

      <div className="space-y-8">
        <NotificationGroupSkeleton titleWidth="w-12" count={2} />
        <NotificationGroupSkeleton titleWidth="w-20" count={1} />
        <NotificationGroupSkeleton titleWidth="w-24" count={2} />
      </div>
    </div>
  );
}
