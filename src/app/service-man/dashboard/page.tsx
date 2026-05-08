"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

/* ================= TYPES ================= */
interface User { name: string; email: string; }

interface Booking {
  id: number;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  problem_title: string;
  problem_description: string;
  customer_address: string | { address?: string; lat?: number; long?: number } | null;
  service_charge: string;
  platform_fee: string;
  total_amount: string;
  created_at: string;
  image_urls: string[];
}

function formatAddress(addr: Booking["customer_address"]): string {
  if (!addr) return "Address not available";
  if (typeof addr === "string") return addr;
  return addr.address || `${addr.lat ?? ""}, ${addr.long ?? ""}` || "Address not available";
}

function formatTime(date: string, time: string) {
  try {
    return new Date(`${date}T${time}`).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return `${date} ${time}`; }
}

/* ================= PAGE ================= */
export default function ServiceManDashboard() {
  const router = useRouter();
  const [loading, setLoading]           = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [isOnline, setIsOnline]         = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [user, setUser]                 = useState<User>({ name: "", email: "" });
  const [bookings, setBookings]         = useState<Booking[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/service-man/auth"); return; }
    Promise.all([fetchProfile(), fetchBookings()]).finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile/");
      const u = res.data.user;
      setUser({ name: u.name || u.email, email: u.email });
    } catch { router.replace("/service-man/auth"); }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/api/serviceman/bookings/");
      const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
      setBookings(data);
    } catch (err) { console.error("Bookings fetch failed", err); }
  };

  const handleAction = async (bookingId: number, action: "accept" | "reject") => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/api/booking/${bookingId}/action/`, { action });
      await fetchBookings();
    } catch { alert(`Failed to ${action} booking`); }
    finally { setActionLoading(null); }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try { await api.post("/api/auth/logout/", {}); } catch {}
    finally { localStorage.clear(); router.replace("/service-man/auth"); }
  };

  /* ===== STATS ===== */
  const today   = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7  * 86400000).toISOString().split("T")[0];
  const monAgo  = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const stats = [
    { label: "Today",   value: bookings.filter(b => b.status === "COMPLETED" && b.scheduled_date === today).length,              color: "bg-blue-50 text-blue-700",   icon: "✓" },
    { label: "Weekly",  value: bookings.filter(b => b.status === "COMPLETED" && b.scheduled_date >= weekAgo).length,             color: "bg-green-50 text-green-700", icon: "📅" },
    { label: "Monthly", value: bookings.filter(b => b.status === "COMPLETED" && b.scheduled_date >= monAgo).length,              color: "bg-purple-50 text-purple-700",icon: "📊" },
    { label: "Pending", value: bookings.filter(b => b.status === "PENDING").length,                                               color: "bg-orange-50 text-orange-700",icon: "⏳" },
  ];

  // Add this effect — auto-sends location every 10s when online
  useEffect(() => {
    if (!isOnline) return;

    const sendLocation = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          api.post("/api/serviceman/location/update/", {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }).catch(() => {});
        },
        (err) => console.warn("Location denied:", err),
        { enableHighAccuracy: false }
      );
    };

    sendLocation(); // immediately on going online
    const interval = setInterval(sendLocation, 10_000); // every 10s
    return () => clearInterval(interval);
  }, [isOnline]);

  const pending  = bookings.filter(b => b.status === "PENDING");
  const active   = bookings.filter(b => ["ACCEPTED", "ONGOING"].includes(b.status));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* ===== HEADER ===== */}
      <div className="bg-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500 border-2 border-white/50 flex items-center justify-center text-2xl font-bold shadow-inner">
            {user.name?.[0]?.toUpperCase() ?? "S"}
          </div>
          <div>
            <p className="text-blue-100 text-sm">Welcome back</p>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-blue-200 text-xs">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsOnline(o => !o)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isOnline ? "bg-green-500 hover:bg-green-400" : "bg-gray-500 hover:bg-gray-400"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-gray-300"}`} />
            {isOnline ? "Online" : "Offline"}
          </button>

          <button
            onClick={() => router.push("/service-man/profile")}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 hover:bg-white/30 transition-all"
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500 hover:bg-red-400 disabled:opacity-50 transition-all"
          >
            {loadingLogout ? "..." : "Logout"}
          </button>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">Completed {s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PENDING REQUESTS ===== */}
      {/* <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">
          Customer Requests
          {pending.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h2>
      </div>*/}

      {/* {pending.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center mb-6">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-gray-900 font-semibold">No pending requests</p>
          <p className="text-gray-500 text-sm mt-1">New requests will appear here</p>
        </div> 
      ) */} 
      : (
        <div className="space-y-3 mb-6">
          {pending.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 text-base capitalize">{booking.problem_title}</h3>
                  <span className="ml-2 text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full shrink-0">Pending</span>
                </div>
                <p className="text-gray-700 text-sm mt-1 line-clamp-2">{booking.problem_description}</p>
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-gray-700 text-sm flex items-center gap-1">
                    <span>📍</span>
                    <span>{formatAddress(booking.customer_address)}</span>
                  </p>
                  <p className="text-gray-700 text-sm flex items-center gap-1">
                    <span>📅</span>
                    <span>{formatTime(booking.scheduled_date, booking.scheduled_time)}</span>
                  </p>
                </div>
                <div className="mt-2 flex gap-3 text-sm">
                  <span className="text-blue-700 font-semibold">₹{booking.service_charge} service</span>
                  <span className="text-gray-400">+</span>
                  <span className="text-gray-700 font-medium">₹{booking.platform_fee} platform</span>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 justify-end sm:justify-start">
                <button
                  disabled={actionLoading === booking.id}
                  onClick={() => handleAction(booking.id, "accept")}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  {actionLoading === booking.id ? "..." : "✓ Accept"}
                </button>
                <button
                  disabled={actionLoading === booking.id}
                  onClick={() => handleAction(booking.id, "reject")}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 rounded-lg text-sm font-bold transition-colors"
                >
                  {actionLoading === booking.id ? "..." : "✕ Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )

      {/* ===== ACTIVE BOOKINGS ===== */}
      {active.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Active Bookings</h2>
          <div className="space-y-3">
            {active.map((booking) => (
              <div
                key={booking.id}
                onClick={() => router.push(`/service-man/bookings/${booking.id}`)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div>
                  <h3 className="font-bold text-gray-900 capitalize group-hover:text-blue-700 transition-colors">
                    {booking.problem_title}
                  </h3>
                  <p className="text-gray-700 text-sm mt-0.5 flex items-center gap-1">
                    <span>📍</span>{formatAddress(booking.customer_address)}
                  </p>
                  <p className="text-gray-600 text-sm flex items-center gap-1">
                    <span>📅</span>{formatTime(booking.scheduled_date, booking.scheduled_time)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === "ONGOING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {booking.status}
                  </span>
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors text-lg">→</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </main>
  );
}