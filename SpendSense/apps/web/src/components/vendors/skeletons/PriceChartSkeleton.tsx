import React from "react";

export default function PriceChartSkeleton() {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm h-[300px] flex flex-col justify-between animate-pulse">
      {/* Title & Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-6 bg-muted rounded-full w-36" />
      </div>
      
      {/* Chart Block */}
      <div className="h-[180px] bg-muted rounded-xl w-full" />
    </div>
  );
}
