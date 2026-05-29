import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTrendBadgeProps {
  trend: number;
  className?: string;
  showText?: boolean;
}

export function PriceTrendBadge({ trend, className, showText = true }: PriceTrendBadgeProps) {
  const isUp = trend > 0;
  const isDown = trend < 0;
  const isStable = trend === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        isUp && "text-red-600 dark:text-red-400",
        isDown && "text-green-600 dark:text-green-400",
        isStable && "text-gray-500 dark:text-gray-400",
        className
      )}
    >
      {isUp && <ArrowUp className="w-3 h-3" />}
      {isDown && <ArrowDown className="w-3 h-3" />}
      {isStable && <Minus className="w-3 h-3" />}
      {showText && <span>{isStable ? "Stable" : `${isUp ? "+" : ""}${trend.toFixed(1)}%`}</span>}
    </span>
  );
}
