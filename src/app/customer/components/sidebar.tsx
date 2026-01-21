"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiUser,
  FiPackage,
  FiHelpCircle,
  FiLogOut,
  FiCalendar,
  FiClipboard,
} from "react-icons/fi";
import api from "../../../lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch {}
    finally {
      localStorage.clear();
      router.push("/");
    }
  };

  const menuItems = [
    { name: "Book Service", icon: <FiCalendar />, link: "/customer/booking" },
    { name: "My Bookings", icon: <FiClipboard />, link: "/customer/my-bookings" },
    { name: "Dashboard", icon: <FiHome />, link: "/customer/dashboard" },
    { name: "Products", icon: <FiPackage />, link: "/customer/products" },
    { name: "My Profile", icon: <FiUser />, link: "/customer/profile" },
    { name: "Help Center", icon: <FiHelpCircle />, link: "/customer/help-center" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 min-h-screen bg-[#0B1C2D] text-[#A9B7D0] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Home<span className="text-blue-400">Fixer</span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-6 text-sm">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6C7A96]">
            CUSTOMER
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                className={`flex items-center justify-between px-4 py-2 rounded-md transition
                  ${
                    isActive(item.link)
                      ? "bg-blue-600/20 text-white"
                      : "hover:bg-white/5 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                <span className="text-xs opacity-60">▾</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition flex items-center gap-3"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
