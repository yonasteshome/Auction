"use client";

import { VendorPriceComparisonResponse, PriceSubmissionResponse } from "@/types/api/product-details";
import { VendorComparisonCard } from "./vendor-comparison-card";
import { MapPin, Map, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { MapModal, MapPinData } from "@/components/shared/map-modal";

interface VendorComparisonTableProps {
  vendors: VendorPriceComparisonResponse[];
  submissions?: PriceSubmissionResponse[];
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  "Addis Ababa": [9.03, 38.74],
  "Dire Dawa": [9.60, 41.86],
  "Bahir Dar": [11.59, 37.39],
  "Hawassa": [7.05, 38.47],
  "Mekelle": [13.49, 39.47],
};

export function VendorComparisonTable({ vendors, submissions = [] }: VendorComparisonTableProps) {
  const [location, setLocation] = useQueryState("location", { shallow: false });
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapPins, setMapPins] = useState<MapPinData[]>([]);
  const [mapTitle, setMapTitle] = useState("Vendors Map");
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"vendors" | "community">("vendors");

  // Determine best price (price is a string from the backend)
  const prices = vendors.map(v => parseFloat(v.price)).filter(p => !isNaN(p));
  const bestPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Filter by location if set
  const filteredVendors = location
    ? vendors.filter(v => v.city.toLowerCase().includes(location.toLowerCase()))
    : vendors;

  const filteredSubmissions = location
    ? submissions.filter(s => s.city.toLowerCase().includes(location.toLowerCase()))
    : submissions;

  // Get unique cities for filter dropdown
  const cities = [...new Set([
    ...vendors.map(v => v.city),
    ...submissions.map(s => s.city)
  ])].sort();

  const handleViewAllVendorsMap = async () => {
    setMapTitle("Vendors Map");
    setIsMapLoading(true);
    setIsMapOpen(true);
    
    const pinsList: MapPinData[] = [];
    await Promise.all(
      filteredVendors.map(async (v) => {
        try {
          const res = await fetch(`/api/market/vendors/${v.vendor_id}/`);
          if (res.ok) {
            const data = await res.json();
            if (data.latitude && data.longitude) {
              pinsList.push({
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude),
                title: v.vendor_name,
                price: parseFloat(v.price).toFixed(2),
                details: `Location: ${v.city}, ${data.address || ""}\nRating: ${parseFloat(v.rating_avg).toFixed(1)} ★`
              });
              return;
            }
          }
        } catch (err) {
          console.error("Failed to fetch vendor coordinates", err);
        }

        // Fallback for individual vendor coordinates (approximate based on city name with small jitter)
        const coords = CITY_COORDINATES[v.city] || [9.03, 38.74];
        pinsList.push({
          lat: coords[0] + (Math.random() - 0.5) * 0.015,
          lng: coords[1] + (Math.random() - 0.5) * 0.015,
          title: v.vendor_name,
          price: parseFloat(v.price).toFixed(2),
          details: `Location: ${v.city} (Approximate)\nRating: ${parseFloat(v.rating_avg).toFixed(1)} ★`
        });
      })
    );

    setMapPins(pinsList);
    setIsMapLoading(false);
  };

  const handleViewSingleVendorMap = async (vendor: VendorPriceComparisonResponse) => {
    setMapTitle(`${vendor.vendor_name} Location`);
    setIsMapLoading(true);
    setIsMapOpen(true);

    let lat = 9.03;
    let lng = 38.74;
    let details = `Location: ${vendor.city} (Approximate)`;

    try {
      const res = await fetch(`/api/market/vendors/${vendor.vendor_id}/`);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          lat = parseFloat(data.latitude);
          lng = parseFloat(data.longitude);
          details = `Location: ${vendor.city}, ${data.address || ""}`;
        } else {
          const coords = CITY_COORDINATES[vendor.city] || [9.03, 38.74];
          lat = coords[0];
          lng = coords[1];
        }
      } else {
        const coords = CITY_COORDINATES[vendor.city] || [9.03, 38.74];
        lat = coords[0];
        lng = coords[1];
      }
    } catch (err) {
      const coords = CITY_COORDINATES[vendor.city] || [9.03, 38.74];
      lat = coords[0];
      lng = coords[1];
    }

    setMapPins([{
      lat,
      lng,
      title: vendor.vendor_name,
      price: parseFloat(vendor.price).toFixed(2),
      details: `${details}\nRating: ${parseFloat(vendor.rating_avg).toFixed(1)} ★`
    }]);
    setIsMapLoading(false);
  };

  const handleViewCommunityPriceMap = (submission: PriceSubmissionResponse) => {
    setMapTitle(`Community Price - ${submission.city}`);
    setIsMapOpen(true);
    const coords = CITY_COORDINATES[submission.city] || [9.03, 38.74];
    setMapPins([{
      lat: coords[0],
      lng: coords[1],
      title: `${submission.city} Average`,
      price: parseFloat(submission.average_price).toFixed(2),
      details: `Source: ${submission.source === 'crowdsourced' ? 'Community' : 'Official'}\nReports: ${submission.count}`
    }]);
  };

  const handleViewAllCommunityMap = () => {
    setMapTitle("Community Prices Map");
    setIsMapOpen(true);
    const pinsList: MapPinData[] = filteredSubmissions.map((sub) => {
      const coords = CITY_COORDINATES[sub.city] || [9.03, 38.74];
      return {
        lat: coords[0] + (Math.random() - 0.5) * 0.005, // minor jitter if multiple markers
        lng: coords[1] + (Math.random() - 0.5) * 0.005,
        title: `${sub.city} Average`,
        price: parseFloat(sub.average_price).toFixed(2),
        details: `Source: ${sub.source === 'crowdsourced' ? 'Community' : 'Official'}\nReports: ${sub.count}`
      };
    });
    setMapPins(pinsList);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            Vendor & Price Comparison
            {activeTab === "vendors" ? (
              <button 
                onClick={handleViewAllVendorsMap}
                disabled={isMapLoading}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 ml-3 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full transition-colors shrink-0 disabled:opacity-50"
              >
                {isMapLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Map className="w-3.5 h-3.5" />} View Map
              </button>
            ) : filteredSubmissions.length > 0 ? (
              <button 
                onClick={handleViewAllCommunityMap}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 ml-3 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full transition-colors shrink-0"
              >
                <Map className="w-3.5 h-3.5" /> View Map
              </button>
            ) : null}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 self-end">
          <label className="text-xs text-muted-foreground font-black uppercase tracking-wider">Filter Area:</label>
          <select 
            value={location || ""}
            onChange={(e) => setLocation(e.target.value || null)}
            className="border-slate-200 dark:border-slate-800 bg-background rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Locations</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 border-b pb-px">
        <button 
          onClick={() => setActiveTab("vendors")}
          className={cn(
            "pb-3 text-sm font-bold border-b-2 px-1 transition-all",
            activeTab === "vendors" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Vendor Prices ({filteredVendors.length})
        </button>
        <button 
          onClick={() => setActiveTab("community")}
          className={cn(
            "pb-3 text-sm font-bold border-b-2 px-1 transition-all",
            activeTab === "community" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Community Prices ({filteredSubmissions.length})
        </button>
      </div>

      {activeTab === "vendors" ? (
        filteredVendors.length === 0 ? (
          <div className="p-8 text-center border rounded-xl bg-card">
            <p className="text-muted-foreground">No vendors currently listing this item in your selected area.</p>
            <p className="text-sm text-muted-foreground mt-1">Expand search radius or check back later.</p>
          </div>
        ) : (
          <>
            {/* Mobile view: Cards */}
            <div className="grid grid-cols-1 md:hidden gap-4">
              {filteredVendors.map(vendor => (
                <VendorComparisonCard 
                  key={`${vendor.vendor_id}-${vendor.id}`} 
                  vendor={vendor} 
                  isBestPrice={parseFloat(vendor.price) === bestPrice}
                />
              ))}
            </div>

            {/* Desktop view: Table */}
            <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                  <tr>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-right">Price (ETB)</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Verified</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVendors.map((vendor) => {
                    const price = parseFloat(vendor.price);
                    const rating = parseFloat(vendor.rating_avg);
                    const isBest = price === bestPrice;
                    return (
                      <tr 
                        key={`${vendor.vendor_id}-${vendor.id}`}
                        className={cn(
                          "group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                          isBest && "bg-green-50/30 dark:bg-green-900/10"
                        )}
                      >
                        <td className="px-6 py-4 font-medium">
                          <Link href={`/vendors/${vendor.vendor_id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                            {vendor.vendor_name}
                            {isBest && (
                              <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                                Best Deal
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {vendor.city}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-base">
                          {price.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">ETB</span>
                        </td>
                        <td className="px-6 py-4">
                          {rating > 0 ? `${rating.toFixed(1)} ★` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {vendor.is_verified ? (
                            <span className="text-blue-600 font-medium text-xs">✓ Verified</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unverified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleViewSingleVendorMap(vendor)}
                              className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors" 
                              title="View on Map"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                            <Link 
                              href={`/vendors/${vendor.vendor_id}`}
                              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md font-medium text-xs transition-colors"
                            >
                              Go to Shop
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center border rounded-xl bg-card">
            <p className="text-muted-foreground">No community prices reported for this item in your selected area.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">City / Region</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Avg Price (ETB)</th>
                  <th className="px-6 py-4">Reports Count</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubmissions.map((submission) => {
                  const price = parseFloat(submission.average_price);
                  return (
                    <tr 
                      key={`${submission.item_id}-${submission.city}`}
                      className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="px-6 py-4 font-bold">
                        {submission.city}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          submission.source === 'crowdsourced' 
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" 
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        )}>
                          {submission.source === 'crowdsourced' ? 'Community' : 'Official'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-base">
                        {price.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">ETB</span>
                      </td>
                      <td className="px-6 py-4">
                        {submission.count} {submission.count === 1 ? 'report' : 'reports'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleViewCommunityPriceMap(submission)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center gap-1"
                            title="View on Map"
                          >
                            <MapPin className="w-3.5 h-3.5" /> View on Map
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      <MapModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        title={mapTitle} 
        pins={mapPins} 
      />
    </div>
  );
}
