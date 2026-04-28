"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeIcon(color: string, emoji: string) {
  return new L.DivIcon({
    className: "",
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:44px;height:44px;border-radius:50%;
        background:${color};border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
        font-size:20px;
      ">${emoji}</div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
}

interface Props {
  customerLat: number;
  customerLon: number;
  servicemanLat: number;
  servicemanLon: number;
  servicemanName: string;
  customerAddress: string;
  distanceKm: number;
}

export default function LiveMap({
  customerLat, customerLon,
  servicemanLat, servicemanLon,
  servicemanName, customerAddress, distanceKm
}: Props) {
  // Center map between both points
  const centerLat = (customerLat + servicemanLat) / 2;
  const centerLon = (customerLon + servicemanLon) / 2;

  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Customer pin — blue home */}
      <Marker position={[customerLat, customerLon]} icon={makeIcon("#2563eb", "🏠")}>
        <Popup>
          <p className="font-semibold text-sm">📍 Your Location</p>
          <p className="text-xs text-gray-500 mt-0.5">{customerAddress}</p>
        </Popup>
      </Marker>

      {/* Serviceman pin — orange wrench */}
      <Marker position={[servicemanLat, servicemanLon]} icon={makeIcon("#f97316", "🔧")}>
        <Popup>
          <p className="font-semibold text-sm">🔧 {servicemanName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{distanceKm} km away</p>
        </Popup>
      </Marker>

      {/* Dashed route line */}
      <Polyline
        positions={[[servicemanLat, servicemanLon], [customerLat, customerLon]]}
        pathOptions={{ color: "#2563eb", weight: 3, dashArray: "8 10", opacity: 0.7 }}
      />
    </MapContainer>
  );
}