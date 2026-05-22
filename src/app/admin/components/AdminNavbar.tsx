"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { Bell } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

const PAGE_META: Record<
  string,
  {
    title: string;
    subtitle: string;
  }
> = {
  "/admin/dashboard": {
    title: "Admin Dashboard",
    subtitle:
      "Manage users, approvals and bookings",
  },

  "/admin/users": {
    title: "Users",
    subtitle:
      "View and manage all registered users",
  },

  "/admin/bookings": {
    title: "Bookings",
    subtitle:
      "Monitor all service bookings",
  },

  "/admin/approval": {
    title: "Approvals",
    subtitle:
      "Review pending vendor and serviceman requests",
  },

  "/admin/categories": {
    title: "Categories",
    subtitle:
      "Manage product and service categories",
  },

  "/admin/products": {
    title: "Products",
    subtitle:
      "Browse and manage vendor products",
  },

  "/admin/wallet": {
    title: "Wallet",
    subtitle:
      "Track withdrawals and payments",
  },

  "/admin/settings": {
    title: "Settings",
    subtitle:
      "Configure platform settings",
  },
};

interface NotificationItem {
  id: string;

  type:
    | "vendor"
    | "serviceman"
    | "booking"
    | "wallet";

  title: string;

  message: string;
}

const TYPE_STYLE: Record<
  string,
  string
> = {
  vendor:
    "bg-orange-50 border-orange-100",

  serviceman:
    "bg-green-50 border-green-100",

  wallet:
    "bg-red-50 border-red-100",

  booking:
    "bg-blue-50 border-blue-100",
};

export default function AdminNavbar() {

  const pathname = usePathname();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [readNotifications, setReadNotifications] =
    useState<string[]>([]);

  const [open, setOpen] =
    useState(false);

  const meta =
    PAGE_META[pathname] ??
    Object.entries(PAGE_META).find(
      ([key]) =>
        pathname.startsWith(key + "/")
    )?.[1] ?? {
      title: "Admin",
      subtitle:
        "HomeFixer admin panel",
    };

  /*
    =====================================
    LOAD READ IDS
    =====================================
  */

  useEffect(() => {

    const stored =
      localStorage.getItem(
        "readNotifications"
      );

    if (stored) {

      setReadNotifications(
        JSON.parse(stored)
      );
    }

  }, []);

  /*
    =====================================
    HEADERS
    =====================================
  */

  const getHeaders = () => {

    const token =
      localStorage.getItem(
        "accessToken"
      );

    return token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {};
  };

  /*
    =====================================
    FETCH NOTIFICATIONS
    =====================================
  */

  const fetchNotifications =
    async () => {

      try {

        const headers =
          getHeaders();

        const [
          vendorsRes,
          servicemenRes,
          bookingsRes,
          withdrawalsRes,
        ] = await Promise.all([

          axios.get(
            `${API_BASE}/admin/vendors/pending/`,
            { headers }
          ),

          axios.get(
            `${API_BASE}/admin/servicemen/pending/`,
            { headers }
          ),

          axios.get(
            `${API_BASE}/admin/bookings/all/`,
            { headers }
          ),

          axios.get(
            `${API_BASE}/admin/withdrawals/`,
            { headers }
          ),
        ]);

        const items: NotificationItem[] =
          [];

        /*
          =========================
          VENDORS
          =========================
        */

        vendorsRes.data.forEach(
          (v: any) => {

            items.push({
              id: `vendor-${v.id}`,

              type: "vendor",

              title:
                "Vendor Approval Request",

              message:
                `${v.business_name || v.name} awaiting approval`,
            });
          }
        );

        /*
          =========================
          SERVICEMEN
          =========================
        */

        servicemenRes.data.forEach(
          (s: any) => {

            items.push({
              id: `serviceman-${s.id}`,

              type: "serviceman",

              title:
                "Serviceman Verification",

              message:
                `${s.name} submitted verification`,
            });
          }
        );

        /*
          =========================
          BOOKINGS
          =========================
        */

        bookingsRes.data
          .slice(0, 5)
          .forEach((b: any) => {

            items.push({
              id: `booking-${b.id}`,

              type: "booking",

              title: "New Booking",

              message:
                `${b.customer_name || "Customer"} booked ${
                  b.service_name ||
                  "service"
                }`,
            });
          });

        /*
          =========================
          WITHDRAWALS
          =========================
        */

        withdrawalsRes.data.forEach(
          (w: any) => {

            items.push({
              id: `wallet-${w.id}`,

              type: "wallet",

              title:
                "Withdrawal Request",

              message:
                `${w.user_name || "User"} requested withdrawal`,
            });
          }
        );

        setNotifications(items);

      } catch (err) {

        console.error(
          "NOTIFICATION ERROR:",
          err
        );
      }
    };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /*
    =====================================
    FILTER UNREAD
    =====================================
  */

  const unreadNotifications =
    useMemo(() => {

      return notifications.filter(
        (n) =>
          !readNotifications.includes(
            n.id
          )
      );

    }, [
      notifications,
      readNotifications,
    ]);

  /*
    =====================================
    MARK ALL READ
    =====================================
  */

  const markAllAsRead = () => {

    const allIds =
      notifications.map(
        (n) => n.id
      );

    setReadNotifications(allIds);

    localStorage.setItem(
      "readNotifications",
      JSON.stringify(allIds)
    );
  };

  /*
    =====================================
    CLOSE DROPDOWN
    =====================================
  */

  useEffect(() => {

    if (!open) return;

    const handler = () =>
      setOpen(false);

    document.addEventListener(
      "click",
      handler
    );

    return () =>
      document.removeEventListener(
        "click",
        handler
      );

  }, [open]);

  /*
    =====================================
    LOGOUT
    =====================================
  */

  const handleLogout = () => {

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    localStorage.removeItem(
      "readNotifications"
    );

    window.location.href = "/auth";
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl px-6 py-5 flex items-center justify-between shadow-sm mb-6 flex-shrink-0">

      {/* LEFT */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          {meta.title}
        </h1>

        <p className="text-slate-500 mt-1 text-sm">
          {meta.subtitle}
        </p>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-4">

        {/* NOTIFICATIONS */}

        <div
          className="relative"
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          <button
            onClick={() =>
              setOpen((v) => !v)
            }
            className="relative w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center"
          >

            <Bell className="w-5 h-5 text-slate-700" />

            {unreadNotifications.length >
              0 && (

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {open && (

            <div className="absolute right-0 top-14 w-[360px] bg-white border border-slate-200 rounded-3xl shadow-xl p-4 z-50">

              <div className="flex items-center justify-between mb-4">

                <h3 className="font-bold text-slate-900">
                  Notifications
                </h3>

                {notifications.length >
                  0 && (

                  <button
                    disabled={
                      unreadNotifications.length ===
                      0
                    }
                    onClick={
                      markAllAsRead
                    }
                    className={`text-xs font-semibold transition-colors ${
                      unreadNotifications.length ===
                      0
                        ? "text-slate-400 cursor-default"
                        : "text-blue-600 hover:text-blue-700 hover:underline"
                    }`}
                  >

                    {unreadNotifications.length >
                    0
                      ? "Mark all as read"
                      : "All caught up"}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">

                {notifications.length ===
                0 ? (

                  <p className="text-sm text-slate-500 text-center py-6">
                    No notifications
                  </p>

                ) : (

                  notifications.map(
                    (n) => {

                      const isRead =
                        readNotifications.includes(
                          n.id
                        );

                      return (

                        <div
                          key={n.id}
                          className={`p-4 rounded-2xl border transition-opacity ${
                            TYPE_STYLE[
                              n.type
                            ]
                          } ${
                            isRead
                              ? "opacity-60"
                              : ""
                          }`}
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="text-sm font-semibold text-slate-900">
                                {n.title}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {n.message}
                              </p>
                            </div>

                            {!isRead && (

                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
}