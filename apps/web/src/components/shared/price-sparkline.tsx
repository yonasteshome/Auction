"use client";

import { useEffect, useState } from "react";

interface PriceSparklineProps {
  data: number[];
  color?: "red" | "green" | "gray";
  width?: number;
  height?: number;
  className?: string;
}

export function PriceSparkline({ 
  data, 
  color = "gray", 
  width = 60, 
  height = 20, 
  className 
}: PriceSparklineProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data || data.length === 0) {
    return <div style={{ width, height }} className={className} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const colorMap = {
    red: "stroke-red-500",
    green: "stroke-green-500",
    gray: "stroke-gray-400",
  };

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={colorMap[color]}
        points={points}
      />
    </svg>
  );
}
