import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Package, CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { VendorResponse } from "@/types/api/vendors";

interface VendorCardProps {
  vendor: VendorResponse;
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md gap-0">
      <div className="relative aspect-video w-full bg-muted">
        {vendor.imageUrl ? (
          <Image
            src={vendor.imageUrl}
            alt={vendor.shopName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-blue-50 dark:bg-blue-950/20">
            <Package className="h-12 w-12 text-blue-300 dark:text-blue-800" />
          </div>
        )}
        {vendor.verifiedStatus === "Verified" && (
          <Badge className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white border-transparent gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      <CardContent className="flex-1 p-5">
        <div className="space-y-1 mb-4">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-blue-600 transition-colors">
            {vendor.shopName}
          </h3>
          <p className="text-sm text-muted-foreground">{vendor.vendorName}</p>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="mr-1 h-3.5 w-3.5" />
          <span className="truncate">{vendor.location}, {vendor.region}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{vendor.rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal">({vendor.reviewCount})</span>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
            Score: {vendor.competitivenessScore}/10
          </Badge>
        </div>

        {/* {vendor.topItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Top Items</p>
            <div className="flex flex-wrap gap-1.5">
              {vendor.topItems.slice(0, 3).map((item, idx) => (
                <Badge key={idx} variant="secondary" className="font-normal text-xs bg-slate-100 dark:bg-slate-800">
                  {item.itemName}: {item.price} ETB/{item.unit}
                </Badge>
              ))}
            </div>
          </div>
        )} */}
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto bg-card border-none">
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/vendors/${vendor.id}`}>View Shop</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
