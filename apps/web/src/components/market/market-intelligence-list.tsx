"use client";

import { useMemo } from "react";
import { Sun, Truck, Droplets, Info } from "lucide-react";
import type { MarketItem } from "@/types/api/vendor";
import type { ForecastPoint, TrendPoint, VendorPriceRow } from "@/types/api/market";

interface MarketIntelligenceListProps {
  item: MarketItem;
  vendors: VendorPriceRow[];
  trends: TrendPoint[];
  forecasts: ForecastPoint[];
}

interface IntelligenceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: "weather" | "logistics" | "supply" | "info";
  time: string;
}

export function MarketIntelligenceList({ item, vendors, trends, forecasts }: MarketIntelligenceListProps) {
  const insights = useMemo<IntelligenceItem[]>(() => {
    const list: IntelligenceItem[] = [];

    // 1. Cheapest vendor insight
    if (vendors.length > 0) {
      const lowestPriceVendor = vendors.reduce((min, v) => parseFloat(v.price) < parseFloat(min.price) ? v : min, vendors[0]);
      list.push({
        id: "cheapest-vendor",
        title: `Lowest verified market price found at ${lowestPriceVendor.vendor_name} for ${parseFloat(lowestPriceVendor.price).toLocaleString()} ETB in ${lowestPriceVendor.city}.`,
        subtitle: "BEST DEAL",
        icon: "logistics",
        time: "REAL-TIME"
      });
    }

    // 2. Forecast insight
    if (forecasts.length > 0) {
      const nextForecast = forecasts[0];
      const currentPrice = trends.length > 0 ? parseFloat(trends[trends.length - 1].average_price) : null;
      const predictedPrice = parseFloat(nextForecast.predicted_price);
      
      let changeText = "stabilize";
      if (currentPrice) {
        const diff = ((predictedPrice - currentPrice) / currentPrice) * 100;
        if (diff > 1) {
          changeText = `increase by ${diff.toFixed(1)}%`;
        } else if (diff < -1) {
          changeText = `decrease by ${Math.abs(diff).toFixed(1)}%`;
        }
      }
      
      list.push({
        id: "ml-forecast",
        title: `ML forecast projects price to ${changeText} over the next weeks, landing around ${predictedPrice.toLocaleString()} ETB (${nextForecast.model_used.toUpperCase()}).`,
        subtitle: "ML FORECAST",
        icon: "weather",
        time: "PROJECTION"
      });
    }

    // 3. Vendor availability insight
    if (vendors.length > 0) {
      const verifiedCount = vendors.filter(v => v.is_verified).length;
      list.push({
        id: "supply-status",
        title: `Supply availability check: ${verifiedCount} out of ${vendors.length} active vendors offering ${item.name} are fully verified.`,
        subtitle: "SUPPLY CHAIN",
        icon: "supply",
        time: "VERIFIED"
      });
    } else {
      list.push({
        id: "supply-status-empty",
        title: `No direct vendor listings currently found. All average prices are calculated from verified crowdsourced submissions.`,
        subtitle: "SUPPLY STATUS",
        icon: "info",
        time: "NOTICE"
      });
    }

    return list;
  }, [item.name, vendors, forecasts, trends]);

  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm h-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#111318] dark:text-white">Market Intelligence</h3>
        <p className="text-sm text-[#616f89] mt-1">Latest updates impacting supply & pricing</p>
      </div>

      <div className="space-y-6">
        {insights.map((insight) => (
          <div key={insight.id} className="flex gap-4 group">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
              insight.icon === 'weather' ? 'bg-blue-50 border-blue-100 text-blue-500' :
              insight.icon === 'logistics' ? 'bg-orange-50 border-orange-100 text-orange-500' :
              insight.icon === 'supply' ? 'bg-green-50 border-green-100 text-green-500' :
              'bg-slate-50 border-slate-100 text-slate-500'
            }`}>
              {insight.icon === 'weather' && <Sun className="size-6" />}
              {insight.icon === 'logistics' && <Truck className="size-6" />}
              {insight.icon === 'supply' && <Droplets className="size-6" />}
              {insight.icon === 'info' && <Info className="size-6" />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#111318] dark:text-white leading-tight">
                {insight.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-black text-[#616f89] uppercase tracking-widest">{insight.time}</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{insight.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
