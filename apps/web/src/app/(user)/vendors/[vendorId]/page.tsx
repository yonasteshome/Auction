import { getVendorDetail, getVendorProducts, getVendorReviews, getVendorPriceTrend, getVendorCategories } from "@/lib/vendor-details";
import { notFound } from "next/navigation";
import { Star, MapPin, Phone, MessageCircle, Heart, CheckCircle, Package } from "lucide-react";
import Image from "next/image";
import { ApiError } from "@/lib/api";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { Metadata } from "next";

// Component imports
import ProductCard from "@/components/vendors/ProductCard";
import ReviewSectionClient from "@/components/vendors/ReviewSectionClient";
import PriceCompetitivenessChart from "@/components/vendors/PriceCompetitivenessChart";
import LocationCard from "@/components/vendors/LocationCard";
import ShareVendorButton from "@/components/vendors/ShareVendorButton";
import ReportVendorDialog from "@/components/vendors/ReportVendorDialog";
import SimilarVendors from "@/components/vendors/SimilarVendors";
import ProductGridFilters from "@/components/vendors/ProductGridFilters";
import PaginationControls from "@/components/vendors/PaginationControls";

// Skeleton imports
import ProductGridSkeleton from "@/components/vendors/skeletons/ProductGridSkeleton";
import ReviewSectionSkeleton from "@/components/vendors/skeletons/ReviewSectionSkeleton";
import PriceChartSkeleton from "@/components/vendors/skeletons/PriceChartSkeleton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function normalizeSearchParams(searchParams: Awaited<PageProps["searchParams"]>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  );
}

// 1. Dynamic SEO and OpenGraph Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vendorId } = await params;
  try {
    const vendorDetail = await getVendorDetail(vendorId);
    const title = `${vendorDetail.shopName} | SpendSense Ethiopia`;
    const description =
      vendorDetail.description ||
      `Browse cost-efficient prices and verified items at ${vendorDetail.shopName} in ${vendorDetail.location}, Ethiopia.`;
    const imageUrl = vendorDetail.imageUrl || "/og-default-vendor.jpg";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${vendorDetail.shopName} cover image`,
          },
        ],
      },
    };
  } catch {
    return {
      title: "Vendor Profile | SpendSense Ethiopia",
      description: "Explore verified vendors and price alerts in Ethiopia.",
    };
  }
}

export default async function VendorDetailsPage({ params, searchParams }: PageProps) {
  const { vendorId } = await params;
  const resolvedSearchParams = await searchParams;
  const productParams = normalizeSearchParams(resolvedSearchParams);

  // Fetch authentication status on server
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get(AUTH_COOKIE_NAME)?.value;

  let vendorDetail;
  try {
    vendorDetail = await getVendorDetail(vendorId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // Suspense Key to trigger skeleton loading on parameter change
  const suspenseKey = JSON.stringify(productParams);

  return (
    <div className="container mx-auto py-8 px-4 space-y-10 max-w-7xl">
      {/* Hero Section */}
      <section className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-800 w-full relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 relative -top-16 mb-[-3rem]">
            <div className="w-32 h-32 rounded-full border-4 border-card bg-muted overflow-hidden shrink-0 shadow-md">
              {vendorDetail.imageUrl ? (
                <Image
                  src={vendorDetail.imageUrl}
                  alt={vendorDetail.shopName}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {vendorDetail.shopName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 pt-18 sm:pt-20">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{vendorDetail.shopName}</h1>
                    {vendorDetail.verifiedStatus === "Verified" && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-foreground">
                        {vendorDetail.rating.toFixed(1)}
                      </span>
                      <span>({vendorDetail.reviewCount})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {vendorDetail.location}, {vendorDetail.region}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {vendorDetail.contactInfo}
                    </span>
                  </div>
                  <div className="inline-flex items-center py-1 px-2.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                    Score: {vendorDetail.competitivenessScore}/100 — Top vendor in{" "}
                    {vendorDetail.region}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                  <button className="p-2 border rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                    <Heart className="w-5 h-5" />
                  </button> */}
                  {/* Web Share API Share Button */}
                  <ShareVendorButton
                    vendorId={vendorDetail.id}
                    shopName={vendorDetail.shopName}
                  />
                </div>
              </div>

              {/* Report Vendordialog link */}
              <div className="flex justify-start">
                <ReportVendorDialog
                  vendorId={vendorDetail.id}
                  shopName={vendorDetail.shopName}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layout for Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Price Competitiveness, Products, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Price Competitiveness Sparkline (Progressive Load) */}
          <Suspense fallback={<PriceChartSkeleton />}>
            <VendorPriceCompetitiveness vendorId={vendorId} />
          </Suspense>

          {/* Products Grid */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <Suspense key={suspenseKey} fallback={<ProductGridSkeleton count={6} />}>
              <ProductGrid
                vendorId={vendorId}
                productParams={productParams}
                vendorDetail={vendorDetail}
                isAuthenticated={isAuthenticated}
              />
            </Suspense>
          </section>

          {/* Reviews Section */}
          <section className="space-y-4 pt-8">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <Suspense fallback={<ReviewSectionSkeleton />}>
              <ReviewSection vendorId={vendorId} />
            </Suspense>
          </section>
        </div>

        {/* Right Column: About, Stats, Map Card */}
        <div className="space-y-6">
          <section className="border rounded-2xl p-6 bg-card space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">About the Shop</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {vendorDetail.description}
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Business Hours</span>
                <span className="font-medium">
                  {typeof vendorDetail.businessHours === "string"
                    ? vendorDetail.businessHours
                    : Array.isArray(vendorDetail.businessHours)
                    ? vendorDetail.businessHours.map((h) => `${h.day}: ${h.start}-${h.end}`).join(", ")
                    : "Not specified"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">
                  {vendorDetail.deliveryAvailable
                    ? vendorDetail.deliveryEstimate
                    : "Pick up only"}
                </span>
              </div>
              <div className="flex justify-between text-sm items-start">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-right max-w-[60%] leading-tight">
                  {vendorDetail.paymentMethods.join(", ")}
                </span>
              </div>
            </div>
          </section>

          <section className="border rounded-2xl p-6 bg-card space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Vendor Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-xl font-bold">{vendorDetail.itemsListed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="text-xl font-bold">{vendorDetail.totalSales}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-xl font-bold">{vendorDetail.responseTimeMinutes}m</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-bold mt-1">
                  {new Date(vendorDetail.memberSince).getFullYear()}
                </p>
              </div>
            </div>
          </section>

          {/* Map Location Preview Card */}
          <LocationCard
            address={vendorDetail.location}
            region={vendorDetail.region}
            lat={vendorDetail.latitude}
            lng={vendorDetail.longitude}
            businessHours={vendorDetail.businessHours}
          />
        </div>
      </div>

      {/* Similar Vendors Carousel */}
      <Suspense fallback={<div className="h-48 bg-muted animate-pulse rounded-2xl" />}>
        <SimilarVendors vendorId={vendorId} region={vendorDetail.region} />
      </Suspense>
    </div>
  );
}

// Async Subcomponent: Price Competitiveness
async function VendorPriceCompetitiveness({ vendorId }: { vendorId: string }) {
  try {
    const trend = await getVendorPriceTrend(vendorId);
    return (
      <PriceCompetitivenessChart
        weeks={trend.weeks}
        vendorPrices={trend.vendorPrices}
        marketPrices={trend.marketPrices}
      />
    );
  } catch (error) {
    console.error("Failed to load price trend:", error);
    return (
      <div className="border border-dashed rounded-2xl p-6 bg-card text-center text-sm text-muted-foreground">
        Price trend data unavailable.
      </div>
    );
  }
}

// Async Subcomponent: Product Grid with Filter Syncing
async function ProductGrid({
  vendorId,
  productParams,
  vendorDetail,
  isAuthenticated,
}: {
  vendorId: string;
  productParams: any;
  vendorDetail: any;
  isAuthenticated: boolean;
}) {
  try {
    const [vendorProducts, vendorCategories] = await Promise.all([
      getVendorProducts(vendorId, productParams),
      getVendorCategories(vendorId),
    ]);

    const categoriesToUse = Array.isArray(vendorCategories) && vendorCategories.length
      ? vendorCategories
      : vendorProducts.categories;

    return (
      <div className="space-y-6">
        {/* Category Tabs & Pagination Controls */}
          <ProductGridFilters
            categories={categoriesToUse}
            pagination={vendorProducts.pagination}
            hidePagination
          />

        {vendorProducts.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-center">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your category tabs or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {vendorProducts.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                vendorDetail={vendorDetail}
                isAuthenticated={isAuthenticated}
                city={vendorDetail.region}
              />
            ))}
            </div>
          )}
          {/* Pagination below product cards */}
          <PaginationControls pagination={vendorProducts.pagination} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch vendor products:", error);
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-center">
        <Package className="w-12 h-12 text-muted-foreground mb-4 animate-bounce" />
        <h3 className="text-lg font-medium text-destructive">Products are unavailable</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The vendor profile loaded successfully, but products could not be fetched.
        </p>
      </div>
    );
  }
}

// Async Subcomponent: Reviews
async function ReviewSection({ vendorId }: { vendorId: string }) {
  try {
    const vendorReviews = await getVendorReviews(vendorId);
    return <ReviewSectionClient vendorId={vendorId} initialReviews={vendorReviews} />;
  } catch (error) {
    console.error("Failed to load reviews:", error);
    return (
      <div className="border border-dashed rounded-xl p-6 bg-card text-sm text-muted-foreground">
        Reviews could not be loaded right now.
      </div>
    );
  }
}
