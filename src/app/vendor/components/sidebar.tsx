"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiMapPin,
  FiUser,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";

const menuGroups = [
  { group: "OVERVIEW", items: [
    { name: "Dashboard", href: "/vendor/dashboard", icon: <FiHome size={16} /> },
  ]},
  { group: "OPERATIONS", items: [
    { name: "Orders",    href: "/vendor/orders",    icon: <FiShoppingBag size={16} /> },
    { name: "Products",  href: "/vendor/products",  icon: <FiPackage size={16} /> },
    { name: "Tracking",  href: "/vendor/tracking",  icon: <FiMapPin size={16} /> },
  ]},
  { group: "ACCOUNT", items: [
    { name: "Profile",     href: "/vendor/profile",      icon: <FiUser size={16} /> },
    { name: "Help Center", href: "/vendor/help-center",  icon: <FiHelpCircle size={16} /> },
    { name: "Settings",    href: "/vendor/settings",     icon: <FiSettings size={16} /> },
  ]},
];

export default function VendorSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-60 h-screen bg-[#0B1C2D] text-[#A9B7D0] flex flex-col flex-shrink-0">

      {/* Logo — no label */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center">
        <Image src="/logo.jpeg" alt="HomeFixer" width={120} height={40} style={{ width: "auto", height: "auto" }} className="h-10 object-contain" loading="eager" priority />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm">
        {menuGroups.map(group => (
          <div key={group.group}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[#4A5568]">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                    isActive(item.href)
                      ? "bg-orange-500/20 text-white"
                      : "text-[#A9B7D0] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={isActive(item.href) ? "text-orange-400" : "text-[#6C7A96]"}>
                    {item.icon}
                  </span>
                  {item.name}
                  {isActive(item.href) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom role tag */}
      <div className="px-5 py-3 border-t border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A5568]">
          Vendor Portal
        </p>
      </div>
    </aside>
  );
}
