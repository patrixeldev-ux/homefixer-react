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
  problem_description: string;
  customer_address: string | { address?: string } | null;
  service_charge: string;
  platform_fee: string;
  total_amount: string;
  image_urls: string[];
}

function formatAddress(addr: Booking["customer_address"]): string {
  if (!addr) return "Address not available";
  if (typeof addr === "string") return addr;
  return addr.address || "Address not available";
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function UserRequestsPage() {
  const router = useRouter();
  const [bookings, setBookings]           = useState<Booking[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selected, setSelected]           = useState<Booking | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.replace("/service-man");
      return;
    }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/serviceman/bookings/");
      const all = Array.isArray(res.data) ? res.data : res.data.results ?? [];
      setBookings(all.filter((b: Booking) => b.status === "PENDING"));
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "accept" | "reject") => {
    setActionLoading(id);
    try {
      await api.patch(`/api/booking/${id}/action/`, { action });
      await fetchRequests();
      if (selected?.id === id) setSelected(null);
    } catch {
      alert(`Failed to ${action} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Requests</h1>
        <p className="text-gray-500 text-sm mt-1">
          New bookings waiting for your response
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="max-w-2xl space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && bookings.length === 0 && (
        <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <p className="font-bold text-gray-900 text-lg">No pending requests</p>
          <p className="text-gray-500 text-sm mt-1">New customer requests will appear here</p>
        </div>
      )}

      {/* Cards */}
      {!loading && bookings.length > 0 && (
        <div className="max-w-2xl space-y-4">
          {bookings.map(b => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />

              <div className="p-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-lg">
                      🔧
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 capitalize leading-tight">
                        {b.problem_title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">
                        {b.problem_description}
                      </p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                    PENDING
                  </span>
                </div>

                {/* Info */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-4">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="flex-shrink-0">📍</span>
                    <span className="line-clamp-1">{formatAddress(b.customer_address)}</span>
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <span>📅</span>
                    <span>{b.scheduled_date} · {b.scheduled_time}</span>
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <span>💰</span>
                    <span>
                      ₹{b.service_charge} service charge
                      <span className="text-gray-400 ml-1">+ ₹{b.platform_fee} platform fee</span>
                    </span>
                  </p>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-sm text-gray-500">Total Earnings</span>
                  <span className="font-bold text-blue-700 text-base">₹{b.total_amount}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(b.id, "accept")}
                    disabled={actionLoading === b.id}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    {actionLoading === b.id
                      ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : "✓ Accept"
                    }
                  </button>
                  <button
                    onClick={() => handleAction(b.id, "reject")}
                    disabled={actionLoading === b.id}
                    className="flex-1 py-2.5 bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 font-bold rounded-xl text-sm transition-colors border border-red-200"
                  >
                    ✕ Reject
                  </button>
                  <button
                    onClick={() => setSelected(b)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    ···
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Booking #{selected.id}</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm mb-5">
                {[
                  ["Problem",     selected.problem_title],
                  ["Description", selected.problem_description],
                  ["Address",     formatAddress(selected.customer_address)],
                  ["Scheduled",   `${selected.scheduled_date} at ${selected.scheduled_time}`],
                  ["Service Charge", `₹${selected.service_charge}`],
                  ["Platform Fee",   `₹${selected.platform_fee}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-gray-500 w-32 flex-shrink-0">{label}</span>
                    <span className="text-gray-900 font-medium capitalize">{value}</span>
                  </div>
                ))}
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <span className="text-gray-500 w-32 flex-shrink-0 font-semibold">Total</span>
                  <span className="text-blue-700 font-bold text-base">₹{selected.total_amount}</span>
                </div>
              </div>

              {selected.image_urls?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Problem Photos</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selected.image_urls.map((url, i) => (
                      <img key={i} src={url} alt="issue"
                        className="w-20 h-20 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(selected.id, "accept")}
                  disabled={actionLoading === selected.id}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => handleAction(selected.id, "reject")}
                  disabled={actionLoading === selected.id}
                  className="flex-1 py-3 bg-white hover:bg-red-50 text-red-600 font-bold rounded-xl text-sm border border-red-200 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}