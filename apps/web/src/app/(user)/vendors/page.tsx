import { VendorFilters } from "@/components/vendors/vendor-filters";
import { VendorGrid } from "@/components/vendors/vendor-grid";
import { getVendors } from "@/lib/vendors";
import { Button } from "@repo/ui/components/button";
import { Map } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Marketplace Vendors | MarketSight",
  description: "Discover verified sellers in the Ethiopian market.",
};

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const data = await getVendors(resolvedParams);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Marketplace Vendors</h1>
          <p className="text-muted-foreground text-lg">
            Discover verified sellers offering the best value in your area.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="bg-card hover:bg-slate-50 dark:hover:bg-slate-900 gap-1.5 rounded-xl border font-semibold shadow-sm shrink-0">
            <Link href="/vendors/map">
              <Map className="w-4 h-4 text-blue-600 shrink-0" />
              Map View
            </Link>
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE FEED ACTIVE • Updated 2M AGO
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      {/* <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-5 bg-card flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-medium">Total Vendors</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">142</span>
            <span className="flex items-center text-sm text-green-600 font-medium mb-1">
              <TrendingDown className="h-3 w-3 mr-1 rotate-180" /> +12%
            </span>
          </div>
        </div>
        <div className="border rounded-xl p-5 bg-card flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-medium">Best Value Weekly</span>
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold truncate">Abebe Grains</span>
            <span className="text-sm text-muted-foreground truncate">Merkato, Addis Ababa</span>
          </div>
        </div>
        <div className="border rounded-xl p-5 bg-card flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-medium">Most Active Region</span>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold truncate">Shola Market</span>
            <span className="text-sm text-muted-foreground truncate">Addis Ababa</span>
          </div>
        </div>
      </section> */}

      {/* Grid wrapper */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border rounded-xl p-4 sticky top-4 z-10 shadow-sm">
          <VendorFilters />
        </div>
        
        <VendorGrid data={data} />
      </section>
    </div>
  );
}

