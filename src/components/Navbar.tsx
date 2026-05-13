"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Hide on dashboard/app areas — they have their own sidebars
  // Auth pages (/service-man/auth, /vendor/auth) are allowed through
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/service-man") && pathname !== "/service-man/auth") return null;
  if (pathname.startsWith("/customer")) return null;
  if (pathname.startsWith("/vendor") && pathname !== "/vendor/auth") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/90 px-6 py-3 shadow-[0_4px_24px_rgba(15,23,42,0.07)] backdrop-blur-xl md:px-8">
      <div className="flex items-center justify-between w-full">

        {/* Logo */}
        <Link href="/" className="group inline-flex items-center">
          <Image
            src="/logo.jpeg"
            alt="HomeFixer"
            width={180}
            height={56}
            priority
            className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] md:h-18"
          />
        </Link>

        {/* Nav links + auth buttons */}
        <div className="flex items-center gap-1 md:gap-2">

          <Link
            href="/about"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pathname === "/about"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pathname === "/contact"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            Contact Us
          </Link>

          <Link
            href="/feedback"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pathname === "/feedback"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            Feedback
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-2" />

          {/* Login — goes directly to unified auth page */}
          <Link
            href="/auth"
            className="rounded-full border border-[#1E88E5] px-5 py-2.5 text-sm font-semibold text-[#1E88E5] transition-all duration-300 hover:bg-blue-50 hover:scale-105"
          >
            Login
          </Link>

          {/* Register — shows role selection page */}
          <Link
            href="/choose-role"
            className="rounded-full bg-[#1E88E5] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
