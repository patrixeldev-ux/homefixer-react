"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  // Advance payment (visiting charge + platform fee)
  amount: string;           // advance amount paid
  service_charge: string | null;
  platform_fee: string | null;
  // Final payment (materials)
  final_amount: string | null;
  total_amount: string | null;
  material_cost: string | null;
  // Grand total
  grand_total: string | null;
  status: BackendStatus;
  advance_payment_status: string;
  final_payment_status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<BackendStatus, { label: string; pill: string; progress: number }> = {
  pending:   { label: "Pending",     pill: "bg-yellow-100 text-yellow-700", progress: 25  },
  accepted:  { label: "Accepted",    pill: "bg-blue-100 text-blue-700",     progress: 50  },
  ongoing:   { label: "On the way",  pill: "bg-indigo-100 text-indigo-700", progress: 75  },
  completed: { label: "Completed",   pill: "bg-green-100 text-green-700",   progress: 100 },
  cancelled: { label: "Cancelled",   pill: "bg-red-100 text-red-700",       progress: 100 },
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
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${cfg.pill}`}>
      {cfg.label}
    </span>
  );
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

// ─── Resolve final amount from whichever field backend returns ───────────────

function resolveFinalAmount(b: Booking): string | null {
  return b.final_amount || b.total_amount || b.material_cost || null;
}

function fmt(v: string | null | undefined): string {
  if (!v || v === "0" || v === "0.00") return "—";
  return `₹${parseFloat(v).toFixed(2)}`;
}

// ─── Bill component — used both before payment and in completed history ───────

function ServiceBill({ booking, mode, onPay, onClose, paying }: {
  booking: Booking;
  /** "pay" = pre-payment confirmation, "history" = completed booking receipt */
  mode: "pay" | "history";
  onPay?: () => void;
  onClose: () => void;
  paying?: boolean;
}) {
  const finalAmt     = resolveFinalAmount(booking);
  const serviceChg   = booking.service_charge;
  const platformFee  = booking.platform_fee;
  const materialCost = finalAmt;

  // Advance subtotal = service charge + platform fee
  const advanceSubtotal = (() => {
    const s = parseFloat(serviceChg  || "0");
    const p = parseFloat(platformFee || "0");
    return (s + p) > 0 ? (s + p).toFixed(2) : null;
  })();

  // Grand total = advance subtotal + final payment
  const grandTotal = (() => {
    const a = parseFloat(advanceSubtotal || "0");
    const f = parseFloat(finalAmt        || "0");
    if (a > 0 && f > 0) return (a + f).toFixed(2);
    if (a > 0) return a.toFixed(2);
    return null;
  })();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`px-6 py-5 text-white ${mode === "pay" ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-gradient-to-r from-green-600 to-emerald-600"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                {mode === "pay" ? "Final Payment" : "Payment Receipt"}
              </p>
              <h2 className="text-xl font-bold mt-0.5">{booking.service_name || "Service"}</h2>
              <p className="text-white/80 text-sm mt-0.5">
                Booking #{booking.id}
                {booking.serviceman_name ? ` · ${booking.serviceman_name}` : ""}
              </p>
            </div>
            {mode === "history" && (
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">✅</div>
            )}
          </div>
        </div>

        {/* Bill */}
        <div className="p-6">
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5">
            {/* Bill header */}
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Charges Breakdown</p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Advance payment section */}
              <div className="px-4 py-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Advance Payment (Paid)</p>
                {serviceChg && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Service charge</span>
                    <span className="font-medium text-slate-800">{fmt(serviceChg)}</span>
                  </div>
                )}
                {platformFee && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Platform fee</span>
                    <span className="font-medium text-slate-800">{fmt(platformFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold mt-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-slate-700">Advance subtotal</span>
                  <span className={`${mode === "history" ? "text-green-700" : "text-slate-800"}`}>
                    {fmt(advanceSubtotal)} {mode === "history" && <span className="text-xs font-normal text-green-600 ml-1">✓ Paid</span>}
                  </span>
                </div>
              </div>

              {/* Final payment section */}
              {materialCost && (
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Final Payment {mode === "history" ? "(Paid)" : "(Due Now)"}
                  </p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Material cost</span>
                    <span className="font-medium text-slate-800">{fmt(materialCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-1.5 pt-1.5 border-t border-slate-100">
                    <span className="text-slate-700">Final subtotal</span>
                    <span className={mode === "pay" ? "text-orange-600" : "text-green-700"}>
                      {fmt(materialCost)} {mode === "history" && <span className="text-xs font-normal text-green-600 ml-1">✓ Paid</span>}
                    </span>
                  </div>
                </div>
              )}

              {/* Grand total */}
              {grandTotal && (
                <div className="px-4 py-3 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Grand Total</span>
                    <span className={`text-xl font-black ${mode === "pay" ? "text-orange-600" : "text-green-700"}`}>
                      ₹{grandTotal}
                    </span>
                  </div>
                  {mode === "pay" && materialCost && (
                    <p className="text-xs text-slate-500 mt-1">
                      You already paid {fmt(advanceSubtotal)} advance. Paying {fmt(materialCost)} now.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking meta */}
          <div className="text-xs text-slate-500 space-y-1 mb-5">
            {booking.booking_date && <p>📅 {booking.booking_date}{booking.booking_time ? ` · ${booking.booking_time}` : ""}</p>}
            {booking.address && <p className="truncate">📍 {booking.address}</p>}
          </div>

          {mode === "pay" ? (
            <>
              <p className="text-slate-400 text-xs text-center mb-4">
                Payment processed securely via Razorpay
              </p>
              <div className="flex gap-3">
                <button onClick={onClose} disabled={paying}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition text-sm">
                  Cancel
                </button>
                <button onClick={onPay} disabled={paying}
                  className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2">
                  {paying
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening…</>
                    : <>💳 Pay {fmt(materialCost || finalAmt)}</>
                  }
                </button>
              </div>
            </>
          ) : (
            <button onClick={onClose}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-sm">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

async function openRazorpayFinalPayment(bookingId: number): Promise<void> {
  // Step 1: Create payment intent for final stage
  const intentRes = await api.post(
    `/api/booking/${bookingId}/payment/create-intent/`,
    { stage: "final", gateway: "razorpay" }
  );
  const { order_id, amount, key } = intentRes.data;

  // Step 2: Open Razorpay checkout
  return new Promise<void>((resolve, reject) => {
    const options = {
      key,
      amount,
      currency: "INR",
      name: "HomeFixer",
      description: `Final payment for booking #${bookingId}`,
      order_id,
      handler: async (response: Record<string, string>) => {
        try {
          // Step 3: Verify
          await api.post(`/api/booking/${bookingId}/payment/razorpay/verify/`, {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          resolve();
        } catch {
          reject(new Error("Payment verification failed"));
        }
      },
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      theme: { color: "#2563eb" },
    };

    const launch = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Razorpay) {
      launch();
    } else {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = launch;
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    }
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [section,          setSection]          = useState<Section>("active");
  const [bookings,         setBookings]         = useState<Booking[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [selectedBooking,  setSelectedBooking]  = useState<Booking | null>(null);
  const [loadingDetail,    setLoadingDetail]    = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successDetails,   setSuccessDetails]   = useState({ service: "Service request", pro: "your serviceman" });
  const [cancelling,       setCancelling]       = useState(false);
  const [payingId,         setPayingId]         = useState<number | null>(null);
  const [payError,         setPayError]         = useState<Record<number, string>>({});
  // Pre-payment summary modal
  const [payingSummary,    setPayingSummary]    = useState<Booking | null>(null);
  // Bill receipt for completed bookings
  const [billBooking,      setBillBooking]      = useState<Booking | null>(null);
  // Tab counts for badge display
  const [tabCounts,        setTabCounts]        = useState<Record<Section, number>>({ active: 0, completed: 0, cancelled: 0 });

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

  // Also fetch counts for all tabs so we can show badges
  const fetchAllCounts = async () => {
    try {
      const [a, c, x] = await Promise.all([
        api.get("/api/customer/bookings/", { params: { section: "active" } }),
        api.get("/api/customer/bookings/", { params: { section: "completed" } }),
        api.get("/api/customer/bookings/", { params: { section: "cancelled" } }),
      ]);
      const count = (r: { data: unknown }) => {
        const d = r.data;
        return Array.isArray(d) ? d.length : (d as { results?: unknown[] }).results?.length ?? 0;
      };
      setTabCounts({ active: count(a), completed: count(c), cancelled: count(x) });
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchBookings(); }, [section]);

  // Fetch counts once on mount and after any mutation
  useEffect(() => { fetchAllCounts(); }, []);

  const handleCancel = async (bookingId: number) => {
    setCancelling(true);
    try {
      await api.patch(`/api/booking/${bookingId}/cancel/`);
      setSelectedBooking(null);
      fetchBookings();
      fetchAllCounts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail || "Could not cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  // Show summary modal first, then open Razorpay on confirm
  const initiatePayment = async (booking: Booking) => {
    // Fetch full booking detail to get final_amount, service_charge, platform_fee
    try {
      const res = await api.get(`/api/booking/${booking.id}/details/`);
      const d = res.data;
      const enriched: Booking = {
        ...booking,
        service_charge:  d.service_charge  || booking.service_charge,
        platform_fee:    d.platform_fee    || booking.platform_fee,
        final_amount:    d.final_amount    || d.total_amount  || d.material_cost || booking.final_amount,
        total_amount:    d.total_amount    || booking.total_amount,
        material_cost:   d.material_cost   || booking.material_cost,
        grand_total:     d.grand_total     || booking.grand_total,
      };
      setPayingSummary(enriched);
    } catch {
      setPayingSummary(booking);
    }
  };

  // Open detail modal — fetch full booking data first so all fields are populated
  const openDetail = async (booking: Booking) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/booking/${booking.id}/details/`);
      const d = res.data;

      // Infer advance_payment_status: if booking is completed or final is paid,
      // advance must have been paid even if backend still says "pending"
      const inferredAdvanceStatus =
        booking.status === "completed" ||
        booking.final_payment_status === "paid" ||
        d.advance_payment_status === "paid"
          ? "paid"
          : (d.advance_payment_status ?? booking.advance_payment_status);

      setSelectedBooking({
        ...booking,
        // service_charge and platform_fee from detail endpoint, fall back to
        // splitting the advance amount if not available
        service_charge:  d.service_charge  ?? booking.service_charge,
        platform_fee:    d.platform_fee    ?? booking.platform_fee,
        final_amount:    d.final_amount    ?? d.total_amount ?? d.material_cost ?? booking.final_amount,
        total_amount:    d.total_amount    ?? booking.total_amount,
        material_cost:   d.material_cost   ?? booking.material_cost,
        grand_total:     d.grand_total     ?? booking.grand_total,
        advance_payment_status: inferredAdvanceStatus,
        final_payment_status:   d.final_payment_status   ?? booking.final_payment_status,
        status: (d.status?.toLowerCase() ?? booking.status) as typeof booking.status,
      });
    } catch {
      setSelectedBooking(booking);
    } finally {
      setLoadingDetail(false);
    }
  };

  // View bill for completed booking
  const viewBill = async (booking: Booking) => {
    try {
      const res = await api.get(`/api/booking/${booking.id}/details/`);
      const d = res.data;
      setBillBooking({
        ...booking,
        service_charge:  d.service_charge  || booking.service_charge,
        platform_fee:    d.platform_fee    || booking.platform_fee,
        final_amount:    d.final_amount    || d.total_amount  || d.material_cost || booking.final_amount,
        total_amount:    d.total_amount    || booking.total_amount,
        material_cost:   d.material_cost   || booking.material_cost,
        grand_total:     d.grand_total     || booking.grand_total,
      });
    } catch {
      setBillBooking(booking);
    }
  };

  const handleFinalPayment = async (booking: Booking) => {
    setPayingSummary(null);
    setPayingId(booking.id);
    setPayError(prev => ({ ...prev, [booking.id]: "" }));
    try {
      await openRazorpayFinalPayment(booking.id);
      setSelectedBooking(null);
      setSection("completed");
      fetchAllCounts();
    } catch (err: unknown) {
      const e = err as Error;
      const msg = e.message === "Payment cancelled"
        ? "Payment was cancelled."
        : e.message || "Payment failed. Please try again.";
      setPayError(prev => ({ ...prev, [booking.id]: msg }));
    } finally {
      setPayingId(null);
    }
  };

  const openTracking = (bookingId: number) => {
    router.push(`/customer/maps?booking=${bookingId}`);
  };

  const tabs: { key: Section; label: string }[] = [
    { key: "active",    label: "Active"    },
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1">Track your current services and review past requests</p>
        </div>
        <button
          onClick={() => { fetchBookings(); fetchAllCounts(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setSection(tab.key)}
            className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition ${
              section === tab.key
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}>
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                section === tab.key
                  ? "bg-white/30 text-white"
                  : tab.key === "completed" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
              }`}>
                {tabCounts[tab.key]}
              </span>
            )}
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
            const canTrack    = booking.status === "accepted" || booking.status === "ongoing";
            // Final payment is due when:
            // - final_payment_status is "pending" AND
            // - booking is ongoing or completed (serviceman has marked done)
            // We do NOT require advance_payment_status === "paid" because
            // the backend may not update that field correctly
            const needsFinalPay =
              booking.final_payment_status === "pending" &&
              (booking.status === "ongoing" || booking.status === "completed");
            const finalPaid     = booking.final_payment_status === "paid";
            const isPaying      = payingId === booking.id;
            const thisPayErr    = payError[booking.id];

            return (
              <div key={booking.id}
                className="relative rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all">

                {/* Top accent — orange when final payment needed */}
                <div className={`h-1 w-full rounded-t-2xl ${
                  needsFinalPay
                    ? "bg-gradient-to-r from-orange-400 to-amber-400"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`} />

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
                        {booking.address      && <p>📍 {booking.address}</p>}
                        {booking.amount       && <p>💰 ₹{booking.amount}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-start lg:items-end gap-3">
                    {/* Override status pill when awaiting final payment */}
                    {needsFinalPay
                      ? <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          Service Done — Pay Now
                        </span>
                      : <StatusPill status={booking.status} />
                    }
                    <ProgressBar status={booking.status} />

                    {/* Track button — hide when job is done */}
                    {section === "active" && !needsFinalPay && (
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

                    {/* ── Final payment button ── */}
                    {needsFinalPay && (
                      <div className="w-full lg:w-auto">
                        <button
                          onClick={() => initiatePayment(booking)}
                          disabled={isPaying}
                          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition shadow-md shadow-orange-100 w-full lg:w-auto justify-center"
                        >
                          {isPaying
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                            : <>💳 Pay Final Amount{resolveFinalAmount(booking) ? ` ₹${resolveFinalAmount(booking)}` : ""}</>
                          }
                        </button>
                        {thisPayErr && (
                          <p className="text-red-500 text-xs mt-1 text-right">{thisPayErr}</p>
                        )}
                      </div>
                    )}

                    {/* Final paid badge + view bill */}
                    {finalPaid && (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                          ✓ Final payment done
                        </span>
                        <button
                          onClick={() => viewBill(booking)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          🧾 View Bill
                        </button>
                      </div>
                    )}

                    <button
                      className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      onClick={() => openDetail(booking)}
                      disabled={loadingDetail}
                    >
                      {loadingDetail ? (
                        <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : null}
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Payment Summary Modal (pre-payment bill) ── */}
      {payingSummary && (
        <ServiceBill
          booking={payingSummary}
          mode="pay"
          paying={payingId === payingSummary.id}
          onPay={() => handleFinalPayment(payingSummary)}
          onClose={() => setPayingSummary(null)}
        />
      )}

      {/* ── Completed booking bill receipt ── */}
      {billBooking && (
        <ServiceBill
          booking={billBooking}
          mode="history"
          onClose={() => setBillBooking(null)}
        />
      )}

      {/* ── Detail Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Booking #{selectedBooking.id}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>

            <div className="space-y-2 text-sm text-slate-700 mb-5">
              {([
                ["Service",          selectedBooking.service_name],
                ["Serviceman",       selectedBooking.serviceman_name || "—"],
                ["Date",             selectedBooking.booking_date || "—"],
                ["Time",             selectedBooking.booking_time || "—"],
                ["Address",          selectedBooking.address || "—"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-1 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Status</span>
                <StatusPill status={selectedBooking.status} />
              </div>
            </div>

            {/* Payment breakdown */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Summary</p>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
                {/* Show line items only if we have them, otherwise show total directly */}
                {selectedBooking.service_charge && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-slate-600">Service charge</span>
                    <span className="font-medium">₹{selectedBooking.service_charge}</span>
                  </div>
                )}
                {selectedBooking.platform_fee && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-slate-600">Platform fee</span>
                    <span className="font-medium">₹{selectedBooking.platform_fee}</span>
                  </div>
                )}
                {/* Advance subtotal — use service+platform if available, else use amount */}
                {(() => {
                  const s = parseFloat(selectedBooking.service_charge || "0");
                  const p = parseFloat(selectedBooking.platform_fee   || "0");
                  const advTotal = (s + p) > 0 ? (s + p).toFixed(2) : selectedBooking.amount;
                  const isPaid = selectedBooking.advance_payment_status === "paid";
                  return (
                    <div className="flex justify-between px-4 py-2.5 bg-blue-50">
                      <span className="font-semibold text-slate-700">Advance paid</span>
                      <span className="font-bold text-blue-700 flex items-center gap-1.5">
                        ₹{advTotal}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {isPaid ? "✓ Paid" : "Pending"}
                        </span>
                      </span>
                    </div>
                  );
                })()}
                {resolveFinalAmount(selectedBooking) && (
                  <>
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-slate-600">Material cost</span>
                      <span className="font-medium">₹{resolveFinalAmount(selectedBooking)}</span>
                    </div>
                    {(() => {
                      const isFinalPaid = selectedBooking.final_payment_status === "paid";
                      return (
                        <div className="flex justify-between px-4 py-2.5 bg-orange-50">
                          <span className="font-semibold text-slate-700">Final payment</span>
                          <span className="font-bold text-orange-700 flex items-center gap-1.5">
                            ₹{resolveFinalAmount(selectedBooking)}
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isFinalPaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                              {isFinalPaid ? "✓ Paid" : "Pending"}
                            </span>
                          </span>
                        </div>
                      );
                    })()}
                  </>
                )}
                {/* Grand total */}
                {(() => {
                  const s = parseFloat(selectedBooking.service_charge || "0");
                  const p = parseFloat(selectedBooking.platform_fee   || "0");
                  const adv = (s + p) > 0 ? (s + p) : parseFloat(selectedBooking.amount || "0");
                  const fin = parseFloat(resolveFinalAmount(selectedBooking) || "0");
                  const total = adv + fin;
                  if (total <= 0) return null;
                  return (
                    <div className="flex justify-between px-4 py-3 bg-slate-100">
                      <span className="font-bold text-slate-900">Grand Total</span>
                      <span className="font-black text-slate-900 text-base">₹{total.toFixed(2)}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {/* Track */}
              {(selectedBooking.status === "accepted" || selectedBooking.status === "ongoing") && (
                <button
                  onClick={() => { setSelectedBooking(null); openTracking(selectedBooking.id); }}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                  📍 Track Serviceman
                </button>
              )}

              {/* Final payment in modal */}
              {selectedBooking.final_payment_status === "pending" &&
               (selectedBooking.status === "ongoing" || selectedBooking.status === "completed") && (
                <button
                  onClick={() => initiatePayment(selectedBooking)}
                  disabled={payingId === selectedBooking.id}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                  {payingId === selectedBooking.id
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                    : <>💳 Pay Final Amount{resolveFinalAmount(selectedBooking) ? ` ₹${resolveFinalAmount(selectedBooking)}` : ""}</>
                  }
                </button>
              )}

              {/* Cancel */}
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
