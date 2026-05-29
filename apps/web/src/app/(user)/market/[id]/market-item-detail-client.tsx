"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { MarketTrendsChart } from "@/components/market/market-trends-chart";

import { MarketSentimentCard } from "@/components/market/market-sentiment-card";
import { VendorComparisonTable } from "@/components/market/vendor-comparison-table";
import { SourcingMap } from "@/components/market/sourcing-map";
import { MarketIntelligenceList } from "@/components/market/market-intelligence-list";
import type { MarketItem } from "@/types/api/vendor";
import type {
  ForecastPoint,
  InflationResponse,
  PriceAverageRow,
  TrendPoint,
  VendorPriceRow,
} from "@/types/api/market";

type MarketItemDetailClientProps = {
  averages: PriceAverageRow[];
  chartForecasts: ForecastPoint[];
  chartInflation: InflationResponse | null;
  chartTrends: TrendPoint[];
  error: string | null;
  item: MarketItem | null;
  items: MarketItem[];
  vendors: VendorPriceRow[];
};

export function MarketItemDetailClient({
  averages,
  chartForecasts,
  chartInflation,
  chartTrends,
  error,
  item,
  items,
  vendors,
}: MarketItemDetailClientProps) {
  const router = useRouter();

  const nationalAvg = useMemo(() => {
    if (averages.length === 0) return null;
    return averages.reduce((acc, curr) => acc + parseFloat(curr.average_price), 0) / averages.length;
  }, [averages]);

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertCircle className="size-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Item Not Found</h1>
        <p className="text-slate-600 mt-2 max-w-md mx-auto">{error ?? "The item you are looking for does not exist in our database."}</p>
        <Button variant="outline" className="mt-8" onClick={() => router.push("/market")}>
          Back to Market Dashboard
        </Button>
      </div>
    );
  }

  const dynamicRegion = useMemo(() => {
    if (vendors.length === 0) return "Ada'a, Bishoftu, Ethiopia";
    const cities = Array.from(new Set(vendors.map(v => v.city).filter(Boolean)));
    if (cities.length === 0) return "Ada'a, Bishoftu, Ethiopia";
    return `${cities.join(", ")}, Ethiopia`;
  }, [vendors]);

  const productDetailsRegion = useMemo(() => {
    if (vendors.length === 0) return "Ada'a / Bishoftu";
    const cities = Array.from(new Set(vendors.map(v => v.city).filter(Boolean)));
    if (cities.length === 0) return "Ada'a / Bishoftu";
    return cities.join(" / ");
  }, [vendors]);

  // Mock data for the premium UI
  const productDetails = [
    { label: "Grade", value: "Magna (Premium)" },
    { label: "Unit", value: item.unit },
    { label: "Region", value: productDetailsRegion },
    { label: "Shelf Life", value: "18 - 24 Months" },
  ];

  const sourcingId = `ETH-${item.category.substring(0,3).toUpperCase()}-${String(item.id).padStart(4, '0')}`;

  return (
    <div className="pb-20 max-w-[1600px] mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs font-bold text-[#616f89] uppercase tracking-widest mb-2">
          <Link href="/market" className="hover:text-[#135bec] transition-colors">Market</Link>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-slate-300">{item.category}</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-[#135bec]">{item.name}</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#111318] dark:text-white tracking-tight">
              {item.name} 
              {/* — <span className="text-slate-400">Magna Grade</span> */}
            </h1>
            <p className="text-[#616f89] font-bold text-xs mt-2 uppercase tracking-widest">
              Ethical Sourcing ID: <span className="text-[#111318] dark:text-white">{sourcingId}</span>
            </p>
            {item.description && (
              <p className="text-[#616f89] dark:text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold text-xs h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <RefreshCw className="size-3.5 mr-2" /> Export Analysis
            </Button>
            <Button asChild className="rounded-xl bg-[#135bec] hover:bg-[#0d4fd4] font-black text-xs h-11 shadow-lg shadow-blue-500/20 px-6">
              <Link href={`/shop/vendors?q=${encodeURIComponent(item.name)}`}>
                <Plus className="size-4 mr-2" /> Source Batch
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Forecast & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Chart Column */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1e2330] rounded-3xl  flex flex-col">
          
            <MarketTrendsChart
              forecasts={chartForecasts}
              inflation={chartInflation}
              initialCity="Addis Ababa"
              initialItemId={item.id}
              initialRange="6M"
              items={items}
              trends={chartTrends}
            />
         
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <MarketSentimentCard 
            sentiment={
              chartInflation?.change_percent !== null && chartInflation?.change_percent !== undefined
                ? chartInflation.change_percent > 10
                  ? "High Volatility"
                  : chartInflation.change_percent > 1
                  ? "Rising"
                  : chartInflation.change_percent < -1
                  ? "Falling"
                  : "Stable"
                : "Stable"
            }
            predictionText={
              chartInflation?.change_percent !== null && chartInflation?.change_percent !== undefined
                ? `Prices are expected to ${
                    chartInflation.change_percent > 0 ? "rise" : chartInflation.change_percent < 0 ? "fall or stabilize" : "stabilize"
                  } by ${Math.abs(chartInflation.change_percent).toFixed(1)}% compared to the previous period, based on current local submissions.`
                : "Prices are expected to stabilize over the next period, based on seasonal shifts and local harvest reports."
            }
            inflationRate={chartInflation?.change_percent ?? null}
            period={chartInflation?.period}
          />

          <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm flex-1">
            <h4 className="text-sm font-black text-[#111318] dark:text-white uppercase tracking-widest mb-6">Product Details</h4>
            <div className="space-y-4">
              {productDetails.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between py-1">
                  <span className="text-xs font-bold text-[#616f89] uppercase tracking-tighter">{detail.label}</span>
                  <span className="text-sm font-black text-[#111318] dark:text-white">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Comparison Section */}
      <div className="mb-8">
        <VendorComparisonTable vendors={vendors} />
      </div>

      {/* Bottom Grid: Sourcing & Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourcingMap location={dynamicRegion} />
        <MarketIntelligenceList item={item} vendors={vendors} trends={chartTrends} forecasts={chartForecasts} />
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string; value: string; subValue: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm hover:border-[#135bec]/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-[#616f89] dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-[#111318] dark:text-white mt-1 tabular-nums">{value}</p>
      <p className="text-[10px] font-bold text-[#616f89] mt-1">{subValue}</p>
    </div>
  );
}

function MarketItemDetailSkeleton() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-48 md:h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-8 h-80 rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-80 rounded-2xl" />
      </div>
    </div>
  );
}
