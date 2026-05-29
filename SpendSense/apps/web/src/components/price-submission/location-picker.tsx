"use client";

import { MapPin, Navigation } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import { MARKETS_BY_REGION, CITIES } from "@/lib/constants/markets";
import { useGpsLocation } from "@/hooks/use-gps-location";
import { useEffect, useRef } from "react";

interface LocationPickerProps {
  city: string;
  marketLocation: string;
  onCityChange: (city: string) => void;
  onMarketChange: (market: string) => void;
  latitude: number | null;
  longitude: number | null;
  onLatitudeChange: (lat: number | null) => void;
  onLongitudeChange: (lng: number | null) => void;
  errors?: { city?: string; market?: string };
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  "Addis Ababa": [9.03, 38.74],
  "Dire Dawa": [9.60, 41.86],
  "Bahir Dar": [11.59, 37.39],
  "Hawassa": [7.05, 38.47],
  "Mekelle": [13.49, 39.47],
};

export function LocationPicker({
  city,
  marketLocation,
  onCityChange,
  onMarketChange,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  errors,
}: LocationPickerProps) {
  const { state, detect } = useGpsLocation();
  const markets = MARKETS_BY_REGION[city] ?? [];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const defaultCoords = CITY_COORDINATES[city] || [9.03, 38.74];

  // Sync GPS capture with local coordinates state
  useEffect(() => {
    if (state.status === "success") {
      onLatitudeChange(parseFloat(state.latitude.toFixed(6)));
      onLongitudeChange(parseFloat(state.longitude.toFixed(6)));
    }
  }, [state, onLatitudeChange, onLongitudeChange]);

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let map: any;
    let marker: any;

    import("leaflet").then((L) => {
      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialLat = latitude ?? defaultCoords[0];
      const initialLng = longitude ?? defaultCoords[1];

      map = L.map(mapContainerRef.current!, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Create draggable marker
      marker = L.marker([initialLat, initialLng], {
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      // Map click handler
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLatitudeChange(parseFloat(lat.toFixed(6)));
        onLongitudeChange(parseFloat(lng.toFixed(6)));
      });

      // Marker drag handler
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onLatitudeChange(parseFloat(position.lat.toFixed(6)));
        onLongitudeChange(parseFloat(position.lng.toFixed(6)));
      });
    });

    return () => {
      if (map) {
        map.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when lat/lng changes from inputs or GPS
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) return;

    marker.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude]);

  // Center map on city changes if coords are not set
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || latitude !== null || longitude !== null) return;

    const coords = CITY_COORDINATES[city] || [9.03, 38.74];
    marker.setLatLng(coords);
    map.setView(coords, 13);
  }, [city, latitude, longitude]);

  return (
    <div className="space-y-6">
      {/* Dynamic Map Styling imports */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        // @ts-ignore
        precedence="default"
      />

      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-[#616f89]">
          Market location <span className="text-red-500">*</span>
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs font-bold rounded-xl"
          onClick={detect}
          disabled={state.status === "loading"}
        >
          <Navigation className="size-3.5" />
          {state.status === "loading" ? "Detecting…" : "Use GPS"}
        </Button>
      </div>

      {state.status === "success" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Location captured ({state.latitude.toFixed(4)},{" "}
          {state.longitude.toFixed(4)}). Select or type the market name below.
        </p>
      )}
      {(state.status === "denied" || state.status === "unavailable") && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {state.message}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
            Region / City
          </Label>
          <select
            className="w-full rounded-lg border-none bg-[#f0f2f4] p-3 text-sm font-medium"
            value={city}
            onChange={(e) => {
              onCityChange(e.target.value);
              onMarketChange("");
            }}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors?.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>
        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
            Market / store
          </Label>
          {markets.length > 0 ? (
            <select
              className="w-full rounded-lg border-none bg-white p-3 text-sm font-medium shadow-sm"
              value={marketLocation}
              onChange={(e) => onMarketChange(e.target.value)}
            >
              <option value="">Select or type below…</option>
              {markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : null}
          <Input
            className="mt-2 border-none bg-white shadow-sm"
            placeholder="e.g. Merkato, Shola, custom market"
            value={marketLocation}
            onChange={(e) => onMarketChange(e.target.value)}
          />
          {errors?.market && (
            <p className="mt-1 text-sm text-red-600">{errors.market}</p>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-1">
          <MapPin size={16} className="text-[#135bec]" /> Map Coordinate Picker
        </h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
              Latitude
            </Label>
            <Input
              type="number"
              step="0.000001"
              className="border-none bg-white shadow-sm"
              placeholder="e.g. 9.030000"
              value={latitude ?? ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onLatitudeChange(isNaN(val) ? null : val);
              }}
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
              Longitude
            </Label>
            <Input
              type="number"
              step="0.000001"
              className="border-none bg-white shadow-sm"
              placeholder="e.g. 38.740000"
              value={longitude ?? ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onLongitudeChange(isNaN(val) ? null : val);
              }}
            />
          </div>
        </div>

        <div ref={mapContainerRef} className="h-64 w-full rounded-xl bg-slate-100 border border-slate-200" />
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-[#f0f2f4]/80 px-3 py-2 text-xs text-[#616f89]">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#135bec]" />
        <span>
          Click on the map to set coordinates, drag the pin, or enter them manually.
        </span>
      </div>
    </div>
  );
}
