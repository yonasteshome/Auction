"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Store, CheckCircle, Star, Package, AlertTriangle, Plus, Minus, Loader2, MapPin } from "lucide-react";
import { addToCart } from "@/actions/ecommerce";
import { toast } from "sonner";
import Link from "next/link";

export interface VendorOfferContext {
  listingId: number;
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  vendorRegion: string;
  vendorRating: number;
  vendorVerified: boolean;
  vendorImageUrl: string | null;
  price: number;
  unit: string;
  variant: string;
  description: string;
  itemName: string;
  basePrice: number;
  stockQuantity: number;
  stockStatus: "InStock" | "LowStock" | "OutOfStock";
}

interface VendorOfferPanelProps {
  offer: VendorOfferContext;
  vendorId: string;
}

const stockConfig = {
  InStock: {
    label: "In Stock",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800/40",
    text: "text-green-700 dark:text-green-400",
    icon: <Package className="w-3.5 h-3.5" />,
  },
  LowStock: {
    label: "Low Stock",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/40",
    text: "text-amber-700 dark:text-amber-400",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  OutOfStock: {
    label: "Out of Stock",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800/40",
    text: "text-red-700 dark:text-red-400",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
};

export function VendorOfferPanel({ offer, vendorId }: VendorOfferPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const stock = stockConfig[offer.stockStatus];
  const isOutOfStock = offer.stockStatus === "OutOfStock";
  const maxQty = Math.min(offer.stockQuantity, 99);

  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        await addToCart({
          listing_id: offer.listingId,
          vendor_id: offer.vendorId,
          vendor_name: offer.vendorName,
          item_name: offer.itemName,
          unit: offer.unit,
          quantity,
          unit_price: offer.price,
        });
        toast.success(`Added ${quantity} × ${offer.itemName} to cart`, {
          description: `From ${offer.vendorName} · ETB ${(offer.price * quantity).toFixed(2)}`,
          action: {
            label: "View Cart",
            onClick: () => { window.location.href = "/cart"; },
          },
        });
      } catch {
        toast.error("Failed to add to cart", {
          description: "Please try again.",
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 overflow-hidden shadow-sm mb-8">
      {/* Header */}
      <div className="px-5 py-4 border-b border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white rounded-lg p-1.5">
            <Store className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Viewing from Vendor
          </span>
        </div>
        <Link
          href={`/vendors/${vendorId}`}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          ← Back to vendor
        </Link>
      </div>

      <div className="p-5 space-y-5">
        {/* Vendor Info Row */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1e2330] border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg shadow-sm shrink-0">
            {offer.vendorImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offer.vendorImageUrl} alt={offer.vendorName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              offer.vendorName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-foreground truncate">{offer.vendorName}</span>
              {offer.vendorVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {offer.vendorLocation}, {offer.vendorRegion}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {offer.vendorRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Price Block */}
        <div className="bg-white dark:bg-[#1e2330] rounded-xl p-4 border border-blue-100 dark:border-blue-900/40 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1 font-medium">This vendor&apos;s price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {offer.price.toFixed(2)}
            </span>
            <span className="text-base text-muted-foreground font-medium">ETB / {offer.unit}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total for {quantity}: <span className="font-semibold text-foreground">ETB {(offer.price * quantity).toFixed(2)}</span>
          </p>
        </div>

        {/* Stock Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${stock.bg} ${stock.border} ${stock.text}`}>
          {stock.icon}
          {stock.label}
          {offer.stockQuantity > 0 && (
            <span className="opacity-70 font-normal ml-1">· {offer.stockQuantity} units available</span>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Quantity</span>
          <div className="flex items-center bg-white dark:bg-[#1e2330] border border-blue-100 dark:border-blue-900/40 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isPending}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 font-bold text-sm min-w-[3rem] text-center">
              {quantity.toString().padStart(2, "0")}
            </span>
            <button
              onClick={() => setQuantity(q => Math.min(maxQty || 99, q + 1))}
              disabled={quantity >= (maxQty || 99) || isPending}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isPending}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding to Cart…
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </button>

        {/* View Cart link */}
        <Link
          href="/cart"
          className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          View Cart →
        </Link>
      </div>
    </div>
  );
}
