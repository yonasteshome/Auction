"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { useEffect, useRef } from "react";

export interface MapPinData {
  lat: number;
  lng: number;
  title: string;
  price?: string | number;
  details?: string;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  pins: MapPinData[];
  center?: [number, number];
  zoom?: number;
}

export function MapModal({ 
  isOpen, 
  onClose, 
  title = "View on Map", 
  pins, 
  center = [9.03, 38.74], 
  zoom = 12 
}: MapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !mapContainerRef.current) return;

    let map: any;
    let markersGroup: any;

    import("leaflet").then((L) => {
      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Calculate center based on pins if default center is provided
      const mapCenter = pins && pins.length === 1 ? [pins[0].lat, pins[0].lng] : center;

      map = L.map(mapContainerRef.current!, {
        center: mapCenter as any,
        zoom: zoom,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Add pins to map
      if (pins && pins.length > 0) {
        pins.forEach((pin) => {
          if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number' || isNaN(pin.lat) || isNaN(pin.lng)) {
            return;
          }
          const marker = L.marker([pin.lat, pin.lng])
            .addTo(markersGroup)
            .bindPopup(`
              <div class="p-1 font-sans text-slate-800">
                <h4 class="font-bold text-sm text-slate-900">${pin.title}</h4>
                ${pin.price ? `<p class="text-xs text-blue-600 font-extrabold mt-1">${pin.price} ETB</p>` : ""}
                ${pin.details ? `<p class="text-xs text-slate-500 mt-1">${pin.details}</p>` : ""}
              </div>
            `);
          
          if (pins.length === 1) {
            marker.openPopup();
          }
        });

        // If multiple pins, fit bounds
        if (pins.length > 1) {
          const validPins = pins.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng));
          if (validPins.length > 0) {
            const bounds = L.latLngBounds(validPins.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [40, 40] });
          }
        }
      }
    });

    return () => {
      if (map) {
        map.remove();
      }
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
    };
  }, [isOpen, pins, center, zoom]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white rounded-2xl">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          // @ts-ignore
          precedence="default"
        />
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-black">{title}</DialogTitle>
        </DialogHeader>
        <div className="w-full h-[450px] relative bg-slate-50">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
