"use client";

import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";

const RANGES = ["1W", "1M", "3M", "6M", "1Y", "ALL"] as const;

export function ChartTimeRange() {
  const [timeRange, setTimeRange] = useQueryState("timeRange", {
    defaultValue: "6M",
    shallow: false,
  });

  return (
    <div className="flex bg-muted/50 p-1 rounded-lg w-max border">
      {RANGES.map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            timeRange === range
              ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {range}
        </button>
      ))}
    </div>
  );
}