import { VendorPriceComparisonResponse } from "@/types/api/product-details";
import { MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VendorComparisonCardProps {
  vendor: VendorPriceComparisonResponse;
  isBestPrice: boolean;
}

export function VendorComparisonCard({ vendor, isBestPrice }: VendorComparisonCardProps) {
  const price = parseFloat(vendor.price);
  const rating = parseFloat(vendor.rating_avg);

  return (
    <div className={cn(
      "border p-4 rounded-xl space-y-3 shadow-sm transition-all hover:shadow-md",
      isBestPrice ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-card"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/vendors/${vendor.vendor_id}`} className="font-bold text-lg hover:text-primary transition-colors">
              {vendor.vendor_name}
            </Link>
            {isBestPrice && (
              <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Best Deal
              </span>
            )}
            {vendor.is_verified && (
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {vendor.city}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl">{price.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">ETB</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          Rating: <span className="font-semibold text-foreground">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
        </span>
        
        <div className="flex gap-2">
          <Link 
            href={`/vendors/${vendor.vendor_id}`}
            className="text-xs bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-md font-medium transition-colors"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
