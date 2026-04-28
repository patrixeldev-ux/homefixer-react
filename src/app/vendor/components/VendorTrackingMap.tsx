"use client";

import { useEffect, useRef } from "react";

interface Props {
  servicemanLat: number;
  servicemanLng: number;
  customerLat: number;
  customerLng: number;
}

export default function VendorTrackingMap({ servicemanLat, servicemanLng, customerLat, customerLng }: Props) {
  const mapRef     = useRef<any>(null);
  const markerRef  = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    import("leaflet").then(L => {
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current) {
        const map = L.default.map(containerRef.current!).setView(
          [(servicemanLat + customerLat) / 2, (servicemanLng + customerLng) / 2], 13
        );
        L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        const sIcon = L.default.divIcon({
          html: `<div style="background:#f97316;width:40px;height:40px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 3px 10px rgba(0,0,0,0.3)">🔧</div>`,
          iconSize: [40, 40], iconAnchor: [20, 20], className: ""
        });
        const vIcon = L.default.divIcon({
          html: `<div style="background:#f59e0b;width:40px;height:40px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 3px 10px rgba(0,0,0,0.3)">🏪</div>`,
          iconSize: [40, 40], iconAnchor: [20, 20], className: ""
        });

        markerRef.current = L.default.marker([servicemanLat, servicemanLng], { icon: sIcon })
          .addTo(map).bindPopup("<b>🔧 Serviceman</b><br>On the way to your store");

        L.default.marker([customerLat, customerLng], { icon: vIcon })
          .addTo(map).bindPopup("<b>🏪 Your Store</b>");

        L.default.polyline([[servicemanLat, servicemanLng], [customerLat, customerLng]], {
          color: "#f59e0b", weight: 3, dashArray: "6 8", opacity: 0.8
        }).addTo(map);

        map.fitBounds([[servicemanLat, servicemanLng], [customerLat, customerLng]], { padding: [40, 40] });
        mapRef.current = map;
      } else if (markerRef.current) {
        markerRef.current.setLatLng([servicemanLat, servicemanLng]);
      }
    });
  }, [servicemanLat, servicemanLng, customerLat, customerLng]);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </>
  );
}