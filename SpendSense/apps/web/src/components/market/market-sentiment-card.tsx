"use client";

import { TrendingUp, Activity } from "lucide-react";

interface MarketSentimentCardProps {
  sentiment: "High Volatility" | "Stable" | "Rising" | "Falling";
  predictionText: string;
  inflationRate: number | null;
  period?: string;
}

export function MarketSentimentCard({ sentiment, predictionText, inflationRate, period = "month" }: MarketSentimentCardProps) {
  return (
    <div className="bg-[#135bec] rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 flex flex-col h-full">
      <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Market Sentiment</p>
      <h3 className="text-xl font-black mb-4">{sentiment}</h3>
      
      <p className="text-blue-100 text-sm leading-relaxed mb-8 flex-1">
        {predictionText}
      </p>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/10 flex items-center justify-center">
          <Activity className="size-5" />
        </div>
        <div>
          <p className="text-xl font-black">
            {inflationRate !== null && inflationRate !== undefined ? `${inflationRate > 0 ? "+" : ""}${inflationRate.toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">vs Last {period === "week" ? "Week" : "Month"}</p>
        </div>
      </div>
    </div>
  );
}
