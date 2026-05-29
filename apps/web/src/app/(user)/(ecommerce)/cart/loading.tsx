import { ArrowRight, LayoutDashboard, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function CartLoading() {
  return (
    <div className="flex min-h-screen bg-background text-foreground animate-pulse">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Content */}
        <main className="max-w-7xl mx-auto pb-24 lg:pb-8">
          
          {/* Header & Breadcrumbs Skeleton */}
          <div className="mb-10">
            <Skeleton className="h-9 w-48 mb-3 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12 rounded" />
              <span className="text-muted-foreground/40 text-sm">/</span>
              <Skeleton className="h-4 w-10 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: List Skeleton (Mocking 2 Cart Items) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {[1, 2].map((index) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    {/* Item Image Placeholder */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                      <LayoutDashboard className="text-muted-foreground/20" size={32} />
                    </div>
                    
                    {/* Item details */}
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <Skeleton className="h-6 w-1/3 rounded-md" />
                        <Skeleton className="h-6 w-24 rounded-md" />
                      </div>
                      
                      <Skeleton className="h-4 w-1/4 rounded" />
                      
                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity controls block */}
                        <Skeleton className="h-10 w-28 rounded-lg" />
                        {/* Remove button block */}
                        <Skeleton className="h-5 w-20 rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Column: Checkout Sidebar Skeleton */}
            <aside className="col-span-12 lg:col-span-4 space-y-8">
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <Skeleton className="h-6 w-32 rounded-md" />
                </div>
                <CardContent className="p-6 space-y-4">
                  {/* Summary lines */}
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  
                  <Separator className="my-4 border-dashed" />
                  
                  {/* Total section */}
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>

                  {/* Checkout Button block */}
                  <div className="w-full h-14 rounded-xl bg-muted flex items-center justify-center gap-2 mt-4">
                    <Skeleton className="h-5 w-40 rounded" />
                    <ArrowRight size={20} className="text-muted-foreground/30" />
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </CardContent>
              </Card>

              {/* Tip Card Skeleton */}
              <div className="relative overflow-hidden rounded-xl bg-muted p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/10">
                    <Lightbulb size={16} className="text-muted-foreground/30" />
                  </div>
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-1/2 mb-2 rounded-md" />
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
                <Skeleton className="h-9 w-40 rounded-md" />
              </div>

              {/* Trust Badges Skeletons */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                  <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                  <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Mobile Bottom Nav Placeholder */}
        <div className="fixed bottom-0 left-0 flex h-16 w-full items-center justify-around border-t bg-background px-4 lg:hidden z-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className={`rounded-full ${i === 3 ? "h-12 w-12 -translate-y-4" : "h-6 w-6"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}