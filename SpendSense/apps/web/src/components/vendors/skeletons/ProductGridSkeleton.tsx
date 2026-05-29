import React from "react";

interface ProductGridSkeletonProps {
  count?: number;
}

export default function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-2xl p-4 bg-card h-[360px] flex flex-col justify-between animate-pulse">
          <div className="space-y-3 flex-1">
            {/* Image Placeholder */}
            <div className="aspect-square bg-muted rounded-xl h-40 w-full" />
            
            {/* Title Line */}
            <div className="h-4 bg-muted rounded w-2/3" />
            
            {/* Category Line */}
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
          
          <div className="mt-4 pt-3 border-t space-y-3">
            {/* Price Line */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-5 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-12" />
              </div>
              <div className="h-5 bg-muted rounded-full w-16" />
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-1 w-full">
              <div className="h-9 bg-muted rounded-xl flex-1" />
              <div className="h-9 bg-muted rounded-lg w-9" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
