"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../lib/api";

type Section = "active" | "completed" | "cancelled";
type BackendStatus = "pending" | "accepted" | "ongoing" | "completed" | "cancelled";

interface Booking {
  id: number;
  serviceman_name: string | null;
  service_name: string;
  service_icon: string | null;
  booking_date: string | null;
  booking_time: string | null;
  address: string;
  amount: string;
  status: BackendStatus;
  advance_payment_status: string;
  final_payment_status: string;
}

const statusConfig: Record<BackendStatus, { label: string; pill: string; progress: number }> = {
  pending:   { label: "Pending",    pill: "bg-yellow-100 text-yellow-700", progress: 25 },
  accepted:  { label: "Accepted",   pill: "bg-blue-100 text-blue-700",     progress: 50 },
  ongoing:   { label: "On the way", pill: "bg-indigo-100 text-indigo-700", progress: 75 },
  completed: { label: "Completed",  pill: "bg-green-100 text-green-700",   progress: 100 },
  cancelled: { label: "Cancelled",  pill: "bg-red-100 text-red-700",       progress: 100 },
};

const categoryIcons: Record<string, string> = {
  plumb: "🔧", electric: "⚡", carpen: "🪚", paint: "🎨",
  clean: "🧹", ac: "❄️", pest: "🐛", default: "🏠",
};

function getIcon(name: string) {
  const lower = (name || "").toLowerCase();
  const key = Object.keys(categoryIcons).find((k) => lower.includes(k));
  return categoryIcons[key || "default"];
}

function StatusPill({ status }: { status: BackendStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  return <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${cfg.pill}`}>{cfg.label}</span>;
}

function ProgressBar({ status }: { status: BackendStatus }) {
  const pct = statusConfig[status]?.progress ?? 25;
  const cancelled = status === "cancelled";
  return (
    <div className="w-full max-w-52">
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full transition-all ${cancelled ? "bg-red-400" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">Service progress</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-md animate-pulse">
      <div className="h-1 w-full bg-gray-200 rounded-t-2xl" />
      <div className="p-6 flex gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

function BookingSuccessModal({ serviceName, servicemanName, onClose }: {
  serviceName: string; servicemanName: string; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/45 flex items-center justify-center px-4"
      onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-emerald-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Booking Successful</p>
          <h2 className="mt-2 text-2xl font-bold">Your service is confirmed</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
            <p className="text-sm text-emerald-700">Service booked</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{serviceName || "Service request"}</p>
            <p className="text-sm text-slate-600 mt-2">Assigned professional: {servicemanName || "Your serviceman"}</p>
          </div>
          <p className="text-sm text-slate-500">
            You can track the booking status and serviceman progress from this page.
          </p>
          <button onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 transition">
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [section, setSection]               = useState<Section>("active");
  const [bookings, setBookings]             = useState<Booking[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successDetails, setSuccessDetails] = useState({ service: "Service request", pro: "your serviceman" });
  const [cancelling, setCancelling]         = useState(false);

  // Show success popup when redirected from booking
  useEffect(() => {
    if (searchParams.get("booked") === "1") {
      setSuccessDetails({
        service: searchParams.get("service") || "Service request",
        pro:     searchParams.get("pro")     || "your serviceman",
      });
      setShowSuccessPopup(true);
      window.history.replaceState({}, "", "/customer/my-bookings");
    }
  }, [searchParams]);

  // Fetch bookings whenever section changes
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/customer/bookings/", { params: { section } });
        const data = res.data;
        setBookings(Array.isArray(data) ? data : data.results ?? []);
      } catch {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [section]);

  const handleCancel = async (bookingId: number) => {
    setCancelling(true);
    try {
      await api.patch(`/api/booking/${bookingId}/cancel/`);
      setSelectedBooking(null);
      const res = await api.get("/api/customer/bookings/", { params: { section } });
      setBookings(Array.isArray(res.data) ? res.data : res.data.results ?? []);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  // Navigate to maps page with booking id
  const openTracking = (bookingId: number) => {
    router.push(`/customer/maps?booking=${bookingId}`);
  };

  const tabs: { key: Section; label: string }[] = [
    { key: "active",    label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8">

      {showSuccessPopup && (
        <BookingSuccessModal
          serviceName={successDetails.service}
          servicemanName={successDetails.pro}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1">Track your current services and review past requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setSection(tab.key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              section === tab.key
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
      )}

      {loading && (
        <div className="space-y-6">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-slate-700">No {section} bookings</p>
          {section === "active" && (
            <button onClick={() => router.push("/customer/booking")}
              className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Book a Service
            </button>
          )}
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const canTrack = booking.status === "accepted" || booking.status === "ongoing";

            return (
              <div key={booking.id}
                className="relative rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all">
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl" />
                <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 flex items-center justify-center rounded-xl bg-blue-100 text-2xl flex-shrink-0">
                      {booking.service_icon || getIcon(booking.service_name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{booking.service_name || "Service"}</h2>
                      {booking.serviceman_name && (
                        <p className="text-sm text-blue-600 font-medium mt-0.5">with {booking.serviceman_name}</p>
                      )}
                      <div className="mt-2 space-y-1 text-sm text-slate-500">
                        {booking.booking_date && <p>📅 {booking.booking_date}</p>}
                        {booking.booking_time && <p>⏰ {booking.booking_time}</p>}
                        {booking.address     && <p>📍 {booking.address}</p>}
                        {booking.amount      && <p>💰 ₹{booking.amount}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <StatusPill status={booking.status} />
                    <ProgressBar status={booking.status} />

                    {/* ── Track button — always shown for active, greyed out if not trackable ── */}
                    {section === "active" && (
                      <button
                        onClick={() => canTrack ? openTracking(booking.id) : undefined}
                        disabled={!canTrack}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                          canTrack
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                        title={canTrack ? "Track serviceman live" : "Available once serviceman accepts"}
                      >
                        📍 Track Serviceman
                        {!canTrack && <span className="text-xs opacity-60">(pending acceptance)</span>}
                      </button>
                    )}

                    <button
                      className="text-sm font-semibold text-blue-600 hover:underline"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Booking #{selectedBooking.id}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              {[
                ["Service",          selectedBooking.service_name],
                ["Serviceman",       selectedBooking.serviceman_name || "—"],
                ["Date",             selectedBooking.booking_date || "—"],
                ["Time",             selectedBooking.booking_time || "—"],
                ["Address",          selectedBooking.address || "—"],
                ["Amount",           selectedBooking.amount ? `₹${selectedBooking.amount}` : "—"],
                ["Advance Payment",  selectedBooking.advance_payment_status || "—"],
                ["Final Payment",    selectedBooking.final_payment_status || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status</span>
                <StatusPill status={selectedBooking.status} />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {(selectedBooking.status === "accepted" || selectedBooking.status === "ongoing") && (
                <button
                  onClick={() => { setSelectedBooking(null); openTracking(selectedBooking.id); }}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                  📍 Track Serviceman
                </button>
              )}
              {selectedBooking.status === "pending" && (
                <button
                  onClick={() => handleCancel(selectedBooking.id)}
                  disabled={cancelling}
                  className="w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50">
                  {cancelling ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
