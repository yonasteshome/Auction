"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { Check, Plus, Loader2 } from "lucide-react";
import { addToCart } from "@/actions/ecommerce";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PriceAlertDialog from "./PriceAlertDialog";

interface ProductCardProps {
  product: any; // VendorProductResponse shape
  vendorDetail: any; // VendorDetailResponse shape
  isAuthenticated: boolean;
  city?: string;
  isAlreadyInList?: boolean;
}

export default function ProductCard({
  product,
  vendorDetail,
  isAuthenticated,
  city,
  isAlreadyInList = false,
}: ProductCardProps) {
  const [inList, setInList] = useState(isAlreadyInList);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to add items to your shopping list", {
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/vendors/${vendorDetail.id}`),
        },
      });
      return;
    }

    startTransition(async () => {
      try {
        await addToCart({
          listing_id: Number(product.id),
          vendor_id: product.vendorId ?? vendorDetail.id,
          vendor_name: product.vendorName ?? vendorDetail.shopName,
          item_name: product.itemName,
          unit_price: Number(product.price),
          unit: product.unit,
          quantity: 1,
        });

        setInList(true);
        toast.success(`${product.itemName} added to your cart!`, {
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to add to cart");
      }
    });
  };

  const vendorParams = new URLSearchParams({
    vendorId: product.vendorId ?? vendorDetail.id,
    listingId: product.id,
    vendorPrice: String(product.price),
    vendorName: product.vendorName ?? vendorDetail.shopName,
    vendorLocation: vendorDetail.location,
    vendorRegion: vendorDetail.region,
    vendorRating: String(vendorDetail.rating),
    vendorVerified: String(vendorDetail.verifiedStatus === "Verified"),
    stockQty: String(product.stockQuantity),
    stockStatus: product.stockStatus,
  });
  if (vendorDetail.imageUrl) {
    vendorParams.set("vendorImageUrl", vendorDetail.imageUrl);
  }
  const productUrl = `/products/${product.itemId}?${vendorParams.toString()}`;

  return (
    <div className="border rounded-2xl p-4 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block group flex flex-col justify-between ">
      {/* Upper clickable part */}
      <Link href={productUrl} className="block space-y-3 flex-1">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-xl relative overflow-hidden flex items-center justify-center h-40 w-full shrink-0 shadow-sm border border-border/40">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.itemName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-3xl font-extrabold text-muted-foreground/30 select-none">
              {product.itemName.charAt(0)}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <p className="font-bold text-foreground text-sm group-hover:text-blue-600 transition-colors truncate">
            {product.itemName}
          </p>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {product.category}
          </p>
        </div>
      </Link>

      {/* Footer controls & action panel */}
      <div className="mt-4 pt-3 border-t space-y-3">
        {/* Price & Stock info */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              {product.price.toFixed(2)} ETB
            </p>
            <p className="text-[10px] text-muted-foreground font-bold">
              per {product.unit}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              product.stockStatus === "InStock"
                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                : product.stockStatus === "LowStock"
                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
            }`}
          >
            {product.stockStatus === "InStock"
              ? "✓ In Stock"
              : product.stockStatus === "LowStock"
              ? "⚠ Low Stock"
              : "✗ Out of Stock"}
          </span>
        </div>
       
      </div>
    </div>
  );
}
