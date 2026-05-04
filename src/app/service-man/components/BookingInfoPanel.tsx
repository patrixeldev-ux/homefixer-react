"use client";

import { FiNavigation, FiClock, FiMapPin, FiWifi, FiWifiOff, FiNavigation2, FiShoppingBag, FiCheckCircle } from "react-icons/fi";
import type { BookingTrackingData, JourneyStage } from "../../../hooks/useServicemanTracking";

interface BookingInfoPanelProps {
  booking: BookingTrackingData;
  stage: JourneyStage;
  mapFocus: "customer" | "vendor";
  distanceMeters: number | null;
  etaMinutes: number | null;
  isOnline: boolean;
  // Stage actions (moved here from StageController)
  hasVendor: boolean;
  completing: boolean;
  onStartJourney: () => void;
  onGoToVendor: () => void;
  onComplete: () => void;
}

function formatDistance(meters: number | null): string {
  if (meters === null) return "—";
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function BookingInfoPanel({
  booking,
  stage,
  mapFocus,
  distanceMeters,
  etaMinutes,
  isOnline,
  hasVendor,
  completing,
  onStartJourney,
  onGoToVendor,
  onComplete,
}: BookingInfoPanelProps) {
  const isComplete = stage === "COMPLETE";

  // Info section reflects whichever location the map is focused on
  const isViewingVendor = mapFocus === "vendor";
  const destinationName    = isViewingVendor ? (booking.vendor_name ?? "Vendor")    : booking.customer_name;
  const destinationAddress = isViewingVendor ? (booking.vendor_address ?? "")       : booking.customer_address;
  const destinationEmoji   = isViewingVendor ? "🏪" : "🏠";
  const destinationGrad    = isViewingVendor ? "from-amber-500 to-orange-500"       : "from-green-500 to-emerald-600";

  return (
    <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 px-4 pt-3 pb-5">
      {/* Drag handle */}
      <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

      {/* Destination row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${destinationGrad} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
          {destinationEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900 text-sm truncate">{destinationName}</p>
            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              isOnline ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
            }`}>
              {isOnline ? <FiWifi size={9} /> : <FiWifiOff size={9} />}
              {isOnline ? "Live" : "Offline"}
            </span>
          </div>
          {destinationAddress && (
            <div className="flex items-center gap-1 mt-0.5">
              <FiMapPin size={10} className="text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-500 truncate">{destinationAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!isComplete && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiNavigation size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{formatDistance(distanceMeters)}</p>
              <p className="text-xs text-slate-500">Distance</p>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiClock size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{etaMinutes !== null ? `${etaMinutes} min` : "—"}</p>
              <p className="text-xs text-slate-500">ETA</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage action button ── */}
      {stage === "TO_CUSTOMER" && (
        <button
          onClick={onStartJourney}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100"
        >
          <FiNavigation2 size={16} />
          Start Journey to Customer
        </button>
      )}

      {stage === "TO_VENDOR" && (
        <div className="space-y-2">
          {hasVendor ? (
            <button
              onClick={onGoToVendor}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-100"
            >
              <FiShoppingBag size={16} />
              Navigate to Vendor
            </button>
          ) : (
            <div className="w-full py-3 bg-slate-100 text-slate-400 font-semibold rounded-xl text-center text-sm">
              ⏳ Waiting for vendor assignment…
            </div>
          )}
          <button
            onClick={onComplete}
            disabled={completing}
            className="w-full py-2.5 border border-green-200 bg-green-50 hover:bg-green-100 disabled:opacity-50 text-green-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <FiCheckCircle size={15} />
            {completing ? "Completing…" : "Mark Service Complete"}
          </button>
        </div>
      )}

      {isComplete && (
        <div className="w-full py-3 bg-green-50 border border-green-200 text-green-700 font-bold rounded-xl text-center flex items-center justify-center gap-2">
          <FiCheckCircle size={16} />
          Service Completed ✓
        </div>
      )}

      {/* Live pulse */}
      {!isComplete && (
        <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          Updates every 4 seconds
        </p>
      )}
    </div>
  );
}
