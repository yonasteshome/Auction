"use client";

import { useEffect, useMemo, useState } from "react";
import type { ItemAveragesResponse } from "@/types/api/price-submissions";

export type OutlierCheckResult = {
  isOutlier: boolean;
  percentDiff: number;
  referenceAverage: number;
  referenceLabel: string;
  message: string;
};

function pickReferenceAverage(
  averages: ItemAveragesResponse,
): { value: number; label: string } | null {
  if (averages.location_average) {
    return {
      value: parseFloat(averages.location_average),
      label: "location average",
    };
  }
  if (averages.city_average) {
    return { value: parseFloat(averages.city_average), label: "city average" };
  }
  if (averages.national_average) {
    return {
      value: parseFloat(averages.national_average),
      label: "national average",
    };
  }
  return null;
}

export function useOutlierCheck(
  price: string,
  averages: ItemAveragesResponse | null,
): OutlierCheckResult | null {
  const [debouncedPrice, setDebouncedPrice] = useState(price);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(price), 400);
    return () => clearTimeout(t);
  }, [price]);

  return useMemo(() => {
    const num = parseFloat(debouncedPrice);
    if (!averages || !debouncedPrice || Number.isNaN(num) || num <= 0) {
      return null;
    }
    const ref = pickReferenceAverage(averages);
    if (!ref || ref.value <= 0) return null;

    const ratio = num / ref.value;
    const percentDiff = Math.round(Math.abs(ratio - 1) * 100);
    const isOutlier = ratio > 2 || ratio < 0.5;

    if (!isOutlier) return null;

    const direction = num > ref.value ? "above" : "below";
    return {
      isOutlier: true,
      percentDiff,
      referenceAverage: ref.value,
      referenceLabel: ref.label,
      message: `Your price (${num.toLocaleString()} ETB) is ${percentDiff}% ${direction} the ${ref.label} (${ref.value.toLocaleString()} ETB).`,
    };
  }, [debouncedPrice, averages]);
}
