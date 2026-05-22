"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle2,
  Tag,
  Package,
  Users,
  CalendarDays,
  Wallet,
  Settings,
} from "lucide-react";

// ── Admin nav structure ───────────────────────────────────────────────────────
const menuGroups = [
  {
    group: "OVERVIEW",
    items: [
      { name: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
    ],
  },
  {
    group: "MANAGEMENT",
    items: [
      { name: "Users",      href: "/admin/users",      icon: Users          },
      { name: "Bookings",   href: "/admin/bookings",   icon: CalendarDays   },
      { name: "Approval",   href: "/admin/approval",   icon: CheckCircle2   },
    ],
  },
  {
    group: "CATALOGUE",
    items: [
      { name: "Categories", href: "/admin/categories", icon: Tag            },
      { name: "Products",   href: "/admin/products",   icon: Package        },
    ],
  },
  {
    group: "FINANCE",
    items: [
      { name: "Wallet",     href: "/admin/wallet",     icon: Wallet         },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { name: "Settings",   href: "/admin/settings",   icon: Settings       },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-60 h-screen bg-[#0B1C2D] text-[#A9B7D0] flex flex-col flex-shrink-0">

      {/* ── Logo ── */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
        <h1 className="text-xl font-bold text-white tracking-wide">
          Home<span className="text-blue-400">Fixer</span>
        </h1>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm">
        {menuGroups.map((group) => (
          <div key={group.group}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[#4A5568]">
              {group.group}
            </p>

            <div className="space-y-0.5">
              {group.items.map(({ name, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={name}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                      active
                        ? "bg-blue-600/20 text-white"
                        : "text-[#A9B7D0] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={active ? "text-blue-400" : "text-[#6C7A96]"}>
                      <Icon size={16} />
                    </span>

                    {name}

                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom role tag ── */}
      <div className="px-5 py-3 border-t border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A5568]">
          Admin Portal
        </p>
      </div>
    </aside>
  );
}