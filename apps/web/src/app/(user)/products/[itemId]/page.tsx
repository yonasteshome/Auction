
import { PriceHistoryChart } from "@/components/product-detail/price-history-chart";
import { PriceStatCards } from "@/components/product-detail/price-stat-cards";
import { PriceSubmissions } from "@/components/product-detail/price-submissions";
import { ProductHero } from "@/components/product-detail/product-hero";
import { SimilarProducts } from "@/components/product-detail/similar-products";
import { VendorComparisonTable } from "@/components/product-detail/vendor-comparison-table";
import type { VendorOfferContext } from "@/components/product-detail/vendor-offer-panel";
import {
  getPriceHistory,
  getProductDetail,
  getRecentPriceSubmissions,
  getSimilarProducts,
  getVendorPriceComparisons,
} from "@/lib/product-details";
import { getVendorDetail, getVendorListing } from "@/lib/vendor-details";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{
    timeRange?: string;
    location?: string;
    // Only vendorId + listingId needed — all other vendor data is fetched from the API
    vendorId?: string;
    listingId?: string;
  }>;
}

export default async function ProductDetailsPage({ params, searchParams }: ProductPageProps) {
  const { itemId } = await params;
  const { timeRange = "6M", location, vendorId, listingId } = await searchParams;

  try {
    const [product, history, vendors, similar, submissions] = await Promise.all([
      getProductDetail(itemId),
      getPriceHistory(itemId, timeRange),
      getVendorPriceComparisons(itemId, location),
      getSimilarProducts(itemId),
      getRecentPriceSubmissions(itemId),
    ]);

    // Fetch vendor context from the API when both IDs are present in the URL
    let vendorOffer: VendorOfferContext | null = null;

    if (vendorId && listingId) {
      try {
        const [listing, vendor] = await Promise.all([
          getVendorListing(listingId),
          getVendorDetail(vendorId),
        ]);

        vendorOffer = {
          listingId: parseInt(listing.id, 10),
          vendorId,
          vendorName: vendor.vendorName,
          vendorLocation: vendor.location,
          vendorRegion: vendor.region,
          vendorRating: vendor.rating,
          vendorVerified: vendor.verifiedStatus === "Verified",
          vendorImageUrl: vendor.imageUrl,
          price: listing.price,
          variant: listing.variant,
          description: listing.description,
          basePrice: listing.basePrice,
          unit: listing.unit,
          itemName: listing.itemName,
          stockQuantity: listing.stockQuantity,
          stockStatus: listing.stockStatus,
        };
      } catch (err) {
        // Non-fatal — page still renders without the vendor panel
        console.warn("Could not load vendor context:", err);
      }
    }

    return (
      <div className="pb-20 max-w-[1600px] mx-auto px-4 md:px-6">
        {/* Vendor Offer Panel — shown only when navigating from a vendor page */}
        {/* {vendorOffer && (
          <div className="pt-6">
            <VendorOfferPanel offer={vendorOffer} vendorId={vendorOffer.vendorId} />
          </div>
        )} */}

        <ProductHero product={product} offer={vendorOffer} />

        <div className="mb-8">
          <PriceStatCards product={product} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 lg:p-8 shadow-sm flex flex-col">
            <div className="flex-1 min-h-[350px]">
              <PriceHistoryChart history={history} currentPrice={product.currentAveragePrice} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <PriceSubmissions submissions={submissions} />
          </div>
        </div>

        <div className="mb-8" id="compare">
          <VendorComparisonTable vendors={vendors} submissions={submissions} />
        </div>

        <SimilarProducts products={similar} />
      </div>
    );
  } catch (error) {
    console.error("Failed to load product details", error);
    notFound();
  }
}
