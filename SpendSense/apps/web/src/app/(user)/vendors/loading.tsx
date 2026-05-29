import { VendorGridSkeleton } from "@/components/vendors/vendor-grid-skeleton";
import { TrendingDown, Users, Activity } from "lucide-react";

export default function VendorsLoading() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl animate-pulse">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-64 bg-muted rounded-md"></div>
          <div className="h-6 w-96 bg-muted rounded-md bg-opacity-60"></div>
        </div>
        <div className="h-8 w-60 bg-muted rounded-full"></div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-xl p-5 bg-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded-full"></div>
            </div>
            <div className="h-8 w-16 bg-muted rounded mt-1"></div>
            <div className="h-4 w-32 bg-muted rounded opacity-60"></div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="h-14 w-full bg-muted rounded-xl"></div>
        <VendorGridSkeleton />
      </section>
    </div>
  );
}
