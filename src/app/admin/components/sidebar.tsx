"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname(); // to highlight active page

  // helper function to check if link is active
  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 min-h-screen bg-blue-600 text-white p-6">
      {/* Logo / Title */}
      <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

      {/* Navigation */}
      <nav className="space-y-4">
        <Link
          href="/admin/dashboard"
          className={`block rounded p-2 transition ${
            isActive("/admin/dashboard") ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/leads"
          className={`block rounded p-2 transition ${
            isActive("/admin/leads") ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
        >
          Leads
        </Link>

        <Link
          href="/admin/vendors"
          className={`block rounded p-2 transition ${
            isActive("/admin/vendors") ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
        >
          Vendors
        </Link>

        <Link
          href="/admin/service-man"
          className={`block rounded p-2 transition ${
            isActive("/admin/service-man") ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
        >
          Service Men
        </Link>

        <Link
          href="/admin/categories"
          className={`block rounded p-2 transition ${
            isActive("/admin/categories") ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
        >
          Categories
        </Link>

        <Link
          href="/admin/settings"
          className={`block rounded p-2 transition ${
            isActive("/admin/settings") ? "bg-blue-500" : "hover:bg-blue-500"
          }`}
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
