import { cn } from "@/lib/utils";

interface VolatilityBadgeProps {
  volatility: "high" | "medium" | "low";
  className?: string;
}

export function VolatilityBadge({ volatility, className }: VolatilityBadgeProps) {
  const config = {
    high: {
      label: "High Volatility",
      classes: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900",
    },
    medium: {
      label: "Medium Volatility",
      classes: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    },
    low: {
      label: "Low Volatility",
      classes: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    },
  };

  const { label, classes } = config[volatility];

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border", classes, className)}>
      {label}
    </span>
  );
}
