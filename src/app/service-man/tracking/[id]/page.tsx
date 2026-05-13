"use client";

/**
 * /service-man/tracking/[id]
 * --------------------------
 * Serviceman live-tracking page.
 *
 * Route params:
 *   id — booking ID
 *
 * Query params:
 *   stage — optional initial stage override ("TO_VENDOR")
 *
 * This page is a thin shell that:
 *  1. Reads the booking ID from the URL
 *  2. Delegates all state to useServicemanTracking
 *  3. Renders error / permission / loading states
 *  4. Renders <LiveTracker> when ready
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FiAlertCircle, FiMapPin, FiWifiOff } from "react-icons/fi";
import { useServicemanTracking } from "../../../../hooks/useServicemanTracking";
import dynamic from "next/dynamic";

// LiveTracker uses Leaflet — must be client-only
const LiveTracker = dynamic(
  () => import("../../components/LiveTracker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Initializing map…</p>
        </div>
      </div>
    ),
  }
);

// ─── Error / state screens ─────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Loading booking…</p>
      </div>
    </div>
  );
}

function LocationDeniedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiMapPin size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Location Access Required
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Homefixer needs your location to show live tracking. Please enable
          location permissions in your browser settings and reload the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mb-3 transition-colors"
        >
          Reload Page
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

function OfflineScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiWifiOff size={28} className="text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">You're Offline</h2>
        <p className="text-slate-500 text-sm mb-6">
          Live tracking requires an internet connection. Your last known position
          is still visible on the map.
        </p>
        <button
          onClick={onBack}
          className="w-full py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

function ErrorScreen({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mb-3 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ServicemanTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;
  const initialStage = searchParams.get("stage");

  const tracking = useServicemanTracking(bookingId);

  // If a stage override was passed via query param, apply it once booking loads
  useEffect(() => {
    if (initialStage === "TO_VENDOR" && tracking.booking?.vendor_lat) {
      tracking.goToVendor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStage, tracking.booking]);

  const handleBack = () => router.push(`/service-man/booking/${bookingId}`);
  const handleRetry = () => window.location.reload();

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (tracking.loading) return <LoadingScreen />;

  // ── Location permission denied ───────────────────────────────────────────────
  if (tracking.locationPermission === "denied") {
    return <LocationDeniedScreen onBack={handleBack} />;
  }

  // ── API error (but not location error) ──────────────────────────────────────
  if (tracking.error && !tracking.booking) {
    return (
      <ErrorScreen
        message={tracking.error}
        onBack={handleBack}
        onRetry={handleRetry}
      />
    );
  }

  // ── Waiting for first GPS fix ────────────────────────────────────────────────
  if (!tracking.servicemanPos) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 px-6">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-semibold text-lg">
            Getting your location…
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Please allow location access when prompted.
          </p>
        </div>
      </div>
    );
  }

  // ── Offline fallback (still show map with last known position) ───────────────
  // We show the map but with an offline banner — handled inside LiveTracker via isOnline prop

  // ── Main tracking UI ─────────────────────────────────────────────────────────
  return <LiveTracker {...tracking} onBack={handleBack} />;
}
