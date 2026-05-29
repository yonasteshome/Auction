import React from "react";

export default function StatsSkeleton() {
  return (
    <div className="border rounded-2xl p-6 bg-card space-y-4 animate-pulse">
      <div className="h-5 bg-muted rounded w-1/3 border-b pb-2" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-6 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
