import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

import { getVendorById, getVendorListings, getVendorReviews } from "@/actions/ecommerce";
import type { Review, Vendor, VendorListing } from "@/lib/ecommerce-types";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function VendorProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8 text-sm text-destructive">
        Missing vendor identifier.
      </div>
    );
  }

  let vendor: Vendor | null = null;
  let reviews: Review[] = [];
  let listings: VendorListing[] = [];

  try {
    const [vendorData, reviewData, listingData] = await Promise.all([
      getVendorById(id),
      getVendorReviews(id),
      getVendorListings(id),
    ]);
    
    vendor = vendorData;
    reviews = reviewData;
    listings = listingData;
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8 text-sm text-destructive">
        Unable to load vendor profile. Please try again later.
      </div>
    );
  }

  if (!vendor) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <section className="relative h-64 rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent" />
        </div>

        <div className="absolute bottom-8 left-8 flex items-end gap-6">
          <div className="w-28 h-28 rounded-2xl border-4 border-white bg-white shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-primary text-2xl">
              {vendor.shop_name
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>
          </div>
          <div className="mb-2 space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">{vendor.shop_name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-none text-white font-bold gap-1">
                <Star size={12} fill="currentColor" /> {vendor.rating_avg}
              </Badge>
              <span className="text-sm font-bold flex items-center gap-1">
                <ShieldCheck size={14} className="text-blue-400" />
                {vendor.is_verified ? "Verified Merchant" : "Unverified Merchant"}
              </span>
              <span className="text-sm font-medium flex items-center gap-1 opacity-80">
                <MapPin size={14} /> {vendor.city ?? "Location unavailable"}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8">
          <Button size="lg" className="rounded-2xl font-black gap-2 shadow-2xl active:scale-95 transition-all">
            <Mail size={18} /> Contact Vendor
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Vendor Since</p>
          <h3 className="text-3xl font-black tracking-tighter">{formatDate(vendor.joined_at)}</h3>
          <div className="mt-2 flex items-center gap-1 font-black text-[10px] uppercase text-primary">
            <TrendingUp size={16} /> Active storefront
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Rating</p>
          <h3 className="text-3xl font-black tracking-tighter">{vendor.rating_avg}</h3>
          <div className="mt-2 flex items-center gap-1 font-black text-[10px] uppercase text-emerald-600">
            <CheckCircle2 size={16} /> {vendor.rating_count} reviews
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Location</p>
          <h3 className="text-2xl font-black tracking-tighter">{vendor.city ?? "Unknown city"}</h3>
          <div className="mt-2 flex items-center gap-1 font-black text-[10px] uppercase text-primary">
            <MapPin size={16} /> {vendor.address ?? "Address unavailable"}
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Contact</p>
          <h3 className="text-2xl font-black tracking-tighter">{vendor.contact_phone ?? "Not provided"}</h3>
          <div className="mt-2 flex items-center gap-1 font-black text-[10px] uppercase text-amber-500">
            <Zap size={16} /> Direct response
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black tracking-tight">Product Catalog</h4>
            <div className="flex items-center gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-40 rounded-xl font-bold bg-slate-50 border-none">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="it">Electronics</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <LayoutGrid size={20} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="group overflow-hidden rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-950 font-black border-none text-[10px]">
                    {listing.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h5 className="font-black text-lg group-hover:text-primary transition-colors">{listing.item_name}</h5>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-medium">
                    {listing.unit ? `Unit: ${listing.unit}` : `Listing #${listing.item}`}
                  </p>
                  {listing.variant ? (
                    <Badge variant="secondary" className="mt-3 rounded-full bg-primary/5 text-primary border-none font-bold">
                      {listing.variant}
                    </Badge>
                  ) : null}
                  {listing.description ? (
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {listing.description}
                    </p>
                  ) : null}
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xl font-black text-primary tracking-tight">ETB {Number(listing.price).toLocaleString("en-ET")}</span>
                    <Button size="icon" className="rounded-2xl shadow-lg active:scale-90">
                      <MessageSquare size={18} />
                    </Button>
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Updated {formatDate(listing.date)}
                  </p>
                </CardContent>
              </Card>
            ))}
            {listings.length === 0 && (
              <Card className="border-none shadow-sm rounded-2xl p-5 bg-white">
                <p className="text-sm text-muted-foreground">No listings found for this vendor.</p>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black">Latest Reviews</h4>
            <Button variant="link" className="text-primary font-black text-xs uppercase p-0">View All</Button>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border-none shadow-sm rounded-2xl p-5 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-black text-xs">
                    {review.user_email
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <h6 className="text-sm font-black">{review.user_email}</h6>
                    <div className="flex text-amber-500">
                      {Array.from({ length: review.rating }, (_, index) => (
                        <Star key={index} size={10} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {review.comment || "No comment provided."}
                </p>
                <p className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-wider">
                  Verified Review • {formatDate(review.created_at)}
                </p>
              </Card>
            ))}
            {reviews.length === 0 && (
              <Card className="border-none shadow-sm rounded-2xl p-5 bg-white">
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              </Card>
            )}
          </div>

          <Card className="bg-primary/5 border-primary/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles size={18} />
              <h5 className="text-sm font-black uppercase tracking-tight">Vendor Insight</h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              TechNova ranks in the top 1% for fulfillment speed in the Ethiopian tech market sector.
            </p>
            <Button variant="outline" className="w-full bg-white rounded-xl font-black text-[10px] uppercase tracking-tighter gap-2">
              Analytics Report <ArrowUpRight size={14} />
            </Button>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-8 right-8">
        <Button size="icon" className="w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
          <MessageSquare size={24} />
        </Button>
      </div>
    </div>
  );
}