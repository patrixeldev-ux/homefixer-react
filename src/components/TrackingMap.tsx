"use client";

import { useEffect, useRef } from "react";

interface Props {
  servicemanLat: number;
  servicemanLng: number;
  customerLat: number;
  customerLng: number;
}

export default function TrackingMap({ servicemanLat, servicemanLng, customerLat, customerLng }: Props) {
  const mapRef    = useRef<any>(null);
  const sMarkerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dynamically import leaflet (avoids SSR issues)
    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current && containerRef.current) {
        const center = [(servicemanLat + customerLat) / 2, (servicemanLng + customerLng) / 2] as [number, number];
        const map = L.map(containerRef.current).setView(center, 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        // Serviceman marker (blue)
        const sIcon = L.divIcon({
          html: `<div style="background:#2563eb;width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🔧</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: "",
        });

        // Customer marker (red)
        const cIcon = L.divIcon({
          html: `<div style="background:#dc2626;width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏠</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: "",
        });

        sMarkerRef.current = L.marker([servicemanLat, servicemanLng], { icon: sIcon })
          .addTo(map)
          .bindPopup("Serviceman");

        L.marker([customerLat, customerLng], { icon: cIcon })
          .addTo(map)
          .bindPopup("Your Location");

        // Route line
        L.polyline([[servicemanLat, servicemanLng], [customerLat, customerLng]], {
          color: "#2563eb",
          weight: 3,
          dashArray: "6, 8",
          opacity: 0.7,
        }).addTo(map);

        // Fit bounds to show both markers
        map.fitBounds([[servicemanLat, servicemanLng], [customerLat, customerLng]], {
          padding: [40, 40],
        });

        mapRef.current = map;
      } else if (mapRef.current && sMarkerRef.current) {
        // ✅ Smoothly update serviceman marker position (live tracking)
        sMarkerRef.current.setLatLng([servicemanLat, servicemanLng]);
      }
    });
  }, [servicemanLat, servicemanLng, customerLat, customerLng]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </>
  );
}