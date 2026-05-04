"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface Booking {
  id: number;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  problem_title: string;
  customer_address: string | { address?: string } | null;
  service_charge: string;
  total_amount: string;
}

type Tab = "active" | "completed" | "cancelled";

const TAB_STATUSES: Record<Tab, string[]> = {
  active:    ["ACCEPTED", "ONGOING"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED"],
};

const TAB_LABELS: Record<Tab, string> = {
  active: "Active", completed: "Completed", cancelled: "Cancelled",
};

function formatAddress(addr: Booking["customer_address"]): string {
  if (!addr) return "Address not available";
  if (typeof addr === "string") return addr;
  return addr.address || "Address not available";
}

const STATUS_STYLE: Record<string, string> = {
  ACCEPTED:  "bg-green-100 text-green-800",
  ONGOING:   "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function BookingsPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<Tab>("active");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/service-man"); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/api/serviceman/bookings/");
      const all = Array.isArray(res.data) ? res.data : res.data.results ?? [];
      setBookings(all);
    } catch { console.error("Failed to fetch bookings"); }
    finally { setLoading(false); }
  };

  const filtered = bookings.filter(b => TAB_STATUSES[tab].includes(b.status));

  const counts = {
    active:    bookings.filter(b => TAB_STATUSES.active.includes(b.status)).length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
    cancelled: bookings.filter(b => b.status === "CANCELLED").length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 text-sm mt-0.5">All your service bookings in one place</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-full max-w-sm">
        {(["active", "completed", "cancelled"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {TAB_LABELS[t]}
            {counts[t] > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t ? "bg-white/30 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">
            {tab === "active" ? "🔧" : tab === "completed" ? "✅" : "❌"}
          </p>
          <p className="font-bold text-gray-900">No {TAB_LABELS[tab].toLowerCase()} bookings</p>
          <p className="text-gray-500 text-sm mt-1">They'll show up here when available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4">
          {filtered.map(b => (
            <div
              key={b.id}
              onClick={() => tab === "active" ? router.push(`/service-man/bookings/${b.id}`) : undefined}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all ${
                tab === "active" ? "cursor-pointer hover:shadow-md hover:border-blue-200 group" : ""
              }`}
            >
              {/* Top accent bar */}
              <div className={`h-1 -mx-5 -mt-5 mb-4 rounded-t-xl ${
                b.status === "ONGOING" ? "bg-yellow-400" :
                b.status === "ACCEPTED" ? "bg-green-500" :
                b.status === "COMPLETED" ? "bg-blue-500" : "bg-red-400"
              }`} />

              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className={`font-bold text-gray-900 capitalize leading-tight ${
                  tab === "active" ? "group-hover:text-blue-700 transition-colors" : ""
                }`}>
                  {b.problem_title}
                </h3>
                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLE[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {b.status}
                </span>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600">
                <p className="flex gap-2">
                  <span className="flex-shrink-0">📍</span>
                  <span className="line-clamp-1">{formatAddress(b.customer_address)}</span>
                </p>
                <p className="flex gap-2">
                  <span className="flex-shrink-0">📅</span>
                  <span>{b.scheduled_date} · {b.scheduled_time}</span>
                </p>
                <p className="flex gap-2">
                  <span className="flex-shrink-0">💰</span>
                  <span className="font-semibold text-gray-900">₹{b.total_amount}</span>
                </p>
              </div>

              {tab === "active" && (
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Booking #{b.id}</span>
                  <span className="text-blue-600 text-sm font-semibold group-hover:underline">
                    View Details →
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
