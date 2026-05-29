"use client"
import { ProductDetailResponse } from "@/types/api/product-details";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductActions } from "./product-actions";
import { PriceTrendBadge } from "@/components/shared/price-trend-badge";
import { Clock, ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ShoppingCart, Store, CheckCircle, Star, Package, AlertTriangle, Plus, Minus, Loader2, MapPin } from "lucide-react";
import { addToCart } from "@/actions/ecommerce";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface VendorOfferContext {
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

interface ProductHeroProps {
  product: ProductDetailResponse;
  offer: VendorOfferContext|null;
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
export function ProductHero({ product,offer }: ProductHeroProps) {
  const timeAgo = formatDistanceToNow(new Date(product.lastUpdated), { addSuffix: true });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      {/* Left Column - Visuals */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="relative aspect-square rounded-2xl border bg-white overflow-hidden shadow-sm flex flex-col">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
              {product.category}
            </span>
          </div>
          <ProductImageGallery images={product.imageUrls} fallbackName={product.name} />
        </div>
      </div>

      {/* Right Column - Core Info */}
      <div className="lg:col-span-7 flex flex-col justify-center ">
        <div className="space-y-2">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/products" className="hover:text-primary">Groceries</Link>
            <span className="mx-2">›</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {product.name}
          </h1>
          

        </div>
        {!offer && (

        <div className="flex flex-wrap items-center gap-4 p-4 border-b border-border/50 ">
          {/* Price Block */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Current Average Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">{product.currentAveragePrice.toFixed(2)}</span>
              <span className="text-xl text-muted-foreground font-medium">ETB / {product.unit}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pb-1">
            <PriceTrendBadge trend={product.priceTrend} className="text-base bg-muted/50 px-2.5 py-1 rounded-md" />
          </div>
        </div>
        )}

        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Updated {timeAgo}</span>
        </div>
         {/* Vendor Info Row */}
            
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {product.lowestPrice && (
            <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 p-3 rounded-lg flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-md text-green-600 dark:text-green-400 mt-0.5">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Lowest Found</p>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {product.lowestPrice.price.toFixed(2)} ETB <span className="font-normal opacity-80">at {product.lowestPrice.vendorName}</span>
                </p>
              </div>
            </div>
          )}

          {product.highestPrice && (
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3 rounded-lg flex items-start gap-3">
              <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-md text-red-600 dark:text-red-400 mt-0.5">
                <ArrowUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Highest Found</p>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {product.highestPrice.price.toFixed(2)} ETB <span className="font-normal opacity-80">at {product.highestPrice.vendorName}</span>
                </p>
              </div>
            </div>
          )}
        </div>
        {offer &&(
          <CartSection offer={offer} product={product} /> 
        )}
        <ProductActions productId={product.id} unit={product.unit} currentPrice={product.currentAveragePrice} />
      </div>
    </div>
  );
}


export function CartSection({ offer,product }: { offer: VendorOfferContext,product:ProductDetailResponse }) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
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
    <div className=" mb-8">
      <div className=" space-y-5">
        <div className="flex justify-between">
          {/* Price Block */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1 font-medium">This vendor&apos;s price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">
                {offer.variant} x {offer.basePrice}
              </span>
              <span className="text-base text-muted-foreground font-medium">ETB / {offer.unit}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total for {quantity}: <span className="font-semibold text-foreground">ETB {(offer.price * quantity).toFixed(2)}</span>
            </p>
          </div>
          {/* average prive section */}
          <div className="flex flex-1 flex-wrap items-center gap-4 p-4 border-b border-border/50 ">
            {/* Price Block */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Current Average Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">{product.currentAveragePrice.toFixed(2)}</span>
                <span className="text-xl text-muted-foreground font-medium">ETB / {product.unit}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-1">
              <PriceTrendBadge trend={product.priceTrend} className="text-base bg-muted/50 px-2.5 py-1 rounded-md" />
            </div>
          </div>
        </div>
        {/* Stock Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${stock.bg} ${stock.border} ${stock.text}`}>
          {stock.icon}
          {stock.label}
          {offer.stockQuantity > 0 && (
            <span className="opacity-70 font-normal ml-1">· {offer.stockQuantity} units available</span>
          )}
        </div>
           {offer &&(
            
             
             <div className="flex items-center gap-3 border-2 border-blue-200 rounded-sm">
                <div className="flex flex-col w-full">
                 
                  <div className="flex items-center gap-2 p-1 border-b-2 border-blue-200 bg-blue-200 ">
                    <div className="bg-blue-600 text-white rounded-lg p-1">
                      <Store className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                      Viewing from Vendor
                    </span>
                  </div>

                  <div className="px-4 p-4 flex gap-3">
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
                        <Link
                          href={`/vendors/${offer.vendorId}`}
                          className="font-semibold text-sm text-foreground truncate hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {offer.vendorName}
                        </Link>
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
                  

                </div>
                
            </div>
          )}  
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
      
      </div>
    </div>
  );
}

