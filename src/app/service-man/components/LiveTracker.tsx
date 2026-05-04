"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { FiArrowLeft, FiNavigation2 } from "react-icons/fi";
import type { TrackingState } from "../../../hooks/useServicemanTracking";
import BookingInfoPanel from "./BookingInfoPanel";

const MapView      = dynamic(() => import("./MapView"),      { ssr: false });
const RouteRenderer = dynamic(() => import("./RouteRenderer"), { ssr: false });

type MapFocus = "customer" | "vendor";

interface LiveTrackerProps extends TrackingState {
  onBack: () => void;
}

export default function LiveTracker({
  stage,
  servicemanPos,
  booking,
  distanceMeters,
  etaMinutes,
  isOnline,
  completing,
  recenterTrigger,
  startJourney,
  goToVendor,
  completeService,
  recenter,
  onBack,
}: LiveTrackerProps) {
  const [mapInstance, setMapInstance] = useState<unknown>(null);
  const [mapFocus, setMapFocus]       = useState<MapFocus>("customer");

  const handleMapReady = useCallback((map: unknown) => setMapInstance(map), []);

  if (!booking || !servicemanPos) return null;

  const vendorPos = booking.vendor_lat && booking.vendor_lng
    ? { lat: booking.vendor_lat, lng: booking.vendor_lng }
    : null;

  const hasVendor = !!vendorPos;

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-slate-100">

      {/* ── Top bar ──────────────────────────────────────────────────────────
          Contains: back button | title | toggle buttons | online badge
      ──────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center gap-2 px-3 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">

        {/* Back */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <FiArrowLeft size={18} className="text-slate-700" />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-900 text-sm leading-tight truncate">
            Live Tracking · #{booking.booking_id}
          </h1>
        </div>

        {/* ── Map focus toggle ── */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
          <button
            onClick={() => setMapFocus("customer")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-all ${
              mapFocus === "customer"
                ? "bg-green-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
            title="Show route to customer"
          >
            🏠 Customer
          </button>
          <div className="w-px bg-slate-200" />
          <button
            onClick={() => hasVendor && setMapFocus("vendor")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-all ${
              !hasVendor
                ? "bg-white text-slate-300 cursor-not-allowed"
                : mapFocus === "vendor"
                ? "bg-amber-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
            title={hasVendor ? "Show route to vendor" : "No vendor assigned yet"}
          >
            🏪 Vendor
          </button>
        </div>

        {/* Online badge */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${
          isOnline
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {isOnline ? "● Live" : "○ Off"}
        </span>
      </div>

      {/* ── Map — fills all space between top bar and bottom panel ─────────── */}
      {/* Bottom panel is ~220px */}
      <div className="absolute inset-0 top-[52px] bottom-[220px]">
        <MapView
          center={servicemanPos}
          onMapReady={handleMapReady}
          className="absolute inset-0"
        />

        {!!mapInstance && (
          <RouteRenderer
            map={mapInstance}
            servicemanPos={servicemanPos}
            customerPos={{ lat: booking.customer_lat, lng: booking.customer_lng }}
            vendorPos={vendorPos}
            stage={stage}
            mapFocus={mapFocus}
            servicemanName={booking.serviceman_name}
            customerName={booking.customer_name}
            vendorName={booking.vendor_name}
            recenterTrigger={recenterTrigger}
          />
        )}

        {/* Re-center button — bottom-right of map */}
        <button
          onClick={recenter}
          className="absolute bottom-4 right-4 z-[900] w-11 h-11 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
          aria-label="Re-center map on my location"
          title="Re-center on my location"
        >
          <FiNavigation2 size={18} className="text-blue-600" />
        </button>
      </div>

      {/* ── Bottom panel — info + stage action buttons ──────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000]">
        <BookingInfoPanel
          booking={booking}
          stage={stage}
          mapFocus={mapFocus}
          distanceMeters={distanceMeters}
          etaMinutes={etaMinutes}
          isOnline={isOnline}
          completing={completing}
          onStartJourney={startJourney}
          onGoToVendor={goToVendor}
          onComplete={completeService}
          hasVendor={hasVendor}
        />
      </div>
    </div>
  );
}
