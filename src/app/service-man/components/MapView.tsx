"use client";

/**
 * MapView
 * -------
 * Initializes a Leaflet map and exposes the map instance via a callback ref.
 * Uses CartoDB Voyager tiles (no API key required).
 *
 * Key fix: cleanup is synchronous — we store the Leaflet `Map` instance in a
 * ref and call `.remove()` directly in the cleanup function, avoiding the
 * "Map container is already initialized" error caused by React 18 strict mode
 * double-invoking effects before an async cleanup can finish.
 */

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { LatLng } from "../../../hooks/useServicemanTracking";

interface MapViewProps {
  center: LatLng;
  onMapReady: (map: unknown) => void;
  className?: string;
}

export default function MapView({ center, onMapReady, className = "" }: MapViewProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<LeafletMap | null>(null);
  const initializedRef = useRef(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    if (initializedRef.current) return; // guard against strict-mode double-invoke
    initializedRef.current = true;

    let map: LeafletMap | null = null;

    import("leaflet").then((mod) => {
      const L = mod.default;

      // If the container was already used (e.g. HMR), destroy the old instance
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const container = containerRef.current as any;
      if (container && container._leaflet_id) {
        // Leaflet stamps the container with _leaflet_id when initialized
        // Remove the old map cleanly before creating a new one
        try { container._leaflet_map?.remove(); } catch { /* ignore */ }
        delete container._leaflet_id;
      }

      if (!containerRef.current) return;

      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([center.lat, center.lng], 14);

      // Store reference on the container so we can clean it up synchronously
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (containerRef.current as any)._leaflet_map = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      setLeafletLoaded(true);
      onMapReady(map);
    });

    // Synchronous cleanup — runs before the next effect invocation
    return () => {
      initializedRef.current = false;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch { /* ignore */ }
        mapRef.current = null;
      }
      // Also clear the Leaflet stamp on the container so it can be reused
      if (containerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (containerRef.current as any)._leaflet_id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (containerRef.current as any)._leaflet_map;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />

      <style>{`
        @keyframes pulse-blue {
          0%, 100% { box-shadow: 0 4px 18px rgba(37,99,235,0.55); }
          50%       { box-shadow: 0 4px 28px rgba(37,99,235,0.9), 0 0 0 8px rgba(37,99,235,0.15); }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`w-full h-full ${className}`}
        style={{ minHeight: 0 }}
      />

      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Loading map…</p>
          </div>
        </div>
      )}
    </>
  );
}
