"use client";

/**
 * RouteRenderer
 * -------------
 * Renders custom Leaflet markers and a dashed polyline route between
 * serviceman → destination (customer or vendor).
 *
 * Designed to be mounted INSIDE a Leaflet map instance via a ref.
 * All Leaflet objects are created imperatively to avoid react-leaflet
 * SSR issues in Next.js.
 */

import { useEffect, useRef } from "react";
import type { JourneyStage, LatLng } from "../../../hooks/useServicemanTracking";

interface RouteRendererProps {
  /** The Leaflet map instance (L.Map) */
  map: unknown;
  servicemanPos: LatLng;
  customerPos: LatLng;
  vendorPos?: LatLng | null;
  stage: JourneyStage;
  /** Which destination the map is currently focused on */
  mapFocus: "customer" | "vendor";
  servicemanName: string;
  customerName: string;
  vendorName?: string;
  /** Trigger map re-center on serviceman */
  recenterTrigger: number;
}

// ─── Marker HTML builders ──────────────────────────────────────────────────────

function servicemanMarkerHtml(name: string) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      <div style="
        background: linear-gradient(135deg,#1d4ed8,#2563eb);
        width:52px;height:52px;border-radius:50%;
        border:4px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:24px;
        box-shadow:0 4px 18px rgba(37,99,235,0.55);
        animation: pulse-blue 2s infinite;
      ">🔧</div>
      <div style="
        background:#1d4ed8;color:white;
        font-size:11px;font-weight:700;
        padding:3px 10px;border-radius:12px;
        margin-top:5px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        max-width:130px;overflow:hidden;text-overflow:ellipsis;
      ">${name}</div>
    </div>
  `;
}

function customerMarkerHtml(name: string) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      <div style="
        background:linear-gradient(135deg,#16a34a,#22c55e);
        width:48px;height:48px;border-radius:50%;
        border:4px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:22px;
        box-shadow:0 4px 14px rgba(22,163,74,0.5);
      ">🏠</div>
      <div style="
        background:#15803d;color:white;
        font-size:11px;font-weight:700;
        padding:3px 10px;border-radius:12px;
        margin-top:5px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        max-width:130px;overflow:hidden;text-overflow:ellipsis;
      ">${name}</div>
    </div>
  `;
}

function vendorMarkerHtml(name: string) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      <div style="
        background:linear-gradient(135deg,#d97706,#f59e0b);
        width:48px;height:48px;border-radius:50%;
        border:4px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:22px;
        box-shadow:0 4px 14px rgba(217,119,6,0.5);
      ">🏪</div>
      <div style="
        background:#b45309;color:white;
        font-size:11px;font-weight:700;
        padding:3px 10px;border-radius:12px;
        margin-top:5px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        max-width:130px;overflow:hidden;text-overflow:ellipsis;
      ">${name}</div>
    </div>
  `;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function RouteRenderer({
  map,
  servicemanPos,
  customerPos,
  vendorPos,
  stage,
  mapFocus,
  servicemanName,
  customerName,
  vendorName = "Vendor",
  recenterTrigger,
}: RouteRendererProps) {
  // Refs to Leaflet layer objects so we can update them without re-creating
  const sMarkerRef = useRef<unknown>(null);
  const cMarkerRef = useRef<unknown>(null);
  const vMarkerRef = useRef<unknown>(null);
  const polylineRef = useRef<unknown>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    // Dynamically import Leaflet (SSR-safe)
    import("leaflet").then((mod) => {
      const L = mod.default;

      const makeIcon = (html: string, size: [number, number], anchor: [number, number]) =>
        L.divIcon({ html, iconSize: size, iconAnchor: anchor, className: "" });

      const sIcon = makeIcon(servicemanMarkerHtml(servicemanName), [140, 80], [70, 52]);
      const cIcon = makeIcon(customerMarkerHtml(customerName), [140, 76], [70, 48]);
      const vIcon = makeIcon(vendorMarkerHtml(vendorName), [140, 76], [70, 48]);

      const mapInstance = map as ReturnType<typeof L.map>;

      if (!initializedRef.current) {
        // ── First render: create all markers ──────────────────────────────────
        sMarkerRef.current = L.marker(
          [servicemanPos.lat, servicemanPos.lng],
          { icon: sIcon, zIndexOffset: 1000 }
        ).addTo(mapInstance);

        cMarkerRef.current = L.marker(
          [customerPos.lat, customerPos.lng],
          { icon: cIcon }
        ).addTo(mapInstance);

        if (vendorPos) {
          vMarkerRef.current = L.marker(
            [vendorPos.lat, vendorPos.lng],
            { icon: vIcon }
          ).addTo(mapInstance);
        }

        // Initial polyline — use mapFocus to determine destination
        const dest = mapFocus === "vendor" && vendorPos ? vendorPos : customerPos;
        polylineRef.current = L.polyline(
          [
            [servicemanPos.lat, servicemanPos.lng],
            [dest.lat, dest.lng],
          ],
          { color: mapFocus === "vendor" ? "#f59e0b" : "#2563eb", weight: 4, dashArray: "10 12", opacity: 0.85 }
        ).addTo(mapInstance);

        // Fit bounds
        mapInstance.fitBounds(
          [
            [servicemanPos.lat, servicemanPos.lng],
            [dest.lat, dest.lng],
          ],
          { padding: [70, 70] }
        );

        initializedRef.current = true;
      } else {
        // ── Subsequent renders: smooth update ─────────────────────────────────

        // Move serviceman marker
        if (sMarkerRef.current) {
          (sMarkerRef.current as ReturnType<typeof L.marker>).setLatLng([
            servicemanPos.lat,
            servicemanPos.lng,
          ]);
          (sMarkerRef.current as ReturnType<typeof L.marker>).setIcon(sIcon);
        }

        // Update vendor marker if it appears for the first time
        if (vendorPos && !vMarkerRef.current) {
          vMarkerRef.current = L.marker(
            [vendorPos.lat, vendorPos.lng],
            { icon: vIcon }
          ).addTo(mapInstance);
        }

        // Update polyline based on mapFocus (independent of journey stage)
        const dest = mapFocus === "vendor" && vendorPos ? vendorPos : customerPos;
        if (polylineRef.current) {
          (polylineRef.current as ReturnType<typeof L.polyline>).setLatLngs([
            [servicemanPos.lat, servicemanPos.lng],
            [dest.lat, dest.lng],
          ]);
          // Blue for customer view, amber for vendor view
          (polylineRef.current as ReturnType<typeof L.polyline>).setStyle({
            color: mapFocus === "vendor" ? "#f59e0b" : "#2563eb",
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, servicemanPos, customerPos, vendorPos, stage, mapFocus]);

  // ── Pan map when focus toggle changes ─────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    import("leaflet").then((mod) => {
      const L = mod.default;
      const mapInstance = map as ReturnType<typeof L.map>;
      const dest = mapFocus === "vendor" && vendorPos ? vendorPos : customerPos;
      mapInstance.fitBounds(
        [
          [servicemanPos.lat, servicemanPos.lng],
          [dest.lat, dest.lng],
        ],
        { padding: [70, 70], animate: true }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapFocus]);

  // ── Re-center on serviceman ────────────────────────────────────────────────
  useEffect(() => {
    if (!map || !servicemanPos || recenterTrigger === 0) return;
    import("leaflet").then((mod) => {
      const L = mod.default;
      (map as ReturnType<typeof L.map>).flyTo(
        [servicemanPos.lat, servicemanPos.lng],
        15,
        { animate: true, duration: 1.2 }
      );
    });
  }, [recenterTrigger, map, servicemanPos]);

  // This component renders nothing — it's purely imperative
  return null;
}
