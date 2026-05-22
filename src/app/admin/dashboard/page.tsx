"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  Bell,
  Users,
  Wrench,
  Store,
  CalendarDays,
  Wallet,
  Layers3,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

interface NotificationItem {
  type:
    | "vendor"
    | "serviceman"
    | "booking"
    | "wallet";

  title: string;
  message: string;
}

export default function AdminDashboardPage() {

  const router = useRouter();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const getHeaders = () => {

    const token =
      localStorage.getItem("accessToken");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const fetchNotifications = async () => {

    try {

      const headers = getHeaders();

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

      const items: NotificationItem[] = [];

      vendorsRes.data.forEach((v: any) => {

        items.push({
          type: "vendor",

          title:
            "Vendor Approval Request",

          message:
            `${v.business_name || v.name} awaiting approval`,
        });
      });

      servicemenRes.data.forEach((s: any) => {

        items.push({
          type: "serviceman",

          title:
            "Serviceman Verification",

          message:
            `${s.name} submitted verification`,
        });
      });

      bookingsRes.data
        .slice(0, 5)
        .forEach((b: any) => {

          items.push({
            type: "booking",

            title: "New Booking",

            message:
              `${b.customer_name || "Customer"} booked ${
                b.service_name || "service"
              }`,
          });
        });

      withdrawalsRes.data.forEach((w: any) => {

        items.push({
          type: "wallet",

          title:
            "Withdrawal Request",

          message:
            `${w.user_name || "User"} requested withdrawal`,
        });
      });

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

  return (
    <div className="p-6 bg-[#f7f8fc] min-h-screen">

      {/* HERO */}

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-3xl p-8 text-white shadow-sm mb-8">

        <h2 className="text-5xl font-bold">
          Welcome Back, Admin
        </h2>

        <p className="text-slate-300 mt-3 text-lg">
          Manage users, approvals, bookings and payments
        </p>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">

        {/* TOTAL USERS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">

          <div className="flex items-center justify-between text-black">

            <div>
              <p className="text-slate-500 text-sm">
                Total Users
              </p>

              <h2 className="text-5xl font-bold mt-4">
                11
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users size={28} />
            </div>
          </div>
        </div>

        {/* CUSTOMERS */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-blue-700 text-sm font-medium">
                Customers
              </p>

              <h2 className="text-5xl font-bold mt-4 text-slate-900">
                3
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-blue-200 text-blue-700 flex items-center justify-center">
              <Users size={28} />
            </div>
          </div>
        </div>

        {/* VENDORS */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-orange-700 text-sm font-medium">
                Vendors
              </p>

              <h2 className="text-5xl font-bold mt-4 text-slate-900">
                3
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-200 text-orange-700 flex items-center justify-center">
              <Store size={28} />
            </div>
          </div>
        </div>

        {/* SERVICEMEN */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-green-700 text-sm font-medium">
                Servicemen
              </p>

              <h2 className="text-5xl font-bold mt-4 text-slate-900">
                4
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-green-200 text-green-700 flex items-center justify-center">
              <Wrench size={28} />
            </div>
          </div>
        </div>

        {/* BOOKINGS */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 border-2 border-violet-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-violet-700 text-sm font-medium">
                Bookings
              </p>

              <h2 className="text-5xl font-bold mt-4 text-slate-900">
                14
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-violet-200 text-violet-700 flex items-center justify-center">
              <CalendarDays size={28} />
            </div>
          </div>
        </div>

        {/* WITHDRAWALS */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-red-700 text-sm font-medium">
                Withdrawals
              </p>

              <h2 className="text-5xl font-bold mt-4 text-slate-900">
                0
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-200 text-red-700 flex items-center justify-center">
              <Wallet size={28} />
            </div>
          </div>
        </div>
      </div>


      {/* QUICK ACTIONS */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">

        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

          <button
            onClick={() => router.push("/admin/users")}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users />
            </div>

            <span className="font-semibold text-slate-800">
              Users
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/bookings")}
            className="bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <CalendarDays />
            </div>

            <span className="font-semibold text-slate-800">
              Bookings
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/approval")}
            className="bg-green-50 hover:bg-green-100 border border-green-100 rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
              <Wrench />
            </div>

            <span className="font-semibold text-slate-800">
              Approval
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/vendors")}
            className="bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Store />
            </div>

            <span className="font-semibold text-slate-800">
              Vendors
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/categories")}
            className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Layers3 />
            </div>

            <span className="font-semibold text-slate-800">
              Categories
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/wallet")}
            className="bg-red-50 hover:bg-red-100 border border-red-100 rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
              <Wallet />
            </div>

            <span className="font-semibold text-slate-800">
              Wallet
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}