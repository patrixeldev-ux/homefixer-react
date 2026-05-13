"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiAlertTriangle } from "react-icons/fi";
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

interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  image_url: string | null;
}

interface Profile { business_name: string; full_address: string; is_approved: boolean; }
interface User    { name: string; email: string; phone?: string; }

export default function VendorDashboard() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(true);
  const [user,     setUser]     = useState<User>({ name: "", email: "" });
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [orders,   setOrders]   = useState<MaterialOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/vendor"); return; }
    Promise.all([fetchProfile(), fetchOrders(), fetchProducts()]).finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/");
      setUser({ name: res.data.user.name, email: res.data.user.email, phone: res.data.user.phone });
      setProfile(res.data.profile);
    } catch { router.replace("/vendor"); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/vendor/material-orders/");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  };

  const lowStock      = products.filter(p => p.stock_quantity <= 5);
  const pendingOrders = orders.filter(o => o.status === "REQUESTED" && o.customer_approve);
  const acceptedOrders = orders.filter(o => o.status === "ACCEPTED");
  const totalRevenue  = acceptedOrders.reduce((sum, o) => sum + parseFloat(o.total_cost), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Total Products",  value: products.length,               bg: "bg-orange-50", border: "border-orange-100", iconBg: "bg-orange-100", icon: "📦" },
    { label: "Pending Orders",  value: pendingOrders.length,          bg: "bg-yellow-50", border: "border-yellow-100", iconBg: "bg-yellow-100", icon: "⏳" },
    { label: "Revenue (Accepted)", value: `₹${totalRevenue.toFixed(0)}`, bg: "bg-green-50", border: "border-green-100", iconBg: "bg-green-100", icon: "💰" },
  ];

  const actions = [
    { label: "Orders",     desc: "Manage material requests",  icon: "📋", bg: "bg-orange-100 hover:bg-orange-200 text-orange-900", route: "/vendor/orders"   },
    { label: "Products",   desc: "Add & manage your stock",   icon: "📦", bg: "bg-amber-100 hover:bg-amber-200 text-amber-900",   route: "/vendor/products" },
    { label: "My Profile", desc: "Manage your store details", icon: "👤", bg: "bg-gray-700 hover:bg-gray-800 text-white",          route: "/vendor/profile"  },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.business_name || user.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store</p>
        </div>
        <button
          onClick={() => router.push("/vendor/profile")}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm"
        >
          <FiUser size={14} />
          Edit Profile
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-2xl font-bold text-orange-600 flex-shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "V"}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{profile?.business_name || user.name || "Vendor"}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          {user.phone && <p className="text-gray-400 text-xs mt-0.5">{user.phone}</p>}
          {profile && (
            <span className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              profile.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {profile.is_approved ? "✓ Approved" : "⏳ Pending Approval"}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center shadow-sm text-xl`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {actions.map(a => (
          <button key={a.label} onClick={() => router.push(a.route)}
            className={`${a.bg} rounded-2xl p-5 text-left transition`}>
            <span className="text-3xl">{a.icon}</span>
            <p className="font-semibold mt-3">{a.label}</p>
            <p className="text-xs opacity-75 mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" size={14} /> Low Stock Alert
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {lowStock.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-red-100 shadow-sm p-4">
                <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                <p className="text-red-600 font-bold text-lg mt-1">{p.stock_quantity} left</p>
                <p className="text-gray-500 text-xs">₹{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
