import { TrendingUp, TrendingDown, Minus, Target, BadgeDollarSign, MapPin } from "lucide-react";
import { type ProductDetailResponse } from "@/types/api/product-details";

interface PriceStatCardsProps {
  product: ProductDetailResponse;
}

export function PriceStatCards({ product }: PriceStatCardsProps) {
  const { currentAveragePrice, lowestPrice, highestPrice, priceTrend, priceTrendDirection, nationalAveragePrice } = product;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Average Price */}
      <div className="bg-white dark:bg-[#1e2330] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#135bec] dark:text-blue-400">
            <BadgeDollarSign size={20} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
            priceTrendDirection === "up" ? "bg-red-50 text-red-600 dark:bg-red-900/20" : 
            priceTrendDirection === "down" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : 
            "bg-slate-100 text-slate-600 dark:bg-slate-800"
          }`}>
            {priceTrendDirection === "up" ? <TrendingUp size={12} /> : 
             priceTrendDirection === "down" ? <TrendingDown size={12} /> : 
             <Minus size={12} />}
            {Math.abs(priceTrend)}%
          </div>
        </div>
        <p className="text-[#616f89] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Average</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-[#111318] dark:text-white tabular-nums">{currentAveragePrice.toFixed(2)}</span>
          <span className="text-sm font-bold text-[#616f89]">ETB</span>
        </div>
      </div>

      {/* Lowest Price */}
      <div className="bg-white dark:bg-[#1e2330] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
            <TrendingDown size={20} />
          </div>
        </div>
        <p className="text-[#616f89] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Lowest Found</p>
        {lowestPrice ? (
          <>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-black text-[#111318] dark:text-white tabular-nums">{lowestPrice.price.toFixed(2)}</span>
              <span className="text-sm font-bold text-[#616f89]">ETB</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#616f89] font-medium">
              <MapPin size={10} />
              <span className="truncate">{lowestPrice.vendorName}, {lowestPrice.location}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
      </div>

      {/* Highest Price */}
      <div className="bg-white dark:bg-[#1e2330] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <TrendingUp size={20} />
          </div>
        </div>
        <p className="text-[#616f89] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Highest Found</p>
        {highestPrice ? (
          <>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-black text-[#111318] dark:text-white tabular-nums">{highestPrice.price.toFixed(2)}</span>
              <span className="text-sm font-bold text-[#616f89]">ETB</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#616f89] font-medium">
              <MapPin size={10} />
              <span className="truncate">{highestPrice.vendorName}, {highestPrice.location}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
      </div>

      {/* National Average */}
      <div className="bg-white dark:bg-[#1e2330] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Target size={100} />
        </div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
            <Target size={20} />
          </div>
        </div>
        <p className="text-[#616f89] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">National Average</p>
        <div className="flex items-baseline gap-1 mb-2 relative z-10">
          <span className="text-2xl font-black text-[#111318] dark:text-white tabular-nums">
            {nationalAveragePrice > 0 ? nationalAveragePrice.toFixed(2) : "N/A"}
          </span>
          {nationalAveragePrice > 0 && <span className="text-sm font-bold text-[#616f89]">ETB</span>}
        </div>
        <p className="text-[10px] text-[#616f89] font-medium relative z-10">Across all markets</p>
      </div>
    </div>
  );
}
