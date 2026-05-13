"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiNavigation, FiClock, FiStar } from "react-icons/fi";
import api from "../../../lib/api";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("../components/VendorTrackingMap"), { ssr: false });

interface TrackingData {
  booking_id: number;
  status: string;
  booking_status?: string;
  serviceman_name: string;
  serviceman_rating: number;
  serviceman_lat: string;
  serviceman_long: string;
  customer_lat: string;
  customer_long: string;
  distance_km: number;
  eta_minutes: number;
}

interface ActiveOrder {
  id: number;
  booking: number;
  status: string;
  serviceman_name?: string;
  total_cost: string;
}

export default function VendorTrackingPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const bookingId    = searchParams.get("booking");

  const [data,    setData]    = useState<TrackingData | null>(null);
  const [error,   setError]   = useState("");
  const [orders,  setOrders]  = useState<ActiveOrder[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch accepted orders — exclude completed bookings
  useEffect(() => {
<<<<<<< HEAD
    api.get("/vendor/material-orders/")
=======
    api.get("/api/vendor/material-orders/")
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      .then(res => {
        const all: ActiveOrder[] = Array.isArray(res.data) ? res.data : [];
        // Only show ACCEPTED orders (not FULFILLED/COMPLETED/REJECTED)
        setOrders(all.filter(o => o.status === "ACCEPTED"));
      })
      .catch(() => {});
  }, []);

  const fetchTracking = async () => {
    if (!bookingId) return;
    try {
<<<<<<< HEAD
      const res = await api.get(`/booking/${bookingId}/track/`);
=======
      const res = await api.get(`/api/bookings/${bookingId}/track/`);
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      setData(res.data); setError("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Tracking unavailable");
    }
  };

  useEffect(() => {
    if (!bookingId) return;
    fetchTracking();
    intervalRef.current = setInterval(() => {
      // Stop polling once booking is completed
      if (data?.booking_status === "COMPLETED" || data?.status === "COMPLETED") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      fetchTracking();
    }, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [bookingId]);

  // No booking selected — show list of accepted orders
  if (!bookingId) {
    return (
      <div className="h-full flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviceman Tracking</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track servicemen heading to your store</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="font-bold text-gray-900">No active servicemen</p>
            <p className="text-gray-500 text-sm mt-1">Accepted orders will appear here for tracking</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4">
            {orders.map(order => (
              <div key={order.id}
                onClick={() => router.push(`/vendor/tracking?booking=${order.booking}`)}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all group overflow-hidden">
                <div className="h-1 -mx-5 -mt-5 mb-4 rounded-t-2xl bg-gradient-to-r from-orange-400 to-amber-400" />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">Booking #{order.booking}</p>
                    {order.serviceman_name && (
                      <p className="text-sm text-orange-600 font-medium mt-0.5">🔧 {order.serviceman_name}</p>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">ACCEPTED</span>
                </div>
                <p className="font-bold text-gray-900">₹{order.total_cost}</p>
                <button className="mt-3 w-full py-2.5 bg-orange-500 group-hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <FiNavigation size={14} /> Track Serviceman
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Booking selected — show map
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/vendor/tracking")}
          className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Serviceman Tracking</h1>
          <p className="text-gray-500 text-sm">Booking #{bookingId}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live · 10s
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm flex-1 flex flex-col items-center justify-center">
          <p className="text-4xl mb-3">📡</p>
          <p className="font-bold text-gray-900">Tracking unavailable</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Booking completed — stop tracking */}
          {(data.booking_status === "COMPLETED" || data.status === "COMPLETED") ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 text-3xl">✅</div>
              <p className="font-bold text-gray-900 text-xl mb-2">Booking Completed</p>
              <p className="text-gray-500 text-sm mb-6">The service has been completed and the booking is closed.</p>
              <button onClick={() => router.push("/vendor/tracking")}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
                ← Back to Tracking
              </button>
            </div>
          ) : (
          <>
          {/* Map */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 300 }}>
            <TrackingMap
              servicemanLat={parseFloat(data.serviceman_lat)}
              servicemanLng={parseFloat(data.serviceman_long)}
              customerLat={parseFloat(data.customer_lat)}
              customerLng={parseFloat(data.customer_long)}
            />
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-700 flex-shrink-0">
                {data.serviceman_name?.[0]?.toUpperCase() ?? "S"}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{data.serviceman_name}</p>
                <p className="text-sm text-orange-600 flex items-center gap-1">
                  <FiStar size={12} fill="currentColor" /> {Number(data.serviceman_rating).toFixed(1)} rating
                </p>
                <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  data.status === "ONGOING"  ? "bg-yellow-100 text-yellow-800" :
                  data.status === "ACCEPTED" ? "bg-green-100 text-green-800"  :
                  "bg-gray-100 text-gray-700"
                }`}>{data.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiNavigation size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{data.distance_km} km</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiClock size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{data.eta_minutes} min</p>
                  <p className="text-xs text-gray-500">ETA</p>
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </>
      )}
    </div>
  );
}
