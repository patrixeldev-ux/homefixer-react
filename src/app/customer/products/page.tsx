"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import { filterBookingsBySection, parseBookingList } from "../../../lib/bookings";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price_at_order: string;
  line_total: string;
  unit?: string | null;
}

interface MaterialOrder {
  id: number;
  vendor_name: string;
  vendor_phone?: string | null;
  vendor_address?: string | null;
  vendor_shop_name?: string | null;
  status: string;
  urgency: string;
  customer_approve: boolean;
  total_cost: string;
  created_at: string;
  requested_note?: string | null;
  requested_for?: string | null;
  items: OrderItem[];
}

interface BookingWithOrders {
  booking_id: number;
  booking_status: string;
  service_name: string;
  serviceman_name: string;
  problem_title: string;
  problem_description: string;
  material_orders: MaterialOrder[];
}

type Tab = "pending" | "history";
type ApiRecord = Record<string, unknown>;

// ─── Style maps ───────────────────────────────────────────────────────────────

const urgencyColor: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW:    "bg-green-100 text-green-700",
};

const vendorStatusColor: Record<string, string> = {
  REQUESTED: "bg-blue-100 text-blue-700",
  ACCEPTED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-700",
  EXPIRED:   "bg-gray-100 text-gray-500",
  PENDING:   "bg-slate-100 text-slate-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse space-y-4">
      <div className="h-5 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="h-24 bg-slate-100 rounded-2xl" />
      <div className="h-10 bg-slate-100 rounded-2xl" />
    </div>
  );
}

function pickText(...values: unknown[]) {
  const match = values.find(v => typeof v === "string" && v.trim().length > 0);
  return typeof match === "string" ? match : "";
}

function pickNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function normalizeOrderItem(item: unknown, index: number): OrderItem {
  const r = asRecord(item);
  const product = asRecord(r.product);
  return {
    id: typeof r.id === "number" ? r.id : index,
    product_name: pickText(r.product_name, r.name, product.name, "Material item"),
    quantity: pickNumber(r.quantity, 1),
    price_at_order: String(r.price_at_order ?? r.price ?? r.unit_price ?? "0"),
    line_total: String(r.line_total ?? r.subtotal ?? r.total ?? "0"),
    unit: pickText(r.unit, r.product_unit) || null,
  };
}

function normalizeMaterialOrder(order: unknown, index: number): MaterialOrder {
  const r = asRecord(order);
  const vendor = asRecord(r.vendor);
  const vendorUser = asRecord(vendor.user);
  const items = Array.isArray(r.items) ? r.items.map(normalizeOrderItem) : [];
  return {
    id: typeof r.id === "number" ? r.id : index,
    vendor_name: pickText(r.vendor_name, vendor.name, vendorUser.name, "Vendor"),
    vendor_phone: pickText(r.vendor_phone, vendor.phone, vendorUser.phone) || null,
    vendor_address: pickText(r.vendor_address, vendor.address, vendor.shop_address) || null,
    vendor_shop_name: pickText(r.vendor_shop_name, vendor.shop_name, vendor.business_name) || null,
    status: pickText(r.status, "PENDING").toUpperCase(),
    urgency: pickText(r.urgency, "MEDIUM").toUpperCase(),
    customer_approve: Boolean(r.customer_approve ?? r.customer_approved ?? false),
    total_cost: String(r.total_cost ?? r.grand_total ?? "0"),
    created_at: pickText(r.created_at, new Date().toISOString()),
    requested_note: pickText(r.request_note, r.request_notes, r.notes, r.description, r.reason) || null,
    requested_for: pickText(r.requested_for, r.request_title, r.material_purpose) || null,
    items,
  };
}

function normalizeBooking(payload: unknown, booking: unknown): BookingWithOrders {
  const p = asRecord(payload);
  const b = asRecord(booking);
  const materialOrders = Array.isArray(p.material_orders)
    ? p.material_orders.map(normalizeMaterialOrder)
    : [];
  return {
    booking_id: typeof p.booking_id === "number" ? p.booking_id : pickNumber(b.id),
    booking_status: pickText(p.booking_status, b.status, "active"),
    service_name: pickText(p.service_name, b.service_name, b.category_name, "Service"),
    serviceman_name: pickText(p.serviceman_name, b.serviceman_name, "Assigned serviceman"),
    problem_title: pickText(p.problem_title, b.problem_title, "Service material request"),
    problem_description: pickText(
      p.problem_description, b.problem_description,
      "Your serviceman raised a material request for this booking."
    ),
    material_orders: materialOrders,
  };
}

function ApprovalBadge({ order }: { order: MaterialOrder }) {
  return order.customer_approve
    ? <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">Customer approved</span>
    : <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">Awaiting approval</span>;
}

// ─── Shared order card ────────────────────────────────────────────────────────

function OrderCard({
  order,
  bookingId,
  approvingId,
  onApprove,
  readOnly = false,
}: {
  order: MaterialOrder;
  bookingId: number;
  approvingId: number | null;
  onApprove: (bookingId: number) => void;
  readOnly?: boolean;
}) {
  return (
    <article className={`rounded-3xl border p-5 sm:p-6 transition ${
      readOnly
        ? "border-slate-200 bg-slate-50/40"
        : order.customer_approve
        ? "border-emerald-200 bg-emerald-50/40"
        : "border-orange-200 bg-orange-50/50"
    }`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {order.vendor_shop_name || order.vendor_name}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Vendor: {order.vendor_name}{order.vendor_phone ? ` · ${order.vendor_phone}` : ""}
            </p>
            {order.vendor_address && (
              <p className="text-sm text-slate-500 mt-0.5">📍 {order.vendor_address}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${urgencyColor[order.urgency] || "bg-slate-100 text-slate-700"}`}>
              {order.urgency} priority
            </span>
            <ApprovalBadge order={order} />
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${vendorStatusColor[order.status] || "bg-slate-100 text-slate-700"}`}>
              Vendor: {order.status}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 min-w-48 text-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Timeline</p>
          <p className="text-slate-600">
            {new Date(order.created_at).toLocaleString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
          <p className="text-slate-500 mt-2 text-xs">
            {order.customer_approve
              ? "Approved — vendor was notified."
              : "Waiting for your confirmation."}
          </p>
        </div>
      </div>

      {/* Items + notes */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] mt-5">
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Materials Ordered</p>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-4 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-800">{item.product_name}</p>
                  <p className="text-slate-500 mt-0.5">
                    Qty: {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                    {item.price_at_order !== "0" ? ` · ₹${item.price_at_order} each` : ""}
                  </p>
                </div>
                <p className="font-semibold text-slate-900 flex-shrink-0">₹{item.line_total}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between font-semibold text-sm text-slate-900">
            <span>Total material cost</span>
            <span>₹{order.total_cost}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Request Details</p>
          <div className="space-y-3">
            <div>
              <p className="text-slate-500 text-xs">Purpose</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {order.requested_for || "Materials required to complete this service"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Notes</p>
              <p className="mt-0.5 leading-relaxed">
                {order.requested_note || "The serviceman requested these materials for the active booking."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!readOnly && !order.customer_approve && (
        <button
          onClick={() => onApprove(bookingId)}
          disabled={approvingId === bookingId}
          className="mt-5 w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition"
        >
          {approvingId === bookingId ? "Approving…" : "Approve Request & Send to Vendor"}
        </button>
      )}
    </article>
  );
}

// ─── Booking section wrapper ──────────────────────────────────────────────────

function BookingSection({
  booking,
  approvingId,
  onApprove,
  readOnly,
}: {
  booking: BookingWithOrders;
  approvingId: number | null;
  onApprove: (id: number) => void;
  readOnly: boolean;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="bg-slate-900 px-6 py-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-1">Booking #{booking.booking_id}</span>
              <span className="capitalize">{booking.booking_status}</span>
            </div>
            <h2 className="text-2xl font-bold mt-3">{booking.problem_title}</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-3xl">{booking.problem_description}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm flex-shrink-0">
            <p className="text-slate-300">Service</p>
            <p className="font-semibold text-white mt-1">{booking.service_name}</p>
            <p className="text-slate-300 mt-2">Serviceman</p>
            <p className="font-semibold text-white mt-1">{booking.serviceman_name}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">
        {booking.material_orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            bookingId={booking.booking_id}
            approvingId={approvingId}
            onApprove={onApprove}
            readOnly={readOnly}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerProducts() {
  const [tab, setTab] = useState<Tab>("pending");

  // Pending approvals (active bookings)
  const [pendingBookings, setPendingBookings] = useState<BookingWithOrders[]>([]);
  const [pendingLoading, setPendingLoading]   = useState(true);

  // Order history (completed bookings)
  const [historyBookings, setHistoryBookings] = useState<BookingWithOrders[]>([]);
  const [historyLoading, setHistoryLoading]   = useState(true);

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [error, setError]             = useState("");

  // ── Fetch active booking orders ─────────────────────────────────────────────
  const fetchPending = async () => {
    setPendingLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/history/");
      const active = filterBookingsBySection(parseBookingList(res.data) as { status?: unknown }[], "active")
        .filter(b => ["accepted", "ongoing"].includes(String(asRecord(b).status || "").toLowerCase()));

      const results = await Promise.all(
        active.map(async b => {
            const r = asRecord(b);
            try {
              const orderRes = await api.get(`/booking/${r.id}/vendor-tracking/`);
              const normalized = normalizeBooking(orderRes.data, b);
              return normalized.material_orders.length > 0 ? normalized : null;
            } catch { return null; }
          })
      );

      setPendingBookings(
        (results.filter(Boolean) as BookingWithOrders[])
          .sort((a, b) => b.booking_id - a.booking_id)
      );
    } catch {
      setError("Failed to load material order requests.");
    } finally {
      setPendingLoading(false);
    }
  };

  // ── Fetch completed booking orders (history) ────────────────────────────────
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/bookings/history/");
      const completed = filterBookingsBySection(parseBookingList(res.data) as { status?: unknown }[], "completed");

      const results = await Promise.all(
        completed.map(async b => {
          const r = asRecord(b);
          try {
            const orderRes = await api.get(`/booking/${r.id}/vendor-tracking/`);
            const normalized = normalizeBooking(orderRes.data, b);
            return normalized.material_orders.length > 0 ? normalized : null;
          } catch { return null; }
        })
      );

      setHistoryBookings(
        (results.filter(Boolean) as BookingWithOrders[])
          .sort((a, b) => b.booking_id - a.booking_id)
      );
    } catch { /* silently ignore */ }
    finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    fetchHistory();
  }, []);

  const handleApprove = async (bookingId: number) => {
    setApprovingId(bookingId);
    try {
      await api.patch(`/booking/${bookingId}/approve/`, { status: "APPROVED" });
      await fetchPending();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e.response?.data?.detail || "Could not approve order. Try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const pendingCount = pendingBookings.reduce(
    (sum, b) => sum + b.material_orders.filter(o => !o.customer_approve).length, 0
  );

  const totalHistoryOrders = historyBookings.reduce(
    (sum, b) => sum + b.material_orders.length, 0
  );

  const isLoading = tab === "pending" ? pendingLoading : historyLoading;
  const bookings  = tab === "pending" ? pendingBookings : historyBookings;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%,_#eef2ff)] p-6 sm:p-8">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Products & Orders</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Material Orders</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Review material requests from your servicemen, approve them, and track order history.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
              {pendingCount} awaiting approval
            </span>
          )}
          <button
            onClick={() => { fetchPending(); fetchHistory(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
            tab === "pending"
              ? "bg-slate-900 text-white shadow"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending Approvals
          {pendingCount > 0 && (
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === "pending" ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
            }`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
            tab === "history"
              ? "bg-slate-900 text-white shadow"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Order History
          {totalHistoryOrders > 0 && (
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === "history" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            }`}>
              {totalHistoryOrders}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm">{error}</div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="text-center py-24 bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm">
          <p className="text-5xl mb-4">{tab === "pending" ? "📦" : "🗂️"}</p>
          <p className="font-semibold text-slate-700">
            {tab === "pending" ? "No pending material requests" : "No order history yet"}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {tab === "pending"
              ? "Material requests from servicemen will appear here when needed."
              : "Completed booking material orders will appear here."}
          </p>
        </div>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="space-y-8">
          {bookings.map(booking => (
            <BookingSection
              key={booking.booking_id}
              booking={booking}
              approvingId={approvingId}
              onApprove={handleApprove}
              readOnly={tab === "history"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
