"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, Clock } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

interface BusinessHourEntry {
  day: string;
  start: string;
  end: string;
}

interface LocationCardProps {
  address: string;
  region: string;
  lat?: number | null;
  lng?: number | null;
  deliveryRadius?: number;
  businessHours?: BusinessHourEntry[] | string | null;
}

export default function LocationCard({
  address,
  region,
  lat,
  lng,
  deliveryRadius = 5,
  businessHours,
}: LocationCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${address}, ${region}`
  )}`;

  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address}, ${region}`
  )}`;

  const hasCoords = lat != null && lng != null && lat !== 0 && lng !== 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-card shadow-sm space-y-0 pb-5 flex flex-col">
      {/* Map */}
      {hasCoords ? (
        <LeafletMiniMap lat={lat!} lng={lng!} />
      ) : (
        <MapMockup />
      )}

      {/* Address Details */}
      <div className="px-5 pt-4 space-y-4 flex flex-col">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              Shop Location
            </h4>
            <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-[10px] font-semibold border-none rounded-full px-2 py-0.5">
              Delivers within {deliveryRadius}km
            </Badge>
          </div>
          <p className="text-sm text-foreground leading-snug font-medium">
            {address}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {region}, Ethiopia
          </p>
        </div>

        {/* Business Hours Display */}
        {businessHours && (
          <BusinessHoursDisplay hours={businessHours} />
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold py-2 rounded-lg cursor-pointer"
          >
            <a href={searchUrl} target="_blank" rel="noopener noreferrer">
              View on Maps
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg gap-1.5 cursor-pointer"
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Leaflet Mini Map ----------
function LeafletMiniMap({ lat, lng }: { lat: number; lng: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (leafletMapRef.current) return;

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;
          background:#2563eb;
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      L.marker([lat, lng], { icon }).addTo(map);
      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div className="relative w-full h-48 border-b">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        // @ts-ignore
        precedence="default"
      />
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      <div className="absolute bottom-3 right-3 bg-background/90 border p-1.5 rounded-full shadow-md text-foreground">
        <Compass className="w-4 h-4" />
      </div>
    </div>
  );
}

// ---------- Mock Map (fallback when no coordinates) ----------
function MapMockup() {
  return (
    <div className="relative w-full h-48 bg-[#e5e9f0] dark:bg-[#1a2333] overflow-hidden flex items-center justify-center select-none border-b">
      <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
        <path d="M-20,100 C100,80 150,150 400,120 L400,200 L-20,200 Z" fill="rgba(59, 130, 246, 0.15)" className="dark:fill-blue-900/10" />
        <rect x="30" y="20" width="120" height="70" rx="10" fill="rgba(16, 185, 129, 0.12)" className="dark:fill-emerald-950/10" />
        <line x1="0" y1="50" x2="400" y2="50" stroke="var(--border)" strokeWidth="8" />
        <line x1="0" y1="50" x2="400" y2="50" stroke="white" strokeWidth="2" className="dark:stroke-slate-800" />
        <line x1="180" y1="0" x2="180" y2="200" stroke="var(--border)" strokeWidth="12" />
        <line x1="180" y1="0" x2="180" y2="200" stroke="white" strokeWidth="4" className="dark:stroke-slate-800" />
        <line x1="80" y1="0" x2="250" y2="200" stroke="var(--border)" strokeWidth="6" strokeDasharray="5,5" />
        <circle cx="90" cy="40" r="4" fill="rgba(156, 163, 175, 0.5)" />
        <circle cx="280" cy="120" r="4" fill="rgba(156, 163, 175, 0.5)" />
        <circle cx="210" cy="80" r="5" fill="rgba(59, 130, 246, 0.4)" />
      </svg>

      <div className="absolute flex flex-col items-center justify-center z-10">
        <span className="absolute inline-flex h-12 w-12 rounded-full bg-blue-500/20 animate-ping" />
        <div className="bg-blue-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 flex items-center justify-center">
          <MapPin className="w-5 h-5 fill-current" />
        </div>
      </div>

      <div className="absolute bottom-3 right-3 bg-background/90 border p-1.5 rounded-full shadow-md text-foreground hidden sm:block">
        <Compass className="w-4 h-4" />
      </div>

      <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-[10px] rounded-full whitespace-nowrap">
        No coordinates available
      </div>
    </div>
  );
}

// ---------- Business Hours Display ----------
function BusinessHoursDisplay({ hours }: { hours: BusinessHourEntry[] | string }) {
  // Handle legacy string format
  if (typeof hours === "string") {
    return (
      <div className="flex items-start gap-2 text-sm">
        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <span className="text-muted-foreground">{hours}</span>
      </div>
    );
  }

  if (!Array.isArray(hours) || hours.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
        Business Hours
      </h4>
      <div className="space-y-1">
        {hours.map((entry, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium w-24">{entry.day}</span>
            <span className="font-semibold text-foreground">
              {entry.start} – {entry.end}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
