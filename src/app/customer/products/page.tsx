"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";

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

type ApiRecord = Record<string, unknown>;

const urgencyColor: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

const vendorStatusColor: Record<string, string> = {
  REQUESTED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  PENDING: "bg-slate-100 text-slate-700",
};

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
  const match = values.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );
  return typeof match === "string" ? match : "";
}

function pickNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return value;
  }
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
  const itemRecord = asRecord(item);
  const product = asRecord(itemRecord.product);

  return {
    id: typeof itemRecord.id === "number" ? itemRecord.id : index,
    product_name: pickText(
      itemRecord.product_name,
      itemRecord.name,
      product.name,
      "Material item"
    ),
    quantity: pickNumber(itemRecord.quantity, 1),
    price_at_order: String(
      itemRecord.price_at_order ?? itemRecord.price ?? itemRecord.unit_price ?? "0"
    ),
    line_total: String(
      itemRecord.line_total ?? itemRecord.subtotal ?? itemRecord.total ?? "0"
    ),
    unit: pickText(itemRecord.unit, itemRecord.product_unit) || null,
  };
}

function normalizeMaterialOrder(order: unknown, index: number): MaterialOrder {
  const orderRecord = asRecord(order);
  const vendor = asRecord(orderRecord.vendor);
  const vendorUser = asRecord(vendor.user);
  const items = Array.isArray(orderRecord.items)
    ? orderRecord.items.map(normalizeOrderItem)
    : [];

  return {
    id: typeof orderRecord.id === "number" ? orderRecord.id : index,
    vendor_name: pickText(
      orderRecord.vendor_name,
      vendor.name,
      vendorUser.name,
      "Vendor"
    ),
    vendor_phone:
      pickText(orderRecord.vendor_phone, vendor.phone, vendorUser.phone) || null,
    vendor_address: pickText(
      orderRecord.vendor_address,
      vendor.address,
      vendor.shop_address
    ) || null,
    vendor_shop_name: pickText(
      orderRecord.vendor_shop_name,
      vendor.shop_name,
      vendor.business_name
    ) || null,
    status: pickText(orderRecord.status, "PENDING").toUpperCase(),
    urgency: pickText(orderRecord.urgency, "MEDIUM").toUpperCase(),
    customer_approve: Boolean(
      orderRecord.customer_approve ?? orderRecord.customer_approved ?? false
    ),
    total_cost: String(orderRecord.total_cost ?? orderRecord.grand_total ?? "0"),
    created_at: pickText(orderRecord.created_at, new Date().toISOString()),
    requested_note:
      pickText(
        orderRecord.request_note,
        orderRecord.request_notes,
        orderRecord.notes,
        orderRecord.description,
        orderRecord.reason
      ) || null,
    requested_for:
      pickText(
        orderRecord.requested_for,
        orderRecord.request_title,
        orderRecord.material_purpose
      ) || null,
    items,
  };
}

function normalizeBooking(payload: unknown, booking: unknown): BookingWithOrders {
  const payloadRecord = asRecord(payload);
  const bookingRecord = asRecord(booking);
  const materialOrders = Array.isArray(payloadRecord.material_orders)
    ? payloadRecord.material_orders.map(normalizeMaterialOrder)
    : [];

  return {
    booking_id:
      typeof payloadRecord.booking_id === "number"
        ? payloadRecord.booking_id
        : pickNumber(bookingRecord.id),
    booking_status: pickText(
      payloadRecord.booking_status,
      bookingRecord.status,
      "active"
    ),
    service_name: pickText(
      payloadRecord.service_name,
      bookingRecord.service_name,
      bookingRecord.category_name,
      "Service"
    ),
    serviceman_name: pickText(
      payloadRecord.serviceman_name,
      bookingRecord.serviceman_name,
      "Assigned serviceman"
    ),
    problem_title: pickText(
      payloadRecord.problem_title,
      bookingRecord.problem_title,
      "Service material request"
    ),
    problem_description: pickText(
      payloadRecord.problem_description,
      bookingRecord.problem_description,
      "Your serviceman has raised a material request for this booking."
    ),
    material_orders: materialOrders,
  };
}

function ApprovalState({ order }: { order: MaterialOrder }) {
  if (!order.customer_approve) {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
        Awaiting customer approval
      </span>
    );
  }

  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
      Customer approved
    </span>
  );
}

export default function CustomerProducts() {
  const [bookingsWithOrders, setBookingsWithOrders] = useState<BookingWithOrders[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const bookingsResponse = await api.get("/api/customer/bookings/", {
        params: { section: "active" },
      });

      const activeBookings = Array.isArray(bookingsResponse.data)
        ? bookingsResponse.data
        : bookingsResponse.data.results ?? [];

      const materialBookings = await Promise.all(
        activeBookings
          .filter((booking: unknown) =>
            ["accepted", "ongoing"].includes(
              String(asRecord(booking).status || "").toLowerCase()
            )
          )
          .map(async (booking: unknown) => {
            const bookingRecord = asRecord(booking);
            try {
              const orderResponse = await api.get(
                `/api/customer/booking/${bookingRecord.id}/vendor-products/`
              );
              const normalized = normalizeBooking(orderResponse.data, booking);
              return normalized.material_orders.length > 0 ? normalized : null;
            } catch {
              return null;
            }
          })
      );

      const filtered = materialBookings
        .filter(Boolean)
        .sort((left, right) => right!.booking_id - left!.booking_id) as BookingWithOrders[];

      setBookingsWithOrders(filtered);
    } catch {
      setError("Failed to load material order requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (orderId: number) => {
    setApprovingId(orderId);
    try {
      await api.patch(`/api/material-orders/${orderId}/customer-approve/`);
      await fetchData();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string } };
      };
      alert(error.response?.data?.detail || "Could not approve order. Try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const pendingCount = bookingsWithOrders.reduce(
    (sum, booking) =>
      sum + booking.material_orders.filter((order) => !order.customer_approve).length,
    0
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%,_#eef2ff)] p-6 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
            Products Page
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Ordered Materials For Your Services
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-3xl">
            Review the products your servicemen requested for active bookings,
            confirm the request, and track when it moves forward to the vendor.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="w-fit bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
            {pendingCount} awaiting approval
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {!loading && bookingsWithOrders.length === 0 && (
        <div className="text-center py-24 bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-semibold text-slate-700">No material requests yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Product requests from servicemen will appear here when materials are
            needed for your ongoing service.
          </p>
        </div>
      )}

      {!loading && bookingsWithOrders.length > 0 && (
        <div className="space-y-8">
          {bookingsWithOrders.map((booking) => (
            <section
              key={booking.booking_id}
              className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg shadow-slate-200/50 overflow-hidden"
            >
              <div className="bg-slate-900 px-6 py-5 text-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        Booking #{booking.booking_id}
                      </span>
                      <span className="capitalize">{booking.booking_status}</span>
                    </div>
                    <h2 className="text-2xl font-bold mt-3">
                      {booking.problem_title}
                    </h2>
                    <p className="text-slate-300 text-sm mt-2 max-w-3xl">
                      {booking.problem_description}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                    <p className="text-slate-300">Service</p>
                    <p className="font-semibold text-white mt-1">
                      {booking.service_name}
                    </p>
                    <p className="text-slate-300 mt-2">Requested by</p>
                    <p className="font-semibold text-white mt-1">
                      {booking.serviceman_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {booking.material_orders.map((order) => (
                  <article
                    key={order.id}
                    className={`rounded-3xl border p-5 sm:p-6 transition ${
                      order.customer_approve
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-orange-200 bg-orange-50/50"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {order.vendor_shop_name || order.vendor_name}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Vendor contact: {order.vendor_name}
                            {order.vendor_phone ? ` • ${order.vendor_phone}` : ""}
                          </p>
                          {order.vendor_address && (
                            <p className="text-sm text-slate-500 mt-1">
                              Vendor address: {order.vendor_address}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              urgencyColor[order.urgency] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {order.urgency} priority
                          </span>
                          <ApprovalState order={order} />
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              vendorStatusColor[order.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            Vendor status: {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 min-w-56">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Timeline
                        </p>
                        <p className="text-sm text-slate-600 mt-3">
                          Requested on{" "}
                          {new Date(order.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          {order.customer_approve
                            ? "Customer confirmed. Vendor processing can continue."
                            : "Waiting for your confirmation before the vendor is notified."}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] mt-5">
                      <div className="rounded-2xl bg-white border border-slate-200 p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-3">
                          Material Ordered
                        </p>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-4 text-sm border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                            >
                              <div>
                                <p className="font-medium text-slate-800">
                                  {item.product_name}
                                </p>
                                <p className="text-slate-500 mt-1">
                                  Qty: {item.quantity}
                                  {item.unit ? ` ${item.unit}` : ""}
                                  {item.price_at_order !== "0"
                                    ? ` • ₹${item.price_at_order} each`
                                    : ""}
                                </p>
                              </div>
                              <p className="font-semibold text-slate-900">
                                ₹{item.line_total}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between font-semibold text-sm text-slate-900">
                          <span>Total material cost</span>
                          <span>₹{order.total_cost}</span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-3">
                          Request Before Ordering
                        </p>
                        <div className="space-y-3 text-sm text-slate-600">
                          <div>
                            <p className="text-slate-500">Reason from serviceman</p>
                            <p className="font-medium text-slate-900 mt-1">
                              {order.requested_for ||
                                "Materials required to complete this service"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Request details</p>
                            <p className="mt-1 leading-6">
                              {order.requested_note ||
                                "The serviceman requested these materials for the active booking. Once you approve, the request proceeds to the vendor."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!order.customer_approve && (
                      <button
                        onClick={() => handleApprove(order.id)}
                        disabled={approvingId === order.id}
                        className="mt-5 w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition"
                      >
                        {approvingId === order.id
                          ? "Approving request..."
                          : "Approve Request And Send To Vendor"}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
