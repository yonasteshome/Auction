"use client";

import React from "react";
import { Star } from "lucide-react";
import { Progress } from "@repo/ui/components/progress";

interface RatingDistributionProps {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>; // keys "1"-"5"
}

export default function RatingDistribution({
  averageRating,
  totalReviews,
  distribution,
}: RatingDistributionProps) {
  const ratings = ["5", "4", "3", "2", "1"];

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Side: Big Average Rating */}
        <div className="text-center md:border-r md:pr-6 flex flex-col items-center justify-center">
          <p className="text-5xl font-extrabold text-foreground" role="img" aria-label={`Average rating ${averageRating}`}>
            {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
          </p>
          <div className="flex text-amber-500 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating)
                    ? "fill-current text-amber-500"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalReviews > 0 ? `Based on ${totalReviews} reviews` : "No reviews yet"}
          </p>
        </div>

        {/* Right Side: Horizontal Bars */}
        <div className="col-span-2 space-y-2.5">
          {ratings.map((star) => {
            const count = distribution[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            // Color logic based on star level
            const barColorClass = 
              star === "5" || star === "4" 
                ? "[&>[data-slot=progress-indicator]]:bg-amber-500" 
                : star === "3" 
                ? "[&>[data-slot=progress-indicator]]:bg-amber-400" 
                : "[&>[data-slot=progress-indicator]]:bg-muted-foreground/60";

            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-3 font-semibold text-right text-muted-foreground">{star}</span>
                <Star className="w-3.5 h-3.5 fill-current text-amber-500 shrink-0" />
                <div className="flex-1">
                  <Progress
                    value={percentage}
                    className={`h-2 bg-muted rounded-full overflow-hidden ${barColorClass}`}
                    aria-label={`${star} star reviews: ${count} out of ${totalReviews}`}
                  />
                </div>
                <span className="w-8 text-right font-medium text-muted-foreground text-xs">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
