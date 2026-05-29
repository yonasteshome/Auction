import React from "react";
import ProductGridSkeleton from "@/components/vendors/skeletons/ProductGridSkeleton";
import StatsSkeleton from "@/components/vendors/skeletons/StatsSkeleton";

export default function VendorDetailsLoading() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-10 max-w-7xl">
      {/* Hero Section Skeleton */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm animate-pulse">
        {/* Cover banner */}
        <div className="h-48 bg-muted w-full" />
        
        {/* Profile Details area */}
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 relative -top-16 mb-[-3rem]">
            {/* Avatar Circle */}
            <div className="w-32 h-32 rounded-full border-4 border-card bg-muted shrink-0 shadow-md" />
            
            {/* Meta details */}
            <div className="flex-1 pt-18 sm:pt-20 space-y-3">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-36" />
                <div className="h-4 bg-muted rounded w-28" />
              </div>
              <div className="h-5 bg-muted rounded w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Products */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded-lg w-full" />
            <ProductGridSkeleton count={6} />
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* About placeholder */}
          <div className="border rounded-2xl p-6 bg-card space-y-4 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 border-b pb-2" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/5" />
            </div>
          </div>

          {/* Stats placeholder */}
          <StatsSkeleton />

          {/* Map Location placeholder */}
          <div className="border rounded-2xl h-64 bg-card animate-pulse" />
        </div>
      </div>
    </div>
  );
}
