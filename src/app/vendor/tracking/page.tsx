"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../lib/api";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("../components/VendorTrackingMap"), { ssr: false });

interface TrackingData {
  booking_id: number;
  status: string;
  serviceman_name: string;
  serviceman_rating: number;
  serviceman_lat: string;
  serviceman_long: string;
  customer_lat: string;
  customer_long: string;
  distance_km: number;
  eta_minutes: number;
}

export default function VendorTrackingPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const bookingId    = searchParams.get("booking");

  const [data, setData]   = useState<TrackingData | null>(null);
  const [error, setError] = useState("");
  const intervalRef       = useRef<any>(null);

  const fetchTracking = async () => {
    if (!bookingId) { setError("No booking ID provided"); return; }
    try {
      const res = await api.get(`/api/bookings/${bookingId}/track/`);
      setData(res.data);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Tracking unavailable");
    }
  };

  useEffect(() => {
    fetchTracking();
    intervalRef.current = setInterval(fetchTracking, 10000);
    return () => clearInterval(intervalRef.current);
  }, [bookingId]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Serviceman Tracking</h1>
            {bookingId && <p className="text-gray-500 text-sm">Booking #{bookingId}</p>}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live · 10s
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📡</p>
            <p className="font-bold text-gray-900">Tracking unavailable</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="h-80 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
              <TrackingMap
                servicemanLat={parseFloat(data.serviceman_lat)}
                servicemanLng={parseFloat(data.serviceman_long)}
                customerLat={parseFloat(data.customer_lat)}
                customerLng={parseFloat(data.customer_long)}
              />
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-700 flex-shrink-0">
                  {data.serviceman_name?.[0]?.toUpperCase() ?? "S"}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{data.serviceman_name}</p>
                  <p className="text-sm text-amber-600">⭐ {Number(data.serviceman_rating).toFixed(1)} rating</p>
                  <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    data.status === "ONGOING"  ? "bg-yellow-100 text-yellow-800" :
                    data.status === "ACCEPTED" ? "bg-green-100 text-green-800"  :
                    "bg-gray-100 text-gray-700"
                  }`}>{data.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-900">{data.distance_km} km</p>
                  <p className="text-xs text-gray-500 mt-0.5">Distance away</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-900">{data.eta_minutes} min</p>
                  <p className="text-xs text-gray-500 mt-0.5">Estimated arrival</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}