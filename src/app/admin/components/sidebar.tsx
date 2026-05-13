"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "../../../lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
<<<<<<< HEAD
      await api.post("/auth/logout");
=======
      await api.post("/api/auth/logout");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
    } catch {}
    finally {
      localStorage.clear();
      router.push("/");
    }
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboards", section: "DASHBOARDS" },
    { href: "/admin/users-page", label: "Users", section: "DASHBOARDS" },

    { href: "/admin/service-man", label: "Service Man", section: "VENDORS" },
    { href: "/admin/vendors", label: "Vendors", section: "VENDORS" },
    { href: "/admin/products", label: "Products", section: "VENDORS" },
    { href: "/admin/categories", label: "Categories", section: "VENDORS" },
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

        {["DASHBOARDS", "VENDORS"].map((section) => (
          <div key={section}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6C7A96]">
              {section}
            </p>

            <div className="space-y-1">
              {navItems
                .filter((item) => item.section === section)
                .map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center justify-between px-4 py-2 rounded-md transition
                      ${
                        isActive(href)
                          ? "bg-blue-600/20 text-white"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <span>{label}</span>
                    <span className="text-xs opacity-60">▾</span>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
