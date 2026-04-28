"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface MaterialOrder {
  id: number;
  booking: number;
  status: string;
  urgency: string;
  total_cost: string;
  customer_approve: boolean;
  created_at: string;
  vendor_name: string;
  serviceman_name: string;
  items: { product_name: string; quantity: number; price_at_order: string }[];
}

const statusStyle: Record<string, string> = {
  REQUESTED: "bg-orange-100 text-orange-700",
  ACCEPTED:  "bg-green-100 text-green-800",
  REJECTED:  "bg-red-100 text-red-700",
  EXPIRED:   "bg-gray-100 text-gray-600",
  FULFILLED: "bg-blue-100 text-blue-800",
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const [orders, setOrders]           = useState<MaterialOrder[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<MaterialOrder | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter]           = useState<string>("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/vendor/material-orders/");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Orders fetch failed"); }
    finally { setLoading(false); }
  };

  const handleAction = async (orderId: number, action: "accept" | "reject") => {
    setActionLoading(orderId);
    try {
      await api.patch(`/api/vendor/material-orders/${orderId}/action/`, { action });
      await fetchOrders();
      if (selected?.id === orderId) setSelected(null);
    } catch (err: any) {
      alert(err?.response?.data?.detail || `Failed to ${action}`);
    } finally { setActionLoading(null); }
  };

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Material Orders</h1>
        <p className="text-gray-500 text-sm mb-6">Orders from servicemen for your products</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 bg-white rounded-xl p-1 border border-gray-100 shadow-sm overflow-x-auto">
          {["ALL","REQUESTED","ACCEPTED","REJECTED","EXPIRED"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === s ? "bg-amber-500 text-white" : "text-gray-600 hover:text-gray-900"
              }`}>
              {s}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === s ? "bg-white/30 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {s === "ALL" ? orders.length : orders.filter(o => o.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📬</p>
            <p className="font-bold text-gray-900">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <div key={order.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-amber-400 w-full" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">Booking #{order.booking} · {order.serviceman_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {/* ✅ Total in black */}
                      <p className="text-xl font-bold text-black">₹{order.total_cost}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
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

                  <div className="flex gap-2">
                    {order.status === "REQUESTED" && order.customer_approve && (
                      <>
                        <button onClick={() => handleAction(order.id, "accept")}
                          disabled={actionLoading === order.id}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm disabled:opacity-50">
                          ✓ Accept
                        </button>
                        <button onClick={() => handleAction(order.id, "reject")}
                          disabled={actionLoading === order.id}
                          className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-sm border border-red-200 disabled:opacity-50">
                          ✕ Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelected(order)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="h-1 bg-amber-500 w-full rounded-t-2xl" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Order #{selected.id}</h2>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 font-bold hover:bg-gray-200">✕</button>
              </div>

              <div className="space-y-2 text-sm mb-5">
                {[
                  ["Booking", `#${selected.booking}`],
                  ["Serviceman", selected.serviceman_name],
                  ["Urgency", selected.urgency],
                  ["Customer Approved", selected.customer_approve ? "Yes" : "No"],
                  ["Status", selected.status],
                  ["Date", new Date(selected.created_at).toLocaleDateString("en-IN")],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="font-bold text-gray-900">Total</span>
                  {/* ✅ Total in black */}
                  <span className="font-bold text-black text-lg">₹{selected.total_cost}</span>
                </div>
              </div>

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
                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl text-sm">✓ Accept</button>
                  <button onClick={() => handleAction(selected.id, "reject")}
                    className="flex-1 py-3 bg-red-50 text-red-700 font-bold rounded-xl text-sm border border-red-200">✕ Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}