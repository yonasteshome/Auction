import React from "react";
import Link from "next/link";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import { getSimilarVendors } from "@/lib/vendor-details";
import { Button } from "@repo/ui/components/button";

interface SimilarVendorsProps {
  vendorId: string;
  region: string;
}

export default async function SimilarVendors({
  vendorId,
  region,
}: SimilarVendorsProps) {
  let similarVendors = [];

  try {
    similarVendors = await getSimilarVendors(vendorId, region, 6);
  } catch (error) {
    console.error("Failed to fetch similar vendors:", error);
    return null; // Silent failure, don't break the page
  }

  if (similarVendors.length === 0) {
    return null; // Hide the section completely if empty
  }

  return (
    <section className="space-y-6 pt-6 border-t" aria-label="Similar vendors in your region">
      <div>
        <h3 className="text-2xl font-extrabold text-foreground">
          Other vendors in {region}
        </h3>
        <p className="text-sm text-muted-foreground">
          Discover more verified local shops near you
        </p>
      </div>

      {/* Grid wrapper: Horizontal scrolling on mobile, grid on larger screens */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0">
        {similarVendors.map((vendor: any) => (
          <Link
            href={`/vendors/${vendor.id}`}
            key={vendor.id}
            className="flex flex-col justify-between shrink-0 w-[280px] snap-start border rounded-2xl p-5 bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 block md:w-auto"
          >
            <div className="space-y-4">
              {/* Profile image & Details */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted border overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg text-muted-foreground/60 select-none">
                  {vendor.imageUrl ? (
                    <img
                      src={vendor.imageUrl}
                      alt={vendor.shopName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    vendor.shopName.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-sm truncate flex items-center gap-1.5">
                    {vendor.shopName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="font-semibold text-foreground">{vendor.rating.toFixed(1)}</span>
                    <span>({vendor.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Stats & location */}
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-2.5 rounded-xl text-xs font-semibold text-muted-foreground border border-border/40">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/80">Products</p>
                  <p className="text-sm font-extrabold text-foreground">{vendor.itemsListed}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/80">Competitiveness</p>
                  <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    {vendor.competitivenessScore}/100
                  </p>
                </div>
              </div>

              {/* Location info */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                <span className="truncate">{vendor.location}</span>
              </div>
            </div>

            {/* View Shop Button */}
            <div className="pt-4 border-t mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold rounded-xl py-2 cursor-pointer"
              >
                View Shop
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
