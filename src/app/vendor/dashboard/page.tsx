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
  items: { product_name: string; quantity: number; price_at_order: string }[];
}

interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  image_url: string | null;
}

interface Profile {
  business_name: string;
  full_address: string;
  is_approved: boolean;
}

interface User { name: string; email: string; }

export default function VendorDashboard() {
  const router = useRouter();
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [user, setUser]               = useState<User>({ name: "", email: "" });
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [orders, setOrders]           = useState<MaterialOrder[]>([]);
  const [products, setProducts]       = useState<Product[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/vendor"); return; }
    Promise.all([fetchProfile(), fetchOrders(), fetchProducts()])
      .finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile/");
      setUser({ name: res.data.user.name, email: res.data.user.email });
      setProfile(res.data.profile);
    } catch { router.replace("/vendor"); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/vendor/material-orders/");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Orders fetch failed"); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Products fetch failed"); }
  };

  const handleOrderAction = async (orderId: number, action: "accept" | "reject") => {
    setActionLoading(orderId);
    try {
      await api.patch(`/api/vendor/material-orders/${orderId}/action/`, { action });
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.detail || `Failed to ${action} order`);
    } finally { setActionLoading(null); }
  };

  const handleLogout = async () => {
    try { await api.post("/api/auth/logout/", {}); } catch {}
    localStorage.clear();
    router.replace("/");
  };

  const lowStock    = products.filter(p => p.stock_quantity <= 5);
  const pendingOrders = orders.filter(o => o.status === "REQUESTED" && o.customer_approve);
  const totalRevenue = orders
    .filter(o => o.status === "ACCEPTED")
    .reduce((sum, o) => sum + parseFloat(o.total_cost), 0);

  const stats = [
    { label: "Total Products",    value: products.length,      color: "bg-blue-50 text-blue-700",   icon: "📦" },
    { label: "Pending Orders",    value: pendingOrders.length, color: "bg-orange-50 text-orange-700", icon: "⏳" },
    { label: "Low Stock Items",   value: lowStock.length,      color: "bg-red-50 text-red-700",     icon: "⚠️" },
    { label: "Revenue (Accepted)",value: `₹${totalRevenue.toFixed(0)}`, color: "bg-green-50 text-green-700", icon: "💰" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* HEADER */}
      <div className="bg-amber-500 text-white rounded-2xl p-6 mb-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-400 border-2 border-white/50 flex items-center justify-center text-2xl font-bold">
            {user.name?.[0]?.toUpperCase() ?? "V"}
          </div>
          <div>
            <p className="text-amber-100 text-sm">Welcome back</p>
            <h1 className="text-xl font-bold">{profile?.business_name || user.name}</h1>
            <p className="text-amber-100 text-xs">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {profile && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              profile.is_approved ? "bg-green-500" : "bg-yellow-600"
            }`}>
              {profile.is_approved ? "✓ Approved" : "⏳ Pending Approval"}
            </span>
          )}
          <button onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500 hover:bg-red-400">
            Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PENDING MATERIAL ORDERS */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">
          Material Orders
          {pendingOrders.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingOrders.length} new
            </span>
          )}
        </h2>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center mb-6 shadow-sm">
          <p className="text-4xl mb-2">📬</p>
          <p className="font-bold text-gray-900">No pending orders</p>
          <p className="text-gray-500 text-sm mt-1">New material requests from servicemen appear here</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {pendingOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-gray-900">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">Booking #{order.booking}</p>
                  <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    order.urgency === "HIGH" ? "bg-red-100 text-red-700" :
                    order.urgency === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>{order.urgency} urgency</span>
                </div>
                <p className="text-blue-700 font-bold text-lg">₹{order.total_cost}</p>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-800 font-medium">{item.product_name}</span>
                    <span className="text-gray-500">×{item.quantity} — ₹{item.price_at_order}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  disabled={actionLoading === order.id}
                  onClick={() => handleOrderAction(order.id, "accept")}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm"
                >
                  {actionLoading === order.id ? "..." : "✓ Accept Order"}
                </button>
                <button
                  disabled={actionLoading === order.id}
                  onClick={() => handleOrderAction(order.id, "reject")}
                  className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 font-bold rounded-lg text-sm border border-red-200"
                >
                  {actionLoading === order.id ? "..." : "✕ Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOW STOCK WARNING */}
      {lowStock.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-3">⚠️ Low Stock Alert</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {lowStock.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-red-100 shadow-sm p-4">
                <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                <p className="text-red-600 font-bold text-lg mt-1">{p.stock_quantity} left</p>
                <p className="text-gray-500 text-xs">₹{p.price}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ALL ORDERS HISTORY */}
      {orders.filter(o => !pendingOrders.includes(o)).length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Order History</h2>
          <div className="space-y-2">
            {orders.filter(o => o.status !== "REQUESTED" || !o.customer_approve).map(order => (
              <div key={order.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Order #{order.id} — Booking #{order.booking}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-900">₹{order.total_cost}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    order.status === "ACCEPTED"  ? "bg-green-100 text-green-800" :
                    order.status === "REJECTED"  ? "bg-red-100 text-red-700" :
                    order.status === "EXPIRED"   ? "bg-gray-100 text-gray-600" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}