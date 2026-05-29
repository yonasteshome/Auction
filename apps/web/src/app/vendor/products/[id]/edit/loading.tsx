import { Skeleton } from "@repo/ui/components/skeleton";
import { ChevronRight, ImageIcon } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f6f6f8] p-4 md:ml-64 md:p-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Breadcrumb Skeleton */}
        <div className="mb-8">
          <nav className="mb-2 flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <ChevronRight size={12} className="text-slate-300" />
            <Skeleton className="h-3 w-20" />
          </nav>

          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form Area */}
          <div className="space-y-6 lg:col-span-2">
            <section className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
              <Skeleton className="h-7 w-48" />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-11 w-full rounded-lg" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Media Area */}
          <div className="space-y-6">
            <section className="rounded-xl bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <ImageIcon size={18} className="text-slate-200" />
                <Skeleton className="h-6 w-32" />
              </div>

              <div className="grid gap-2">
                {/* Main Image Skeleton */}
                <Skeleton className="aspect-square w-full rounded-md" />
                
                {/* Thumbnails Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <div className="aspect-square rounded-md border border-dashed border-slate-200" />
                </div>
                
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}