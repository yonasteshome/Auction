"use client";

import Link from "next/link";
import React from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

import type { VendorPriceListing } from "@/types/api/product-listing";

type ProductCardProps = {
  listing: VendorPriceListing;
};

export function ProductCard({ listing }: ProductCardProps) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  let realImageUrl = listing.image_url || "";
  if (realImageUrl && !realImageUrl.startsWith("http")) {
    if (realImageUrl.startsWith("/media/")) {
      realImageUrl = `${API_BASE}${realImageUrl}`;
    } else if (realImageUrl.startsWith("media/")) {
      realImageUrl = `${API_BASE}/${realImageUrl}`;
    } else if (realImageUrl.startsWith("/")) {
      realImageUrl = `${API_BASE}${realImageUrl}`;
    } else {
      realImageUrl = `${API_BASE}/media/${realImageUrl}`;
    }
  }
  const image = realImageUrl || "/images/placeholder-food.png";
  const price = typeof listing.price === "string" ? parseFloat(listing.price) : listing.price;
  const basePrice = listing.base_price ? (typeof listing.base_price === "string" ? parseFloat(String(listing.base_price)) : listing.base_price) : null;

  return (
    <Card className="rounded-2xl hover:shadow-lg transition-all group overflow-hidden">
      <div className="h-44 bg-slate-100 dark:bg-slate-800 relative">
        <img src={image} alt={listing.item_name} className="object-cover w-full h-full" />
        {listing.is_verified && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold">Verified</div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold line-clamp-2">{listing.item_name}</h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{listing.variant || listing.description}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold">ETB {Number(price).toFixed(2)}</div>
            {basePrice && basePrice !== price && (
              <div className="text-xs text-muted-foreground line-through">ETB {Number(basePrice).toFixed(2)}</div>
            )}
            <div className="text-xs text-muted-foreground">/{listing.unit || 'unit'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">
            <div>{listing.vendor_name}</div>
            <div className="text-[11px]">{listing.city || '—'}</div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/products/${listing.item}?vendorId=${listing.vendor_id ?? ''}&listingId=${listing.id}`} className="">
              <Button variant="outline" className="rounded-xl">View Details</Button>
            </Link>
            <Button className="rounded-xl bg-primary text-white">Add to Cart</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
