"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { parseBookingList } from "../../../lib/bookings";
import {
  FiCalendar,
  FiClipboard,
  FiUser,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

export default function CustomerDashboard() {
  const router = useRouter();

  const [customer, setCustomer] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, historyRes] = await Promise.all([
          api.get("/profile/"),
          api.get("/bookings/history/"),
        ]);

        setCustomer(userRes.data.user);
        setBookings(parseBookingList(historyRes.data));
      } catch (err) {
        console.log("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const total     = bookings.length;
  const pending   = bookings.filter(b => ["pending", "accepted", "ongoing"].includes(String(b.status).toLowerCase())).length;
  const completed = bookings.filter(b => String(b.status).toLowerCase() === "completed").length;

  const cancelled = bookings.filter(b => String(b.status).toLowerCase() === "cancelled").length;

  const stats = [
    {
      label: "Total Bookings",
      value: total,
      icon: <FiCalendar className="text-blue-600" size={20} />,
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Active",
      value: pending,
      icon: <FiClock className="text-yellow-600" size={20} />,
      bg: "bg-yellow-50",
      border: "border-yellow-100",
    },
    {
      label: "Completed",
      value: completed,
      icon: <FiCheckCircle className="text-green-600" size={20} />,
      bg: "bg-green-50",
      border: "border-green-100",
    },
  ];

  const actions = [
    {
      label: "Book a Service",
      desc: "Find & hire a professional",
      icon: "🔧",
      bg: "bg-blue-600 hover:bg-blue-700",
      route: "/customer/booking",
    },
    {
      label: "My Bookings",
      desc: "Track ongoing & past jobs",
      icon: "📋",
      bg: "bg-indigo-600 hover:bg-indigo-700",
      route: "/customer/my-bookings",
    },
    {
      label: "My Profile",
      desc: "Manage your account",
      icon: "👤",
      bg: "bg-gray-700 hover:bg-gray-800",
      route: "/customer/profile",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {customer?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your services
          </p>
        </div>
        <button
          onClick={() => router.push("/customer/profile")}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm"
        >
          <FiUser size={14} />
          Edit Profile
        </button>
      </div>

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-5">
        <img
          src={customer?.avatar || "/avatar.png"}
          onError={(e: any) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              customer?.name || "U"
            )}&background=3b82f6&color=fff&size=80`;
          }}
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          alt="avatar"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {customer?.name || "Customer"}
          </h2>
          <p className="text-gray-500 text-sm">{customer?.email}</p>
          {customer?.phone && (
            <p className="text-gray-400 text-xs mt-0.5">{customer.phone}</p>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border ${s.border} rounded-2xl p-5 flex items-center gap-4`}
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => router.push(a.route)}
            className={`${a.bg} text-white rounded-2xl p-5 text-left transition`}
          >
            <span className="text-3xl">{a.icon}</span>
            <p className="font-semibold mt-3">{a.label}</p>
            <p className="text-xs opacity-75 mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
