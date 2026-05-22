"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

interface MaterialOrder {
  id: number;
  booking: number;
  status: string;
  urgency: string;
  total_cost: string;
  customer_approve: boolean;
  created_at: string;
  serviceman_name?: string;
  items: { product_name: string; quantity: number; price_at_order: string }[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  REQUESTED:  "bg-orange-100 text-orange-700",
  ACCEPTED:   "bg-green-100 text-green-800",
  FULFILLED:  "bg-blue-100 text-blue-800",
  REJECTED:   "bg-red-100 text-red-700",
  EXPIRED:    "bg-gray-100 text-gray-600",
  CANCELLED:  "bg-slate-100 text-slate-600",
};

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Requested",
  ACCEPTED:  "Accepted",
  FULFILLED: "Completed",
  REJECTED:  "Rejected",
  EXPIRED:   "Expired",
  CANCELLED: "Cancelled",
};

const URGENCY_BADGE: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW:    "bg-green-100 text-green-700",
};

// ─── Tab config ───────────────────────────────────────────────────────────────
// "Active" = orders vendor still needs to act on (REQUESTED awaiting accept/reject, ACCEPTED awaiting pickup)
// "Completed" = serviceman picked up materials (FULFILLED)
// Others = terminal states

type TabKey = "ALL" | "ACTIVE" | "COMPLETED" | "REJECTED" | "EXPIRED" | "CANCELLED";

const TABS: { key: TabKey; label: string; statuses: string[]; color: string }[] = [
  { key: "ALL",       label: "All",       statuses: [],                              color: "bg-orange-500" },
  { key: "ACTIVE",    label: "Active",    statuses: ["REQUESTED", "ACCEPTED"],       color: "bg-green-600"  },
  { key: "COMPLETED", label: "Completed", statuses: ["FULFILLED"],                   color: "bg-blue-600"   },
  { key: "REJECTED",  label: "Rejected",  statuses: ["REJECTED"],                    color: "bg-red-500"    },
  { key: "EXPIRED",   label: "Expired",   statuses: ["EXPIRED"],                     color: "bg-gray-500"   },
  { key: "CANCELLED", label: "Cancelled", statuses: ["CANCELLED"],                   color: "bg-slate-500"  },
];

// Top accent bar color per status
const ACCENT: Record<string, string> = {
  REQUESTED: "from-orange-400 to-amber-400",
  ACCEPTED:  "from-green-400 to-emerald-500",
  FULFILLED: "from-blue-400 to-indigo-500",
  REJECTED:  "from-red-400 to-rose-500",
  EXPIRED:   "from-gray-300 to-gray-400",
  CANCELLED: "from-slate-300 to-slate-400",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorOrdersPage() {
  const [orders,        setOrders]        = useState<MaterialOrder[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState<MaterialOrder | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [tab,           setTab]           = useState<TabKey>("ALL");

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30s so FULFILLED orders appear without manual refresh
    // Stop polling if user navigates away or loses auth
    const interval = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (!token) { clearInterval(interval); return; }
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/vendor/orders/");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown } };
      console.error("Orders fetch failed:", e?.response?.status, e?.response?.data);
      // Don't clear orders on error — keep showing last known data
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: number, action: "accept" | "reject") => {
    setActionLoading(orderId);
    try {
      if (action === "accept") {
        await api.patch(`/vendor/order/${orderId}/accept/`);
      } else {
        alert("Reject is not supported by the API. The order will expire if not accepted in time.");
        return;
      }
      await fetchOrders();
      if (selected?.id === orderId) setSelected(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail || `Failed to ${action}`);
    } finally { setActionLoading(null); }
  };

  const tabConfig = TABS.find(t => t.key === tab)!;
  const filtered  = tab === "ALL"
    ? orders
    : orders.filter(o => tabConfig.statuses.includes(o.status));

  const countFor = (t: typeof TABS[0]) =>
    t.key === "ALL" ? orders.length : orders.filter(o => t.statuses.includes(o.status)).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track orders from servicemen for your products</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Live · updates every 30s
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100 shadow-sm overflow-x-auto flex-shrink-0">
        {TABS.map(t => {
          const count = countFor(t);
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                active ? `${t.color} text-white shadow-sm` : "text-gray-600 hover:text-gray-900"
              }`}>
              {t.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  active ? "bg-white/30 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">
            {tab === "ACTIVE" ? "📬" : tab === "COMPLETED" ? "✅" : tab === "REJECTED" ? "❌" : "📋"}
          </p>
          <p className="font-bold text-gray-900">No {tabConfig.label.toLowerCase()} orders</p>
          <p className="text-gray-500 text-sm mt-1">
            {tab === "ACTIVE"
              ? "New material requests from servicemen will appear here"
              : tab === "COMPLETED"
              ? "Orders fulfilled by servicemen will appear here"
              : "Orders with this status will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4">
          {filtered.map(order => (
            <div key={order.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className={`h-1 bg-gradient-to-r ${ACCENT[order.status] ?? "from-gray-300 to-gray-400"}`} />
              <div className="p-5 flex flex-col flex-1">

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      Booking #{order.booking}{order.serviceman_name ? ` · ${order.serviceman_name}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">₹{order.total_cost}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_BADGE[order.urgency] ?? "bg-gray-100 text-gray-700"}`}>
                    {order.urgency} priority
                  </span>
                  {order.customer_approve && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      ✓ Customer approved
                    </span>
                  )}
                  {order.status === "ACCEPTED" && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      Awaiting pickup
                    </span>
                  )}
                  {order.status === "FULFILLED" && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      ✓ Picked up by serviceman
                    </span>
                  )}
                </div>

                {/* Items preview */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1 flex-1">
                  {order.items.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-800">{item.product_name} ×{item.quantity}</span>
                      <span className="text-gray-500">₹{item.price_at_order}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-400">+{order.items.length - 2} more items</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  {order.status === "REQUESTED" && order.customer_approve && (
                    <>
                      <button onClick={() => handleAction(order.id, "accept")}
                        disabled={actionLoading === order.id}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
                        {actionLoading === order.id ? "…" : "✓ Accept"}
                      </button>
                      <button onClick={() => handleAction(order.id, "reject")}
                        disabled={actionLoading === order.id}
                        className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-sm border border-red-200 disabled:opacity-50 transition-colors">
                        {actionLoading === order.id ? "…" : "✕ Reject"}
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelected(order)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className={`h-1 bg-gradient-to-r ${ACCENT[selected.status] ?? "from-gray-300 to-gray-400"} rounded-t-2xl`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order #{selected.id}</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block ${STATUS_BADGE[selected.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </span>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 font-bold hover:bg-gray-200">✕</button>
              </div>

              <div className="space-y-2 text-sm mb-5">
                {([
                  ["Booking",           `#${selected.booking}`],
                  ["Serviceman",        selected.serviceman_name || "—"],
                  ["Urgency",           selected.urgency],
                  ["Customer Approved", selected.customer_approve ? "Yes ✓" : "No"],
                  ["Date",              new Date(selected.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
                ] as [string, string][]).map(([l, v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg">₹{selected.total_cost}</span>
                </div>
              </div>

              {/* Status explanation */}
              {selected.status === "ACCEPTED" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800">
                  ✓ You accepted this order. Waiting for the serviceman to arrive and pick up the materials.
                </div>
              )}
              {selected.status === "FULFILLED" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
                  ✅ Serviceman has picked up the materials. Order is complete.
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="font-semibold text-gray-800 text-sm mb-3">Products</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                      <span className="font-semibold text-gray-900">₹{item.price_at_order}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selected.status === "REQUESTED" && selected.customer_approve && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(selected.id, "accept")}
                    disabled={actionLoading === selected.id}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                    ✓ Accept Order
                  </button>
                  <button onClick={() => handleAction(selected.id, "reject")}
                    disabled={actionLoading === selected.id}
                    className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-sm border border-red-200 disabled:opacity-50">
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
