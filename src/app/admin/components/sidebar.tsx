"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// Uncomment below if you have react-icons installed
// import { FiHome, FiUsers, FiBox, FiTool, FiLayers, FiSettings, FiLogOut } from "react-icons/fi";

export default function Sidebar() {
  const pathname = usePathname();

  // Navigation items
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" /*, icon: <FiHome /> */ },
    { href: "/admin/users-page", label: "Users" /*, icon: <FiUsers /> */ },
    { href: "/admin/vendors", label: "Vendors" /*, icon: <FiBox /> */ },
    { href: "/admin/service-man", label: "Service Men" /*, icon: <FiTool /> */ },
    { href: "/admin/categories", label: "Categories" /*, icon: <FiLayers /> */ },
    { href: "/admin/settings", label: "Settings" /*, icon: <FiSettings /> */ },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg p-6 flex flex-col">
      
      {/* Logo / Title */}
      <div className="mb-10 flex items-center gap-3">
        <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-blue-800 font-bold text-lg">
          A
        </div>
        <h2 className="text-2xl font-bold tracking-wide">Admin Panel</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block p-3 rounded-lg font-medium transition-all flex items-center gap-2
              ${
                isActive(href)
                  ? "bg-white bg-opacity-20 text-blue-900 border-l-4 border-white pl-2"
                  : "text-white hover:bg-blue-700"
              }`}
          >
            {/* Optional icon if installed */}
            {/* {icon && <span className="text-lg">{icon}</span>} */}
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto">
        <button className="w-full p-3 rounded-lg bg-red-600 hover:bg-red-500 transition text-white font-medium flex items-center justify-center gap-2">
          {/* Optional icon */}
          {/* <FiLogOut /> */}
          Logout
        </button>
      </div>
    </aside>
  );
}
