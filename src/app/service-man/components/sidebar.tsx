"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FiHome,
  FiUsers,
  FiClipboard,
  FiMapPin,
  FiPackage,
  FiUser,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";

// ── Menu ordered by serviceman workflow ───────────────────────────────────────
const menuGroups = [
  { group: "OVERVIEW", items: [
    { name: "Dashboard",       icon: <FiHome size={16} />,      link: "/service-man/dashboard" },
  ]},
  { group: "WORK FLOW", items: [
    { name: "User Requests",   icon: <FiUsers size={16} />,     link: "/service-man/userrequest" },
    { name: "My Bookings",     icon: <FiClipboard size={16} />, link: "/service-man/bookings" },
    { name: "Live Tracking",   icon: <FiMapPin size={16} />,    link: "/service-man/tracking" },
    { name: "Products",        icon: <FiPackage size={16} />,   link: "/service-man/products" },
  ]},
  { group: "ACCOUNT", items: [
    { name: "My Profile",      icon: <FiUser size={16} />,      link: "/service-man/profile" },
    { name: "Help Center",     icon: <FiHelpCircle size={16} />,link: "/service-man/help-center" },
    { name: "Settings",        icon: <FiSettings size={16} />,  link: "/service-man/settings" },
  ]},
];

export default function ServicemanSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    // Exact match for tracking index — don't highlight when on /tracking/[id] (full-screen, no sidebar)
    if (href === "/service-man/tracking") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-60 h-screen bg-[#0B1C2D] text-[#A9B7D0] flex flex-col flex-shrink-0">

      {/* Logo */}
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
                  href={item.link}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                    isActive(item.link)
                      ? "bg-blue-600/20 text-white"
                      : "text-[#A9B7D0] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={isActive(item.link) ? "text-blue-400" : "text-[#6C7A96]"}>
                    {item.icon}
                  </span>
                  {item.name}
                  {isActive(item.link) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
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
          Serviceman Portal
        </p>
      </div>
    </aside>
  );
}
