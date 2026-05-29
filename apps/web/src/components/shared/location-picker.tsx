"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Crosshair, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

// Default center: Addis Ababa
const DEFAULT_LAT = 9.005401;
const DEFAULT_LNG = 38.763611;

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  className = "",
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState(String(latitude ?? ""));
  const [manualLng, setManualLng] = useState(String(longitude ?? ""));
  const [mapReady, setMapReady] = useState(false);

  const initLat = latitude ?? DEFAULT_LAT;
  const initLng = longitude ?? DEFAULT_LNG;

  // Dynamically import Leaflet (client-only)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon paths (Leaflet + webpack issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (leafletMapRef.current) return; // already initialized

      const map = L.map(mapRef.current!, {
        center: [initLat, initLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom blue marker
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:32px;height:32px;
          background:#2563eb;
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([initLat, initLng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
        setManualLat(pos.lat.toFixed(6));
        setManualLng(pos.lng.toFixed(6));
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange(lat, lng);
        setManualLat(lat.toFixed(6));
        setManualLng(lng.toFixed(6));
      });

      leafletMapRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external lat/lng changes to the map
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !markerRef.current) return;
    if (latitude == null || longitude == null) return;
    markerRef.current.setLatLng([latitude, longitude]);
    leafletMapRef.current.setView([latitude, longitude], 15);
    setManualLat(String(latitude));
    setManualLng(String(longitude));
  }, [latitude, longitude, mapReady]);

  const panToLocation = (lat: number, lng: number) => {
    if (!leafletMapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    leafletMapRef.current.setView([lat, lng], 15);
    onChange(lat, lng);
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
  };

  const useDeviceLocation = () => {
    setGpsError(null);
    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        panToLocation(pos.coords.latitude, pos.coords.longitude);
        setIsLoadingGPS(false);
      },
      (err) => {
        setGpsError("Could not get your location. " + err.message);
        setIsLoadingGPS(false);
      },
      { timeout: 10000 }
    );
  };

  const applyManualCoords = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setGpsError("Invalid coordinates. Latitude: -90–90, Longitude: -180–180.");
      return;
    }
    setGpsError(null);
    panToLocation(lat, lng);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
        {/* Inject Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          // @ts-ignore
          precedence="default"
        />
        <div ref={mapRef} style={{ height: 280, width: "100%" }} />

        {/* GPS button overlay */}
        <button
          type="button"
          onClick={useDeviceLocation}
          disabled={isLoadingGPS}
          title="Use my current location"
          className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1e2330] border border-border rounded-lg shadow-md text-xs font-semibold text-foreground hover:bg-muted transition-all disabled:opacity-70"
        >
          {isLoadingGPS ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          )}
          Use My Location
        </button>

        {/* Tip overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1 bg-black/60 text-white text-[10px] rounded-full whitespace-nowrap pointer-events-none">
          Click on map or drag marker to set location
        </div>
      </div>

      {gpsError && (
        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {gpsError}
        </div>
      )}

      {/* Manual coordinate entry */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Latitude
          </Label>
          <Input
            type="number"
            step="0.000001"
            placeholder="e.g. 9.0054"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Longitude
          </Label>
          <Input
            type="number"
            step="0.000001"
            placeholder="e.g. 38.7636"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={applyManualCoords}
        className="gap-1.5 text-xs"
      >
        <MapPin className="w-3.5 h-3.5" />
        Apply Coordinates
      </Button>
    </div>
  );
}
