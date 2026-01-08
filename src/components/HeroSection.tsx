"use client";

import Link from "next/link";

export default function HeroSection() {
  const handleViewServices = () => {
    const section = document.getElementById("services");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center text-center px-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A73E8]/90 to-[#1E88E5]/70" />

      {/* Glass Card */}
      <div className="relative max-w-4xl backdrop-blur-xl bg-white/15 border border-white/20 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
          Premium Home Services <br />
          <span className="text-[#FFC107]">At Your Doorstep</span>
        </h1>

        <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
          Electricians, plumbers, cleaning & appliance repair — verified professionals you can trust.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          
          {/* ✅ Book → Customer Login */}
          <Link
            href="/customer/auth"
            className="px-8 py-3 bg-[#FFC107] text-[#212121] font-semibold rounded-full shadow-xl hover:scale-105 transition"
          >
            Book a Service
          </Link>

          {/* ✅ View Services → Scroll */}
          <button
            onClick={handleViewServices}
            className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-[#1E88E5] transition"
          >
            View Services
          </button>
        </div>
      </div>
    </section>
  );
}
