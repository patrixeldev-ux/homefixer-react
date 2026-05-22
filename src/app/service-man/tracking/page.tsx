"use client";

/**
 * /service-man/tracking
 * ---------------------
 * Lists active bookings (ACCEPTED / ONGOING) so the serviceman can
 * pick one and open the live tracking map for it.
 *
 * The actual map lives at /service-man/tracking/[id]
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMapPin, FiNavigation, FiClock, FiAlertCircle } from "react-icons/fi";
import api from "../../../lib/api";

interface Booking {
  id: number;
  status: string;
  problem_title: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_address: string | { address?: string } | null;
}

function formatAddress(addr: Booking["customer_address"]): string {
  if (!addr) return "Address not available";
  if (typeof addr === "string") return addr;
  return addr.address || "Address not available";
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function ServicemanTrackingIndexPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/serviceman/bookings/");
        const all: Booking[] = Array.isArray(res.data) ? res.data : res.data.results ?? [];
        // Only show bookings that can be tracked
        setBookings(all.filter(b => ["ACCEPTED", "ONGOING"].includes(b.status)));
      } catch {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusStyle: Record<string, { pill: string; label: string }> = {
    ACCEPTED: { pill: "bg-blue-100 text-blue-700",   label: "Accepted"    },
    ONGOING:  { pill: "bg-yellow-100 text-yellow-700", label: "In Progress" },
  };

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Select an active booking to open the tracking map
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-blue-800">
        <FiNavigation size={16} className="text-blue-500 flex-shrink-0" />
        <p>
          The map shows your live GPS position, the customer location, and the route between them.
          Once a vendor is assigned, you can also navigate to the vendor.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          <FiAlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FiMapPin size={28} className="text-gray-400" />
          </div>
          <p className="font-bold text-gray-900 text-lg">No active bookings</p>
          <p className="text-gray-500 text-sm mt-1">
            Tracking is available for accepted or in-progress bookings
          </p>
          <button
            onClick={() => router.push("/service-man/bookings")}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            View My Bookings
          </button>
        </div>
      )}

      {/* Booking cards */}
      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4">
          {bookings.map(b => {
            const cfg = statusStyle[b.status] ?? statusStyle.ACCEPTED;
            return (
              <div
                key={b.id}
                onClick={() => router.push(`/service-man/tracking/${b.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Top accent */}
                <div className={`h-1 w-full ${b.status === "ONGOING" ? "bg-yellow-400" : "bg-blue-500"}`} />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-lg">
                      🔧
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 capitalize group-hover:text-blue-700 transition-colors truncate">
                        {b.problem_title}
                      </h3>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.pill}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                    <p className="flex items-center gap-2">
                      <FiMapPin size={11} className="flex-shrink-0 text-gray-400" />
                      <span className="truncate">{formatAddress(b.customer_address)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiClock size={11} className="flex-shrink-0 text-gray-400" />
                      {b.scheduled_date} · {b.scheduled_time}
                    </p>
                  </div>

                  <button className="w-full py-2.5 bg-blue-600 group-hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <FiNavigation size={14} />
                    Open Tracking Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
