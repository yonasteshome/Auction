"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  Package,
  CheckCircle2,
  Navigation,
  Compass,
  ArrowLeft,
  Grid,
  Search,
  SlidersHorizontal,
  CompassIcon,
  Map as MapIcon,
  List,
  Crosshair,
  Loader2,
  Clock,
  Sparkles,
  DollarSign
} from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { VendorListResponse, VendorResponse } from "@/types/api/vendors";
import { MarketItem } from "@/types/api/vendor";

interface VendorMapClientProps {
  initialData: VendorListResponse;
  searchParams: { [key: string]: string | string[] | undefined };
  marketItems?: MarketItem[];
}

export function VendorMapClient({ initialData, searchParams, marketItems = [] }: VendorMapClientProps) {
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [selectedVendor, setSelectedVendor] = useState<VendorResponse | null>(null);
  
  const [vendors, setVendors] = useState<VendorResponse[]>(initialData.results);
  const [page, setPage] = useState(initialData.pagination.current_page);
  const [hasMore, setHasMore] = useState(initialData.pagination.current_page < initialData.pagination.total_pages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setVendors(initialData.results);
    setPage(initialData.pagination.current_page);
    setHasMore(initialData.pagination.current_page < initialData.pagination.total_pages);
  }, [initialData]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("page", nextPage.toString());
      currentUrl.searchParams.set("pageSize", "20");
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/market/vendors/${currentUrl.search}`);
      const data = await res.json() as VendorListResponse;
      setVendors(prev => [...prev, ...data.results]);
      setPage(data.pagination.current_page);
      setHasMore(data.pagination.current_page < data.pagination.total_pages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 200;
    if (bottom && hasMore && !isLoadingMore) {
      loadMore();
    }
  };
  
  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Search & Filters state synchronized with URL (matches general Vendors page)
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useQueryState("q", parseAsString.withDefault("").withOptions({ shallow: false }));
  const [category, setCategory] = useQueryState("category", parseAsString.withDefault("").withOptions({ shallow: false }));
  const [region, setRegion] = useQueryState("region", parseAsString.withDefault("").withOptions({ shallow: false }));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault("popularity").withOptions({ shallow: false }));

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSubmissions = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const queryParams = new URLSearchParams();
        if (q && q !== "all") {
          queryParams.set("item_name", q);
        }
        if (region && region !== "all") {
          queryParams.set("city", region);
        }
        const res = await fetch(`${API_BASE}/api/market/prices/geo/?${queryParams.toString()}`);
        const data = await res.json();
        if (active) {
          setSubmissions(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load geo submissions:", err);
      }
    };

    fetchSubmissions();
    return () => {
      active = false;
    };
  }, [q, region]);

  const categories = ["Grains", "Vegetables", "Oils & Spices", "Beverages", "Household"];
  const regions = ["Addis Ababa", "Adama", "Shola", "Merkato", "Bole", "Yeka", "Kirkos"];

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  // Default coordinate center (Addis Ababa)
  const defaultLat = 9.005401;
  const defaultLng = 38.763611;

  // Sync / request user geolocation on start
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsLocating(false);

        // Center map to user coordinates
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([coords.lat, coords.lng], 14);
          
          // Re-draw or update user marker location
          import("leaflet").then((L) => {
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
            } else {
              const userIcon = L.divIcon({
                className: "",
                html: `<div class="relative flex h-5 w-5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span>
                </div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              });
              const marker = L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(leafletMapRef.current);
              userMarkerRef.current = marker;
            }
          });
        }
      },
      (err) => {
        setGpsError(`GPS Error: ${err.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Initialize Leaflet Map (client side only)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    import("leaflet").then((L) => {
      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (leafletMapRef.current) return;

      const initialLat = defaultLat;
      const initialLng = defaultLng;

      const map = L.map(mapContainerRef.current!, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Create a layer group for easy clearing & drawing of dynamic vendor markers
      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      leafletMapRef.current = map;

      // Initial auto GPS geolocation request
      handleGeolocate();
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersGroupRef.current = null;
        userMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map markers when vendors or submissions data updates
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear existing markers
    markersGroup.clearLayers();

    import("leaflet").then((L) => {
      const bounds = L.latLngBounds([]);

      // 1. Draw vendors
      vendors.forEach((vendor) => {
        if (!vendor.latitude || !vendor.longitude) return;

        const position: [number, number] = [vendor.latitude, vendor.longitude];
        bounds.extend(position);

        const isVerified = vendor.verifiedStatus === "Verified";
        const score = vendor.competitivenessScore;

        const pinColor =
          score >= 8
            ? "#10b981" // Rich emerald green for top deal scores
            : score >= 5
            ? "#2563eb" // Royal blue for good/average deals
            : "#6b7280"; // Muted gray

        const pinText = vendor.priceForSearchedItem ? `${vendor.priceForSearchedItem}<br/>ETB` : `${score}/10`;
        const pinTextSize = vendor.priceForSearchedItem ? "text-[8px]" : "text-[10px]";

        const iconHtml = `<div class="relative flex items-center justify-center" style="
          width: 42px; height: 42px;
          background: ${pinColor};
          border: 3.5px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.2s ease-in-out;
        ">
          <div style="transform: rotate(45deg); color: white;" class="font-extrabold ${pinTextSize} text-center leading-tight">
            ${pinText}
          </div>
          ${isVerified ? `
            <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 border-2 border-white shadow-sm" style="transform: rotate(45deg)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-2.5 h-2.5">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.748-5.25Z" clip-rule="evenodd" />
              </svg>
            </span>
          ` : ""}
        </div>`;

        const customIcon = L.divIcon({
          className: "custom-leaflet-pin",
          html: iconHtml,
          iconSize: [42, 42],
          iconAnchor: [21, 42],
          popupAnchor: [0, -45],
        });

        const marker = L.marker(position, { icon: customIcon }).addTo(markersGroup);

        const popupContent = `
          <div class="p-3 font-sans w-52 text-foreground space-y-2">
            <div class="flex items-start justify-between gap-1">
              <h4 class="font-bold text-sm leading-tight text-slate-800 m-0">${vendor.shopName}</h4>
              ${isVerified ? `<span class="bg-blue-100 text-blue-800 text-[9px] font-bold px-1 rounded uppercase">Verified</span>` : ""}
            </div>
            <p class="text-xs text-slate-500 m-0">${vendor.location}</p>
            <div class="flex items-center justify-between pt-1 border-t border-slate-100">
              <span class="text-xs font-semibold text-slate-600">Rating: ⭐ ${vendor.rating.toFixed(1)}</span>
              ${vendor.priceForSearchedItem 
                ? `<span class="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Price: ${vendor.priceForSearchedItem} ETB</span>`
                : `<span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Score: ${vendor.competitivenessScore}/10</span>`
              }
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);

        marker.on("click", () => {
          setSelectedVendor(vendor);
          setSelectedSubmission(null);
          map.setView(position, 15);
        });
      });

      // 2. Draw community price submissions
      submissions.forEach((sub) => {
        if (!sub.latitude || !sub.longitude) return;

        const position: [number, number] = [sub.latitude, sub.longitude];
        bounds.extend(position);

        const pinColor = "#8b5cf6"; // Purple-500 for community submissions

        const iconHtml = `<div class="relative flex items-center justify-center" style="
          width: 38px; height: 38px;
          background: ${pinColor};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          transition: all 0.2s ease-in-out;
        ">
          <div style="transform: rotate(45deg); color: white;" class="font-extrabold text-[8px] text-center leading-tight">
            ${parseFloat(sub.price_value).toFixed(0)}<br/>ETB
          </div>
        </div>`;

        const customIcon = L.divIcon({
          className: "custom-leaflet-community-pin",
          html: iconHtml,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -40],
        });

        const marker = L.marker(position, { icon: customIcon }).addTo(markersGroup);

        const popupContent = `
          <div class="p-3 font-sans w-52 text-foreground space-y-2">
            <div class="flex items-start justify-between gap-1">
              <h4 class="font-bold text-sm leading-tight text-slate-800 m-0">${sub.item_name}</h4>
              <span class="bg-purple-100 text-purple-800 text-[8px] font-bold px-1 rounded uppercase">Community</span>
            </div>
            <p class="text-xs text-slate-500 m-0">${sub.market_location}</p>
            <div class="flex items-center justify-between pt-1 border-t border-slate-100">
              <span class="text-xs font-semibold text-slate-650">Price: ${sub.price_value} ETB</span>
              <span class="text-[9px] text-slate-400">${new Date(sub.date_observed).toLocaleDateString()}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          setSelectedSubmission(sub);
          setSelectedVendor(null);
          map.setView(position, 15);
        });
      });

      // Fit map to view all pins seamlessly
      if ((vendors.length > 0 || submissions.length > 0) && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });
  }, [vendors, submissions]);

  // Center maps dynamically to selected vendor in side panel list
  const handleSelectVendor = (vendor: VendorResponse) => {
    setSelectedVendor(vendor);
    if (vendor.latitude && vendor.longitude && leafletMapRef.current) {
      leafletMapRef.current.setView([vendor.latitude, vendor.longitude], 15);
      
      // Auto trigger mobile tab shift to let them view coordinates visually
      if (window.innerWidth < 768) {
        setActiveTab("map");
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* Dynamic Map Styling imports */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        // @ts-ignore
        precedence="default"
      />

      {/* Header bar with filters and view toggle */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b px-5 py-4 gap-4 bg-card shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-8 rounded-lg px-2 text-muted-foreground hover:text-foreground">
            <Link href="/vendors">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Grid
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
              <MapIcon className="w-5 h-5 text-blue-600" />
              Vendor Map Discovery
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Centering live prices, Gullit stalls, and wholesale warehouses spatially.
            </p>
          </div>
        </div>

        {/* Dynamic Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 max-w-full ">
          <Select
            value={q || "all"}
            onValueChange={(val) => startTransition(() => { setQ(val === "all" ? null : val); })}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Search item..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              {marketItems.map((item) => (
                <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category || "all"}
            onValueChange={(val) => startTransition(() => { setCategory(val === "all" ? null : val); })}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={region || "all"}
            onValueChange={(val) => startTransition(() => { setRegion(val === "all" ? null : val); })}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy || "value"}
            onValueChange={(val) => startTransition(() => { setSortBy(val); })}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Best Value</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="nearest">Nearest</SelectItem>
              <SelectItem value="reliability">Reliability</SelectItem>
            </SelectContent>
          </Select>

          {/* GPS Locate Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGeolocate}
            disabled={isLocating}
            className="h-8 w-8 p-0 rounded-lg shrink-0 text-blue-600"
            title="Locate me"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* View Toggle on Mobile */}
        <div className="flex md:hidden border rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-1 px-4 py-1.5 text-xs font-semibold ${
              activeTab === "map"
                ? "bg-blue-600 text-white"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Map
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-1 px-4 py-1.5 text-xs font-semibold ${
              activeTab === "list"
                ? "bg-blue-600 text-white"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List ({vendors.length})
          </button>
        </div>
      </header>

      {/* Main Split Interface Area */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        
        {/* Left Side: Leaflet Map Container */}
        <div
          className={`h-full w-full md:w-[65%] shrink-0 z-10 transition-all ${
            activeTab === "map" ? "block" : "hidden md:block"
          }`}
        >
          <div ref={mapContainerRef} className="h-full w-full bg-slate-100" />
        </div>

        {/* Right Side: Vendor Panel (List and Selected Card Display) */}
        <div
          className={`h-full w-full md:w-[35%] border-l bg-slate-50 dark:bg-slate-950/20 flex flex-col overflow-hidden transition-all ${
            activeTab === "list" ? "block" : "hidden md:flex"
          }`}
        >
          {/* Detailed Selected Vendor/Submission Overlay Sheet */}
          {selectedVendor ? (
            <div className="p-5 border-b bg-card space-y-4 shadow-sm shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Selected Vendor
                  </span>
                  <h3 className="font-extrabold text-lg leading-tight text-foreground">{selectedVendor.shopName}</h3>
                  <p className="text-xs text-muted-foreground">{selectedVendor.vendorName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVendor(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Selection
                </Button>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-xl p-3 bg-muted/40 space-y-0.5 text-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Value Score</p>
                  <p className="text-xl font-black text-emerald-600">{selectedVendor.competitivenessScore}/10</p>
                </div>
                <div className="border rounded-xl p-3 bg-muted/40 space-y-0.5 text-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Reliability</p>
                  <p className="text-sm font-black text-foreground flex items-center justify-center gap-1">
                    <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                    {selectedVendor.rating.toFixed(1)} <span className="font-normal text-muted-foreground">({selectedVendor.reviewCount})</span>
                  </p>
                </div>
              </div>

              {/* Location Landmark Label */}
              <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Shop Landmark / Address</p>
                  <p className="text-muted-foreground leading-snug">{selectedVendor.location}, {selectedVendor.region}</p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold rounded-xl">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedVendor.shopName}, ${selectedVendor.location}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    Directions
                  </a>
                </Button>
                <Button asChild size="sm" className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Link href={`/vendors/${selectedVendor.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          ) : selectedSubmission ? (
            <div className="p-5 border-b bg-card space-y-4 shadow-sm shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-purple-600 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-purple-600" />
                    Community Submission
                  </span>
                  <h3 className="font-extrabold text-lg leading-tight text-foreground">{selectedSubmission.item_name}</h3>
                  <p className="text-xs text-muted-foreground">Category: {selectedSubmission.item_category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Selection
                </Button>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-xl p-3 bg-muted/40 space-y-0.5 text-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Observed Price</p>
                  <p className="text-xl font-black text-purple-600">{selectedSubmission.price_value} ETB</p>
                </div>
                <div className="border rounded-xl p-3 bg-muted/40 space-y-0.5 text-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Quality Grade</p>
                  <p className="text-sm font-black text-foreground capitalize">
                    {selectedSubmission.quality_grade || "Standard"}
                  </p>
                </div>
              </div>

              {/* Location Landmark Label */}
              <div className="flex items-start gap-2 bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100/50">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Market / Vendor Location</p>
                  <p className="text-muted-foreground leading-snug">
                    {selectedSubmission.market_location} ({selectedSubmission.vendor_name || "Street Vendor"}), {selectedSubmission.city}
                  </p>
                </div>
              </div>

              {/* Date Info */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Observed on {new Date(selectedSubmission.date_observed).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 border-b bg-card shrink-0 shadow-sm flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Matching Sellers ({vendors.length})</span>
              <span>Sorted by {sortBy === "price" ? "Price" : sortBy === "nearest" ? "Distance" : sortBy === "reliability" ? "Reliability" : "Value Score"}</span>
            </div>
          )}

          {/* Scrolling List Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" onScroll={handleScroll}>
            {vendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <Package className="w-10 h-10 text-muted-foreground opacity-50" />
                <div>
                  <p className="font-bold text-sm">No vendors found</p>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1">
                    Expand your search area or clear active filters at the top header to discover stalls.
                  </p>
                </div>
              </div>
            ) : (
              vendors.map((vendor) => {
                const isSelected = selectedVendor?.id === vendor.id;
                const score = vendor.competitivenessScore;

                return (
                  <div
                    key={vendor.id}
                    onClick={() => handleSelectVendor(vendor)}
                    className={`flex items-start gap-4 p-4 rounded-xl border bg-card cursor-pointer transition-all shadow-sm ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/20 dark:bg-blue-900/10"
                        : "border-border/60 hover:border-blue-200 hover:shadow"
                    }`}
                  >
                    {/* Tiny Vendor Image or Icon */}
                    <div className="relative h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/20 overflow-hidden flex items-center justify-center shrink-0">
                      {vendor.imageUrl ? (
                        <Image
                          src={vendor.imageUrl}
                          alt={vendor.shopName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-blue-400" />
                      )}
                    </div>

                    {/* Vendor details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="font-bold text-sm leading-tight text-foreground truncate group-hover:text-blue-600">
                          {vendor.shopName}
                        </h4>
                        {vendor.verifiedStatus === "Verified" && (
                          <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {vendor.location}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{vendor.rating.toFixed(1)}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-2 py-0.5 rounded border-none font-bold ${
                            vendor.priceForSearchedItem
                              ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                              : score >= 8
                              ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                              : score >= 5
                              ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {vendor.priceForSearchedItem ? `Price: ${vendor.priceForSearchedItem} ETB` : `Score: ${score}/10`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isLoadingMore && (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
