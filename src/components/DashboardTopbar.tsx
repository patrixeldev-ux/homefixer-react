"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FiLogOut, FiBell, FiCheck, FiCheckCircle,
  FiAlertCircle, FiInfo, FiX, FiPackage,
} from "react-icons/fi";
import api from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardTopbarProps {
  accentClass?: string;
  roleLabel: string;
  logoutEndpoint: string;
  logoutRedirect: string;
  /** If true, polls customer bookings and injects a local notification when final payment is due */
  checkFinalPayment?: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "order";
  is_read: boolean;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  const map: Record<string, string> = {
    dashboard:      "Dashboard",
    booking:        "Book a Service",
    "my-bookings":  "My Bookings",
    bookings:       "My Bookings",
    products:       "Products",
    profile:        "My Profile",
    settings:       "Settings",
    "help-center":  "Help Center",
    userrequest:    "Customer Requests",
    maps:           "Live Tracking",
    tracking:       "Tracking",
    orders:         "Orders",
    "my-cart":      "My Cart",
  };
  return map[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function NotifIcon({ type }: { type: Notification["type"] }) {
  const map = {
    success: <FiCheckCircle size={14} className="text-green-500" />,
    warning: <FiAlertCircle size={14} className="text-amber-500" />,
    order:   <FiPackage     size={14} className="text-blue-500"  />,
    info:    <FiInfo        size={14} className="text-slate-400" />,
  };
  return map[type] ?? map.info;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardTopbar({
  accentClass = "bg-blue-600",
  roleLabel,
  logoutEndpoint,
  logoutRedirect,
  checkFinalPayment = false,
}: DashboardTopbarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  // User
  const [userName,  setUserName]  = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Notifications
  const [notifs,       setNotifs]       = useState<Notification[]>([]);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // ── Load user name ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      // 1. Try localStorage first (instant)
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw) as { name?: string; email?: string };
          if (u.name || u.email) {
            setUserName(u.name || u.email || "");
            setUserEmail(u.email || "");
            return;
          }
        }
      } catch { /* ignore */ }

      // 2. Decode JWT payload
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1])) as {
            name?: string; email?: string;
          };
          if (payload.name || payload.email) {
            setUserName(payload.name || payload.email || "");
            setUserEmail(payload.email || "");
            return;
          }
        }
      } catch { /* ignore */ }

      // 3. Fetch from API as last resort
      try {
        const res = await api.get("/api/profile/");
        const u = res.data?.user ?? res.data;
        const name = u?.name || u?.email || "";
        setUserName(name);
        setUserEmail(u?.email || "");
        // Cache it
        if (name) localStorage.setItem("user", JSON.stringify({ name, email: u?.email }));
      } catch { /* ignore */ }
    };
    load();
  }, []);

  // ── Fetch notifications ─────────────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.get("/api/notifications/");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results ?? res.data?.notifications ?? [];
      setNotifs(data);
    } catch {
      // Endpoint may not exist yet — show empty state gracefully
      setNotifs([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Open dropdown → fetch
  const handleBellClick = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) fetchNotifs();
  };

  // Mark single notification as read
  const markRead = async (id: number) => {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
    } catch { /* ignore */ }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await api.post("/api/notifications/mark-all-read/");
    } catch { /* ignore */ }
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // ── Poll customer bookings for final payment due (customer only) ───────────
  useEffect(() => {
    if (!checkFinalPayment) return;

    const checkBookings = async () => {
      try {
        const res = await api.get("/api/customer/bookings/", { params: { section: "active" } });
        const bookings: Array<{
          id: number;
          service_name: string;
          final_payment_status: string;
          status: string;
          final_amount?: string;
        }> = Array.isArray(res.data) ? res.data : res.data?.results ?? [];

        // Find bookings where serviceman marked done but customer hasn't paid
        const due = bookings.filter(b =>
          b.final_payment_status === "pending" &&
          (b.status === "ongoing" || b.status === "completed")
        );

        if (due.length > 0) {
          // Inject local notifications for each unpaid booking
          const localNotifs: Notification[] = due.map(b => ({
            id: -(b.id), // negative ID to avoid collision with real notifs
            title: "Final Payment Required",
            message: `${b.service_name || "Service"} is complete. Pay ₹${b.final_amount || ""} to close booking #${b.id}.`,
            type: "warning" as const,
            is_read: false,
            created_at: new Date().toISOString(),
          }));
          // Merge with existing notifs, avoiding duplicates
          setNotifs(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newOnes = localNotifs.filter(n => !existingIds.has(n.id));
            return [...newOnes, ...prev];
          });
        }
      } catch { /* ignore */ }
    };

    checkBookings();
    const interval = setInterval(checkBookings, 30000); // every 30s
    return () => clearInterval(interval);
  }, [checkFinalPayment]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.post(logoutEndpoint); } catch { /* ignore */ }
    finally {
      localStorage.clear();
      router.replace(logoutRedirect);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const pageTitle   = getPageTitle(pathname);
  const initial     = userName?.[0]?.toUpperCase() || roleLabel[0].toUpperCase();
  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-white border-b border-gray-100 shadow-sm z-50 relative">

      {/* Page title */}
      <h2 className="font-bold text-gray-900 text-base">{pageTitle}</h2>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* ── Bell button + dropdown ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors relative"
            aria-label="Notifications"
          >
            <FiBell size={16} className="text-gray-600" />
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                      <FiBell size={20} className="text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700 text-sm">All caught up!</p>
                    <p className="text-gray-400 text-xs mt-1">No notifications yet</p>
                  </div>
                ) : (
                  <div>
                    {notifs.map((n, i) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && markRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                          n.is_read
                            ? "bg-white hover:bg-gray-50"
                            : "bg-blue-50/60 hover:bg-blue-50"
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          n.type === "success" ? "bg-green-100" :
                          n.type === "warning" ? "bg-amber-100" :
                          n.type === "order"   ? "bg-blue-100"  :
                          "bg-gray-100"
                        }`}>
                          <NotifIcon type={n.type} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight ${n.is_read ? "text-gray-700" : "text-gray-900 font-semibold"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                        </div>

                        {/* Unread dot */}
                        {!n.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifs.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => { setNotifOpen(false); fetchNotifs(); }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold w-full text-center"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User chip ── */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100 min-w-0">
          {/* Avatar */}
          <div className={`w-7 h-7 ${accentClass} rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initial}
          </div>
          {/* Name */}
          {userName && (
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-800 truncate max-w-[110px] leading-tight">
                {userName}
              </span>
              {userEmail && userName !== userEmail && (
                <span className="text-[10px] text-gray-400 truncate max-w-[110px] leading-tight">
                  {userEmail}
                </span>
              )}
            </div>
          )}
          {/* Role badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${accentClass} hidden md:block flex-shrink-0`}>
            {roleLabel}
          </span>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100 transition-all disabled:opacity-50 flex-shrink-0"
          title="Logout"
        >
          <FiLogOut size={15} />
          <span className="hidden sm:block">{loggingOut ? "Logging out…" : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
