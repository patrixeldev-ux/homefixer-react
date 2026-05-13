"use client";

import Link from "next/link";

export default function HeroSection() {
  const handleViewServices = () => {
    const section = document.getElementById("services");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 py-20 text-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_32%),linear-gradient(135deg,rgba(11,50,118,0.9),rgba(30,136,229,0.76)_58%,rgba(99,102,241,0.76))]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/20 to-transparent" />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-4xl rounded-[36px] border border-white/25 bg-white/18 p-10 shadow-[0_30px_90px_rgba(15,23,42,0.28)] backdrop-blur-2xl transition-all duration-300 md:p-14">
          <div className="mx-auto max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-white/30 bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              Trusted Home Care
            </p>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
              Premium Home Services
              <span className="mt-2 block bg-gradient-to-r from-[#FFD54F] via-[#FFC107] to-[#FFB300] bg-clip-text text-transparent">
                At Your Doorstep
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-gray-900 md:text-xl">
              Electricians, plumbers, cleaning and appliance repair from
              verified professionals you can trust for every corner of your
              home.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth"
                className="rounded-full border border-white/70 bg-white/5 px-8 py-3.5 text-base font-semibold text-yellow-200 shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#1E88E5]"
              >
                Book a Service
              </Link>

              <button
                onClick={handleViewServices}
                className="rounded-full border border-white/70 bg-white/5 px-8 py-3.5 text-base font-semibold text-yellow-200 shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#1E88E5]"
              >
                View Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
