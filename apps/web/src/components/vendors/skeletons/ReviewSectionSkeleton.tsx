import React from "react";

export default function ReviewSectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Overall stats placeholder */}
      <div className="bg-card border rounded-2xl p-6 h-[170px]" />
      
      {/* 3 Review Cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-xl p-4 bg-card space-y-3">
          <div className="flex items-center gap-2">
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-muted" />
            {/* Name */}
            <div className="h-4 bg-muted rounded w-28" />
            {/* Rating */}
            <div className="h-3 bg-muted rounded w-16 ml-auto" />
          </div>
          {/* Comment lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 bg-muted rounded w-full" />
            <div className="h-3.5 bg-muted rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
