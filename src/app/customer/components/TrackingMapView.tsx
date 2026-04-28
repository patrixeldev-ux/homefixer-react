"use client";

import { useEffect, useRef } from "react";

interface Props {
  servicemanLat: number;
  servicemanLng: number;
  customerLat: number;
  customerLng: number;
  servicemanName: string;
  customerAddress: string;
}

export default function TrackingMapView({
  servicemanLat, servicemanLng, customerLat, customerLng,
  servicemanName, customerAddress
}: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<any>(null);
  const sMarkerRef    = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    import("leaflet").then(({ default: L }) => {
      // Fix default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current && containerRef.current) {
        const map = L.map(containerRef.current, { zoomControl: false }).setView(
          [(servicemanLat + customerLat) / 2, (servicemanLng + customerLng) / 2], 14
        );

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; OpenStreetMap &copy; CARTO"
        }).addTo(map);

        // ✅ Highly visible serviceman marker
        const sIcon = L.divIcon({
          html: `
            <div style="
              background: #2563eb;
              width: 48px; height: 48px;
              border-radius: 50%;
              border: 4px solid white;
              display: flex; align-items: center; justify-content: center;
              font-size: 22px;
              box-shadow: 0 4px 14px rgba(37,99,235,0.6);
            ">🔧</div>
            <div style="
              background: #1d4ed8;
              color: white;
              font-size: 11px;
              font-weight: bold;
              padding: 3px 8px;
              border-radius: 12px;
              margin-top: 4px;
              text-align: center;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">${servicemanName}</div>
          `,
          iconSize: [120, 70],
          iconAnchor: [60, 48],
          className: "",
        });

        // ✅ Highly visible customer marker
        const cIcon = L.divIcon({
          html: `
            <div style="
              background: #dc2626;
              width: 48px; height: 48px;
              border-radius: 50%;
              border: 4px solid white;
              display: flex; align-items: center; justify-content: center;
              font-size: 22px;
              box-shadow: 0 4px 14px rgba(220,38,38,0.6);
            ">🏠</div>
            <div style="
              background: #b91c1c;
              color: white;
              font-size: 11px;
              font-weight: bold;
              padding: 3px 8px;
              border-radius: 12px;
              margin-top: 4px;
              text-align: center;
              white-space: nowrap;
              max-width: 150px;
              overflow: hidden;
              text-overflow: ellipsis;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">Your Location</div>
          `,
          iconSize: [160, 70],
          iconAnchor: [80, 48],
          className: "",
        });

        sMarkerRef.current = L.marker([servicemanLat, servicemanLng], { icon: sIcon }).addTo(map);
        L.marker([customerLat, customerLng], { icon: cIcon }).addTo(map);

        L.polyline([[servicemanLat, servicemanLng], [customerLat, customerLng]], {
          color: "#3b82f6", weight: 3, dashArray: "8 10", opacity: 0.7,
        }).addTo(map);

        map.fitBounds([[servicemanLat, servicemanLng], [customerLat, customerLng]], {
          padding: [60, 60],
        });

        mapRef.current = map;
      } else if (sMarkerRef.current) {
        // Live update serviceman position
        sMarkerRef.current.setLatLng([servicemanLat, servicemanLng]);
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