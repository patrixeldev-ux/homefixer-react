"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHome, FiPackage, FiShoppingBag,
  FiUser, FiChevronDown, FiLogOut, FiMapPin
} from "react-icons/fi";
import api from "../../../lib/api";
import { useRouter } from "next/navigation";

export default function VendorSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.post("/api/auth/logout/", {}); } catch {}
    localStorage.clear();
    router.replace("/");
  };

  const links = [
    { name: "Dashboard",  href: "/vendor/dashboard",  icon: <FiHome size={18} /> },
    { name: "Orders",     href: "/vendor/orders",      icon: <FiShoppingBag size={18} /> },
    { name: "Products",   href: "/vendor/products",    icon: <FiPackage size={18} /> },
    { name: "Profile",    href: "/vendor/profile",     icon: <FiUser size={18} /> },
    { name: "Tracking",   href: "/vendor/tracking",    icon: <FiMapPin /> }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-60 bg-white h-screen sticky top-0 shadow-md border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            V
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">HomeFixer</p>
            <p className="text-amber-600 text-xs font-medium">Vendor Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <Link key={link.href} href={link.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(link.href)
                ? "bg-amber-50 text-amber-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
            <span className={isActive(link.href) ? "text-amber-600" : "text-gray-400"}>
              {link.icon}
            </span>
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50">
          <FiLogOut size={18} />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}