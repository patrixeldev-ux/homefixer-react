"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm]           = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  const contacts = [
    { icon: "📧", title: "Email Us",  value: "admin@homefixer.com",  sub: "We reply within 24 hours",  gradient: "from-blue-500/15 to-indigo-500/15" },
    { icon: "📞", title: "Call Us",   value: "+91 98765 43210",       sub: "Mon–Sat, 9 AM – 7 PM",      gradient: "from-cyan-500/15 to-sky-500/15"    },
    { icon: "📍", title: "Visit Us",  value: "Vadodara, Gujarat",     sub: "India 390001",               gradient: "from-amber-400/20 to-yellow-300/20"},
  ];

  const inp = "w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent text-sm bg-white transition";

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden px-6 py-24 text-center"
        style={{
          background: "linear-gradient(135deg, #0b1e4a 0%, #0d3b8e 25%, #1565c0 45%, #1e88e5 65%, #42a5f5 80%, #7c3aed 100%)",
        }}
      >
        {/* Aurora blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />

        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto max-w-2xl rounded-[36px] border border-white/20 bg-white/10 px-10 py-12 shadow-[0_30px_90px_rgba(15,23,42,0.4)] backdrop-blur-xl">
            <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              We're Here
            </p>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg font-medium leading-8 text-blue-100">
              Have a question, issue, or suggestion? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact cards ── */}
      <section className="bg-[#F8FAFC] py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5] mb-4">Reach Out</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Ways to Connect</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Choose the channel that works best for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contacts.map((c, i) => (
              <div key={i}
                className="rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-[0_22px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(37,99,235,0.14)]">
                <div className={`w-16 h-16 bg-gradient-to-br ${c.gradient} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-inner`}>
                  {c.icon}
                </div>
                <p className="font-semibold text-slate-900 text-lg mb-1">{c.title}</p>
                <p className="text-[#1E88E5] font-semibold text-sm">{c.value}</p>
                <p className="text-slate-400 text-xs mt-1">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-blue-50 py-28 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5] mb-4">Send a Message</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">We'd Love to Hear From You</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">Fill the form and our team will get back to you promptly.</p>
          </div>

          {submitted ? (
            <div className="rounded-[30px] border border-slate-200 bg-white p-14 text-center shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
              <div className="text-6xl mb-5">✅</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Message Sent!</h3>
              <p className="text-slate-600 mb-8">Thank you for reaching out. We'll reply within 24 hours.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                className="rounded-full border border-[#1E88E5] px-8 py-3 text-sm font-semibold text-[#1E88E5] hover:bg-blue-50 transition">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}
              className="rounded-[30px] border border-slate-200 bg-white p-10 shadow-[0_22px_50px_rgba(15,23,42,0.08)] space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name" className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210" className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className={inp}>
                    <option value="">Select a topic</option>
                    <option>Booking Issue</option>
                    <option>Payment Problem</option>
                    <option>Serviceman Complaint</option>
                    <option>Vendor Inquiry</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue or question in detail..."
                  rows={5} className={`${inp} resize-none`} />
              </div>
              <button type="submit" disabled={loading || !form.name || !form.email || !form.message}
                className="w-full py-4 rounded-full bg-[#1E88E5] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(30,136,229,0.3)]">
                {loading ? "Sending…" : "Send Message →"}
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
