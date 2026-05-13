"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FiArrowLeft, FiStar, FiNavigation, FiClock, FiMapPin } from "react-icons/fi";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../components/TrackingMapView"), { ssr: false });

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Waiting for acceptance",   color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  ACCEPTED:  { label: "Serviceman is on the way", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  ONGOING:   { label: "Service in progress",      color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  COMPLETED: { label: "Service completed",        color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  CANCELLED: { label: "Booking cancelled",        color: "text-red-700",    bg: "bg-red-50 border-red-200" },
};

const STATUS_STEPS = ["PENDING", "ACCEPTED", "ONGOING", "COMPLETED"];

export default function MapsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const bookingId    = searchParams.get("booking");

  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const intervalRef             = useRef<any>(null);

  const fetchTracking = async () => {
    if (!bookingId) { setError("No booking selected."); setLoading(false); return; }
    try {
<<<<<<< HEAD
      const res = await api.get(`/booking/${bookingId}/track/`);
=======
      const res = await api.get(`/api/bookings/${bookingId}/track/`);
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      setTracking(res.data);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Tracking unavailable.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTracking();
    intervalRef.current = setInterval(fetchTracking, 10000);
    return () => clearInterval(intervalRef.current);
  }, [bookingId]);

  const cfg       = tracking ? (statusConfig[tracking.status] ?? statusConfig.PENDING) : null;
  const stepIndex = tracking ? STATUS_STEPS.indexOf(tracking.status) : 0;

  const customerLat  = tracking ? parseFloat(tracking.customer_lat)  : null;
  const customerLng  = tracking ? parseFloat(tracking.customer_long) : null;
  const servicemanLat = tracking ? parseFloat(tracking.serviceman_lat) : null;
  const servicemanLng = tracking ? parseFloat(tracking.serviceman_long) : null;

  return (
    <div className="relative h-screen w-full flex flex-col bg-slate-100 overflow-hidden">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">
          <FiArrowLeft size={18} className="text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-900 text-base">Live Tracking</h1>
          {tracking && <p className="text-xs text-slate-500">Booking #{tracking.booking_id}</p>}
        </div>
        {cfg && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        )}
      </div>

      {/* Map area */}
      <div className="flex-1 pt-[60px] pb-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-slate-200">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading map...</p>
            </div>
          </div>
        ) : error || !customerLat ? (
          <div className="h-full flex items-center justify-center bg-slate-200">
            <div className="text-center px-6">
              <p className="text-3xl mb-3">📡</p>
              <p className="text-slate-600 font-medium">{error || "Location unavailable"}</p>
              <button onClick={() => router.push("/customer/my-bookings")}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                My Bookings
              </button>
            </div>
          </div>
        ) : (
          <MapView
            servicemanLat={servicemanLat!}
            servicemanLng={servicemanLng!}
            customerLat={customerLat}
            customerLng={customerLng!}
            servicemanName={tracking?.serviceman_name || "Serviceman"}
            customerAddress={tracking?.customer_address || ""}
          />
        )}
      </div>

      {/* Bottom Card */}
      {tracking && !error && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 px-5 pt-4 pb-6">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

          {/* Serviceman row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
              {tracking.serviceman_name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-base">{tracking.serviceman_name}</p>
                <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <FiStar size={10} fill="currentColor" />
                  {Number(tracking.serviceman_rating || 0).toFixed(1)}
                </span>
              </div>
              {tracking.customer_address && (
                <div className="flex items-center gap-1 mt-0.5">
                  <FiMapPin size={11} className="text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-slate-500 truncate">{tracking.customer_address}</p>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-0.5">{cfg?.label}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between relative mb-4">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div className="absolute top-4 left-0 h-0.5 bg-blue-600 z-0 transition-all duration-700"
              style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }} />
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center z-10 relative">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex  ? "bg-blue-600 border-blue-600 text-white" :
                  i === stepIndex ? "bg-white border-blue-600 text-blue-600 shadow-md" :
                  "bg-white border-gray-300 text-gray-400"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <p className={`text-xs mt-1.5 font-medium ${i <= stepIndex ? "text-blue-700" : "text-gray-400"}`}>
                  {s[0] + s.slice(1).toLowerCase()}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiNavigation size={15} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{tracking.distance_km ?? "—"} km</p>
                <p className="text-xs text-slate-500">Distance</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiClock size={15} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{tracking.eta_minutes ?? "—"} min</p>
                <p className="text-xs text-slate-500">Arrival ETA</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Live · Updates every 10 seconds
          </p>
        </div>
      )}
    </div>
  );
}