"use client";

import { useRouter } from "next/navigation";

const values = [
  {
    num: "01",
    title: "Trust & Safety",
    desc: "Every serviceman is background-verified and skill-tested before joining our platform. You always know who's coming to your home.",
  },
  {
    num: "02",
    title: "Speed",
    desc: "We connect you to the nearest available professional within minutes, not hours. Fast booking, faster service.",
  },
  {
    num: "03",
    title: "Transparent Pricing",
    desc: "No hidden charges. You see the full breakdown before confirming any booking — service charge, platform fee, and materials.",
  },
  {
    num: "04",
    title: "Local First",
    desc: "We source materials from local vendors within 10 km, supporting your community while keeping costs low.",
  },
  {
    num: "05",
    title: "Real-Time Tracking",
    desc: "Track your serviceman live on the map from the moment they accept your booking until the job is done.",
  },
  {
    num: "06",
    title: "End-to-End Flow",
    desc: "From booking to material sourcing to final payment — everything happens in one seamless platform.",
  },
];

const team = [
  { name: "Disha Patel",  role: "Founder & CEO",    emoji: "👩‍💼" },
  { name: "Raj Solanki",  role: "CTO",               emoji: "👨‍💻" },
  { name: "Meera Shah",   role: "Operations Head",   emoji: "👩‍🔧" },
  { name: "Arjun Mehta",  role: "Product Lead",      emoji: "👨‍🎨" },
];

const stats = [
  { value: "10,000+", label: "Homes Served" },
  { value: "500+",    label: "Verified Pros" },
  { value: "4.8★",    label: "Avg Rating" },
  { value: "50+",     label: "Cities" },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 py-24 text-center"
        style={{
          background: "linear-gradient(135deg, #0b1e4a 0%, #0d3b8e 25%, #1565c0 45%, #1e88e5 65%, #42a5f5 80%, #7c3aed 100%)",
        }}
      >
        <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />

        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto max-w-2xl rounded-[36px] border border-white/20 bg-white/10 px-10 py-12 shadow-[0_30px_90px_rgba(15,23,42,0.4)] backdrop-blur-xl">
            <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              Our Story
            </p>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              About HomeFixer
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-blue-100">
              We're on a mission to make home maintenance stress-free — connecting homeowners with trusted local professionals who get the job done right.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#F8FAFC] py-16 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-[#1E88E5]">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-blue-50 py-28 px-6">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5] mb-4">Our Mission</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl mb-6">
              Making Home Services Reliable
            </h2>
            <p className="text-lg leading-8 text-slate-600 mb-4">
              HomeFixer was born out of frustration with unreliable repair services. We built a platform where every serviceman is verified, every price is transparent, and every job is tracked in real time.
            </p>
            <p className="text-lg leading-8 text-slate-600">
              Our unique model connects customers, servicemen, and local material vendors in one seamless flow — ensuring faster service and lower costs for everyone.
            </p>
          </div>
          <div className="rounded-[30px] border border-slate-200 bg-white p-10 shadow-[0_22px_50px_rgba(15,23,42,0.08)] text-center">
            <div className="text-6xl mb-5">🏠</div>
            <p className="text-4xl font-bold text-[#1E88E5] mb-1">10,000+</p>
            <p className="text-slate-500 text-sm mb-8">Homes Served</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-[#1E88E5]">500+</p>
                <p className="text-xs text-slate-500 mt-1">Verified Pros</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-[#1E88E5]">4.8★</p>
                <p className="text-xs text-slate-500 mt-1">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-[#F8FAFC] py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5] mb-4">What Drives Us</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Our Core Values</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Every decision we make is guided by these principles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(v => (
              <div key={v.title}
                className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_22px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(37,99,235,0.14)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E88E5] to-indigo-600 text-sm font-bold text-white shadow-lg mb-6">
                  {v.num}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{v.title}</h3>
                <p className="text-base leading-7 text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-blue-50 py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5] mb-4">The People</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(m => (
              <div key={m.name}
                className="rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_22px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(37,99,235,0.14)]">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {m.emoji}
                </div>
                <p className="font-semibold text-slate-900">{m.name}</p>
                <p className="text-[#1E88E5] text-xs mt-1 font-medium">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-6 text-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0b1e4a 0%, #0d3b8e 25%, #1565c0 50%, #7c3aed 100%)",
        }}
      >
        <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }} />

        <div className="relative mx-auto w-fit">
          <div className="rounded-[36px] border border-white/20 bg-white/10 px-12 py-12 shadow-[0_30px_90px_rgba(15,23,42,0.4)] backdrop-blur-xl max-w-xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Join the HomeFixer Family</h2>
          <p className="text-blue-200 text-lg mb-8">Whether you're a customer, serviceman, or vendor — there's a place for you here.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => router.push("/auth")}
              className="rounded-full border border-white/70 bg-white/10 px-8 py-3.5 text-base font-semibold text-yellow-200 transition-all hover:scale-105 hover:bg-white hover:text-[#1E88E5]">
              Book a Service
            </button>
            <button onClick={() => router.push("/contact")}
              className="rounded-full border border-white/70 bg-white/10 px-8 py-3.5 text-base font-semibold text-yellow-200 transition-all hover:scale-105 hover:bg-white hover:text-[#1E88E5]">
              Get in Touch
            </button>
          </div>
          </div>
        </div>
      </section>

    </div>
  );
}
