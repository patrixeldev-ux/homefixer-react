"use client";

import React, { useEffect, useRef, useState } from "react";
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
  amount: string;
  service_charge: string | null;
  platform_fee: string | null;
  final_amount: string | null;
  total_amount: string | null;
  material_cost: string | null;
  grand_total: string | null;
  status: BackendStatus;
  advance_payment_status: string;
  final_payment_status: string;
}

interface WalletInfo {
  balance: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<BackendStatus, { label: string; pill: string; progress: number }> = {
  pending:   { label: "Pending",    pill: "bg-yellow-100 text-yellow-700", progress: 25  },
  accepted:  { label: "Accepted",   pill: "bg-blue-100 text-blue-700",     progress: 50  },
  ongoing:   { label: "On the way", pill: "bg-indigo-100 text-indigo-700", progress: 75  },
  completed: { label: "Completed",  pill: "bg-green-100 text-green-700",   progress: 100 },
  cancelled: { label: "Cancelled",  pill: "bg-red-100 text-red-700",       progress: 100 },
};

const categoryIcons: Record<string, string> = {
  plumb: "🔧", electric: "⚡", carpen: "🪚", paint: "🎨",
  clean: "🧹", ac: "❄️", pest: "🐛", default: "🏠",
};

function getIcon(name: string) {
  const lower = (name || "").toLowerCase();
  const key = Object.keys(categoryIcons).find(k => lower.includes(k));
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
        onClick={e => e.stopPropagation()}>
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
          <p className="text-sm text-slate-500">You can track the booking status and serviceman progress from this page.</p>
          <button onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 transition">
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

function resolveFinalAmount(b: Booking): string | null {
  return b.final_amount || b.total_amount || b.material_cost || null;
}

function fmt(v: string | null | undefined): string {
  if (!v || v === "0" || v === "0.00") return "—";
  return `₹${parseFloat(v).toFixed(2)}`;
}

// ─── Payment method picker ────────────────────────────────────────────────────

function PaymentMethodModal({
  booking,
  wallet,
  onPayRazorpay,
  onPayWallet,
  onClose,
  paying,
  walletPaying,
}: {
  booking: Booking;
  wallet: WalletInfo | null;
  onPayRazorpay: () => void;
  onPayWallet: () => void;
  onClose: () => void;
  paying: boolean;
  walletPaying: boolean;
}) {
  const finalAmt     = resolveFinalAmount(booking);
  const serviceChg   = booking.service_charge;
  const platformFee  = booking.platform_fee;
  const materialCost = finalAmt;

  const advanceSubtotal = (() => {
    const s = parseFloat(serviceChg  || "0");
    const p = parseFloat(platformFee || "0");
    return (s + p) > 0 ? (s + p).toFixed(2) : null;
  })();

  const grandTotal = (() => {
    const a = parseFloat(advanceSubtotal || "0");
    const f = parseFloat(finalAmt        || "0");
    if (a > 0 && f > 0) return (a + f).toFixed(2);
    if (a > 0) return a.toFixed(2);
    return null;
  })();

  const walletBalance  = wallet?.balance ?? 0;
  const dueAmount      = parseFloat(materialCost || "0");
  const walletSufficient = walletBalance >= dueAmount;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Final Payment</p>
          <h2 className="text-xl font-bold mt-0.5">{booking.service_name || "Service"}</h2>
          <p className="text-white/80 text-sm mt-0.5">
            Booking #{booking.id}
            {booking.serviceman_name ? ` · ${booking.serviceman_name}` : ""}
          </p>
        </div>

        {/* Bill breakdown */}
        <div className="p-6">
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Charges Breakdown</p>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Advance */}
              <div className="px-4 py-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Advance Paid</p>
                {serviceChg && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Service charge</span>
                    <span className="font-medium">{fmt(serviceChg)}</span>
                  </div>
                )}
                {platformFee && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Platform fee</span>
                    <span className="font-medium">{fmt(platformFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold mt-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-slate-700">Advance subtotal</span>
                  <span className="text-green-700">{fmt(advanceSubtotal)} <span className="text-xs font-normal text-green-600 ml-1">✓ Paid</span></span>
                </div>
              </div>
              {/* Final */}
              {materialCost && (
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Now</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Material cost</span>
                    <span className="font-medium">{fmt(materialCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-1.5 pt-1.5 border-t border-slate-100">
                    <span className="text-slate-700">Amount due</span>
                    <span className="text-orange-600">{fmt(materialCost)}</span>
                  </div>
                </div>
              )}
              {/* Grand total */}
              {grandTotal && (
                <div className="px-4 py-3 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Grand Total</span>
                    <span className="text-xl font-black text-orange-600">₹{grandTotal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking meta */}
          <div className="text-xs text-slate-500 space-y-1 mb-5">
            {booking.booking_date && <p>📅 {booking.booking_date}{booking.booking_time ? ` · ${booking.booking_time}` : ""}</p>}
            {booking.address && <p className="truncate">📍 {booking.address}</p>}
          </div>

          {/* ── Payment method selection ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Choose Payment Method</p>

          <div className="space-y-3">
            {/* Wallet option */}
            <div className={`rounded-xl border-2 p-4 ${walletSufficient ? "border-blue-200 bg-blue-50/50" : "border-slate-100 bg-slate-50 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">💰</div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Pay from Wallet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Balance: <span className={`font-semibold ${walletSufficient ? "text-green-700" : "text-red-600"}`}>
                        ₹{(walletBalance).toFixed(2)}
                      </span>
                      {!walletSufficient && " (insufficient)"}
                    </p>
                  </div>
                </div>
                {walletSufficient && (
                  <button
                    onClick={onPayWallet}
                    disabled={walletPaying || paying}
                    className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                  >
                    {walletPaying
                      ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Paying…</>
                      : "Pay Now"
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Razorpay option */}
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">💳</div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Pay via Razorpay</p>
                    <p className="text-xs text-slate-500 mt-0.5">Cards, UPI, Net Banking</p>
                  </div>
                </div>
                <button
                  onClick={onPayRazorpay}
                  disabled={paying || walletPaying}
                  className="flex-shrink-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  {paying
                    ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening…</>
                    : "Open Razorpay"
                  }
                </button>
              </div>
            </div>
          </div>

          <button onClick={onClose} disabled={paying || walletPaying}
            className="w-full mt-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bill receipt modal (view history) ───────────────────────────────────────

function ServiceBillReceipt({ booking, onClose }: {
  booking: Booking; onClose: () => void;
}) {
  const finalAmt     = resolveFinalAmount(booking);
  const serviceChg   = booking.service_charge;
  const platformFee  = booking.platform_fee;
  const advanceSubtotal = (() => {
    const s = parseFloat(serviceChg  || "0");
    const p = parseFloat(platformFee || "0");
    return (s + p) > 0 ? (s + p).toFixed(2) : null;
  })();
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Payment Receipt</p>
              <h2 className="text-xl font-bold mt-0.5">{booking.service_name || "Service"}</h2>
              <p className="text-white/80 text-sm">Booking #{booking.id}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">✅</div>
          </div>
        </div>
        <div className="p-6">
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Charges Breakdown</p>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Advance Payment (Paid)</p>
                {serviceChg && (
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Service charge</span><span>{fmt(serviceChg)}</span></div>
                )}
                {platformFee && (
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Platform fee</span><span>{fmt(platformFee)}</span></div>
                )}
                <div className="flex justify-between text-sm font-semibold mt-1.5 pt-1.5 border-t border-slate-100">
                  <span>Advance subtotal</span>
                  <span className="text-green-700">{fmt(advanceSubtotal)} <span className="text-xs font-normal text-green-600 ml-1">✓ Paid</span></span>
                </div>
              </div>
              {finalAmt && (
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Final Payment (Paid)</p>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Material cost</span><span>{fmt(finalAmt)}</span></div>
                  <div className="flex justify-between text-sm font-semibold mt-1.5 pt-1.5 border-t border-slate-100">
                    <span>Final subtotal</span>
                    <span className="text-green-700">{fmt(finalAmt)} <span className="text-xs font-normal text-green-600 ml-1">✓ Paid</span></span>
                  </div>
                </div>
              )}
              {grandTotal && (
                <div className="px-4 py-3 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Grand Total</span>
                    <span className="text-xl font-black text-green-700">₹{grandTotal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1 mb-5">
            {booking.booking_date && <p>📅 {booking.booking_date}{booking.booking_time ? ` · ${booking.booking_time}` : ""}</p>}
            {booking.address && <p className="truncate">📍 {booking.address}</p>}
          </div>
          <button onClick={onClose}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Razorpay helper ──────────────────────────────────────────────────────────

async function openRazorpayFinalPayment(bookingId: number): Promise<void> {
  const intentRes = await api.post(
    `/booking/${bookingId}/payment/create/`,
    { stage: "final", gateway: "razorpay" }
  );
  const {
  order_id,
  amount,
  key,
  payment_id,
} = intentRes.data;

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
        await api.post(
          `/payment/${payment_id}/verify/razorpay/`,
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }
        );

        resolve();
      } catch (err) {
        console.error("Verification failed:", err);
        reject(new Error("Payment verification failed"));
      }
    },

    modal: {
      ondismiss: () => reject(new Error("Payment cancelled")),
    },

    theme: {
      color: "#2563eb",
    },
  };

    const launch = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Razorpay) { launch(); }
    else {
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
  const [walletPayingId,   setWalletPayingId]   = useState<number | null>(null);
  const [payError,         setPayError]         = useState<Record<number, string>>({});
  // Payment method modal (replaces old bill + inline pay)
  const [payingSummary,    setPayingSummary]    = useState<Booking | null>(null);
  // Bill receipt for completed bookings
  const [billBooking,      setBillBooking]      = useState<Booking | null>(null);
  // Tab counts
  const [tabCounts,        setTabCounts]        = useState<Record<Section, number>>({ active: 0, completed: 0, cancelled: 0 });
  // Wallet
  const [wallet,           setWallet]           = useState<WalletInfo | null>(null);

  // ── Boot ────────────────────────────────────────────────────────────────────
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
    setLoading(true); setError("");
    try {
      const res = await api.get("/bookings/history/", { params: { section } });
      const data = res.data;
      setBookings(Array.isArray(data) ? data : data.results ?? []);
    } catch { setError("Failed to load bookings."); }
    finally { setLoading(false); }
  };

  const fetchAllCounts = async () => {
    try {
      const [a, c, x] = await Promise.all([
        api.get("/bookings/history/", { params: { section: "active" } }),
        api.get("/bookings/history/", { params: { section: "completed" } }),
        api.get("/bookings/history/", { params: { section: "cancelled" } }),
      ]);
      const count = (r: { data: unknown }) => {
        const d = r.data;
        return Array.isArray(d) ? d.length : (d as { results?: unknown[] }).results?.length ?? 0;
      };
      setTabCounts({ active: count(a), completed: count(c), cancelled: count(x) });
    } catch { /* ignore */ }
  };

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet/");
      const data = res.data;
      const raw = data.wallet ?? data;
      setWallet({ balance: parseFloat(String(raw.balance ?? 0)) });
    } catch { /* ignore — wallet may not exist yet */ }
  };

  useEffect(() => { fetchBookings(); }, [section]);
  useEffect(() => { fetchAllCounts(); fetchWallet(); }, []);

  const handleCancel = async (bookingId: number) => {
    setCancelling(true);
    try {
      await api.patch(`/booking/${bookingId}/cancel/`);
      setSelectedBooking(null);
      fetchBookings();
      fetchAllCounts();
      fetchWallet(); // refund may have landed in wallet
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail || "Could not cancel booking.");
    } finally { setCancelling(false); }
  };

  // ── Enrich booking before showing payment modal ──────────────────────────────
  const initiatePayment = async (booking: Booking) => {
    try {
      const res = await api.get(`/booking/${booking.id}/details/`);
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
      await fetchWallet(); // refresh balance right before showing modal
    } catch { setPayingSummary(booking); }
  };

  // ── Wallet pay ───────────────────────────────────────────────────────────────
  const handleWalletPayment = async (booking: Booking) => {
    setWalletPayingId(booking.id);
    setPayError(prev => ({ ...prev, [booking.id]: "" }));
    try {
      await api.post(`/wallet/booking/${booking.id}/pay/`);
      setPayingSummary(null);
      setSelectedBooking(null);
      setSection("completed");
      fetchAllCounts();
      fetchWallet();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      const msg = e?.response?.data?.detail || e?.response?.data?.message || "Wallet payment failed. Please try Razorpay.";
      setPayError(prev => ({ ...prev, [booking.id]: msg }));
    } finally { setWalletPayingId(null); }
  };

  // ── Razorpay pay ─────────────────────────────────────────────────────────────
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
    } finally { setPayingId(null); }
  };

  // ── Open detail modal ────────────────────────────────────────────────────────
  const openDetail = async (booking: Booking) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/booking/${booking.id}/details/`);
      const d = res.data;
      const inferredAdvanceStatus =
        booking.status === "completed" ||
        booking.final_payment_status === "paid" ||
        d.advance_payment_status === "paid" ? "paid" : (d.advance_payment_status ?? booking.advance_payment_status);

      setSelectedBooking({
        ...booking,
        service_charge:  d.service_charge  ?? booking.service_charge,
        platform_fee:    d.platform_fee    ?? booking.platform_fee,
        final_amount:    d.final_amount    ?? d.total_amount ?? d.material_cost ?? booking.final_amount,
        total_amount:    d.total_amount    ?? booking.total_amount,
        material_cost:   d.material_cost   ?? booking.material_cost,
        grand_total:     d.grand_total     ?? booking.grand_total,
        advance_payment_status: inferredAdvanceStatus,
        final_payment_status:   d.final_payment_status ?? booking.final_payment_status,
        status: (d.status?.toLowerCase() ?? booking.status) as typeof booking.status,
      });
    } catch { setSelectedBooking(booking); }
    finally { setLoadingDetail(false); }
  };

  const viewBill = async (booking: Booking) => {
    try {
      const res = await api.get(`/booking/${booking.id}/details/`);
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
    } catch { setBillBooking(booking); }
  };

  const openTracking = (bookingId: number) => router.push(`/customer/maps?booking=${bookingId}`);

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

      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1">Track your current services and review past requests</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Wallet balance pill */}
          {wallet !== null && (
            <button
              onClick={() => router.push("/customer/wallet")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-100 transition shadow-sm"
            >
              💰 Wallet: ₹{wallet.balance.toFixed(2)}
            </button>
          )}
          <button
            onClick={() => { fetchBookings(); fetchAllCounts(); fetchWallet(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
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
          {section === "cancelled" && wallet !== null && wallet.balance > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 inline-block">
              <p className="text-sm text-blue-700 font-medium">💰 Your wallet has ₹{wallet.balance.toFixed(2)} from refunds</p>
              <button onClick={() => router.push("/customer/wallet")}
                className="mt-2 text-xs text-blue-600 font-bold hover:underline block text-center">
                View Wallet →
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map(booking => {
            const canTrack    = booking.status === "accepted" || booking.status === "ongoing";
            const needsFinalPay =
              booking.final_payment_status === "pending" &&
              (booking.status === "ongoing" || booking.status === "completed");
            const finalPaid   = booking.final_payment_status === "paid";
            const isPaying    = payingId === booking.id;
            const isWalletPaying = walletPayingId === booking.id;
            const thisPayErr  = payError[booking.id];

            return (
              <div key={booking.id}
                className="relative rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all">
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
                    {needsFinalPay
                      ? <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          Service Done — Pay Now
                        </span>
                      : <StatusPill status={booking.status} />
                    }
                    <ProgressBar status={booking.status} />

                    {section === "active" && !needsFinalPay && (
                      <button
                        onClick={() => canTrack ? openTracking(booking.id) : undefined}
                        disabled={!canTrack}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                          canTrack
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        📍 Track Serviceman
                        {!canTrack && <span className="text-xs opacity-60">(pending acceptance)</span>}
                      </button>
                    )}

                    {/* Final payment button */}
                    {needsFinalPay && (
                      <div className="w-full lg:w-auto">
                        <button
                          onClick={() => initiatePayment(booking)}
                          disabled={isPaying || isWalletPaying}
                          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition shadow-md shadow-orange-100 w-full lg:w-auto justify-center"
                        >
                          {isPaying || isWalletPaying
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                            : <>💳 Pay Final Amount{resolveFinalAmount(booking) ? ` ₹${resolveFinalAmount(booking)}` : ""}</>
                          }
                        </button>
                        {/* Wallet balance hint */}
                        {wallet !== null && wallet.balance > 0 && (
                          <p className="text-xs text-blue-600 mt-1 text-right font-medium">
                            💰 Wallet: ₹{wallet.balance.toFixed(2)} available
                          </p>
                        )}
                        {thisPayErr && (
                          <p className="text-red-500 text-xs mt-1 text-right">{thisPayErr}</p>
                        )}
                      </div>
                    )}

                    {/* Final paid badge */}
                    {finalPaid && (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                          ✓ Final payment done
                        </span>
                        <button onClick={() => viewBill(booking)} className="text-xs font-semibold text-blue-600 hover:underline">
                          🧾 View Bill
                        </button>
                      </div>
                    )}

                    <button
                      className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      onClick={() => openDetail(booking)}
                      disabled={loadingDetail}
                    >
                      {loadingDetail && (
                        <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                      )}
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Payment method modal ── */}
      {payingSummary && (
        <PaymentMethodModal
          booking={payingSummary}
          wallet={wallet}
          paying={payingId === payingSummary.id}
          walletPaying={walletPayingId === payingSummary.id}
          onPayRazorpay={() => handleFinalPayment(payingSummary)}
          onPayWallet={() => handleWalletPayment(payingSummary)}
          onClose={() => setPayingSummary(null)}
        />
      )}

      {/* ── Bill receipt ── */}
      {billBooking && (
        <ServiceBillReceipt
          booking={billBooking}
          onClose={() => setBillBooking(null)}
        />
      )}

      {/* ── Detail modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Booking #{selectedBooking.id}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>

            <div className="space-y-2 text-sm text-slate-700 mb-5">
              {([
                ["Service",    selectedBooking.service_name],
                ["Serviceman", selectedBooking.serviceman_name || "—"],
                ["Date",       selectedBooking.booking_date || "—"],
                ["Time",       selectedBooking.booking_time || "—"],
                ["Address",    selectedBooking.address || "—"],
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

            {/* Payment summary */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Summary</p>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
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
              {(selectedBooking.status === "accepted" || selectedBooking.status === "ongoing") && (
                <button
                  onClick={() => { setSelectedBooking(null); openTracking(selectedBooking.id); }}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                  📍 Track Serviceman
                </button>
              )}

              {selectedBooking.final_payment_status === "pending" &&
               (selectedBooking.status === "ongoing" || selectedBooking.status === "completed") && (
                <button
                  onClick={() => { setSelectedBooking(null); initiatePayment(selectedBooking); }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                  💳 Pay Final Amount
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