"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FiMapPin, FiStar, FiUser, FiCheck } from "react-icons/fi";

/* ── Types ── */
interface ServiceCategory {
  id: number;
  name: string;
}

/* Icon map for categories */
const categoryIcons: Record<string, string> = {
  Electrician: "⚡",
  Plumber: "🔧",
  Carpenter: "🪚",
  Painter: "🎨",
  Cleaner: "🧹",
  AC: "❄️",
  Pest: "🐛",
  default: "🏠",
};

/* ── Step Indicator ── */
function StepIndicator({ current }: { current: number }) {
  const steps = ["Category", "Professional", "Details"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = current > step;
        const active = current === step;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400"}`}
              >
                {done ? <FiCheck size={16} /> : step}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${active ? "text-blue-600" : done ? "text-green-500" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 mb-5 mx-1 transition-all ${current > step ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Main Page ── */
export default function CustomerBookingPage() {
  const router = useRouter();

  const [categories,       setCategories]       = useState<ServiceCategory[]>([]);
  const [workers,          setWorkers]          = useState<any[]>([]);
  const [selectedWorker,   setSelectedWorker]   = useState<any>(null);
  const [loadingCats,      setLoadingCats]      = useState(true);
  const [loadingWorkers,   setLoadingWorkers]   = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [walletBalance,    setWalletBalance]    = useState<number | null>(null);

  const [form, setForm] = useState({
    category: "",
    category_id: 0,
    scheduled_date: "",
    scheduled_time: "",
    name: "",
    phone: "",
    address: "",
    problem_title: "",
    problem_description: "",
    payment: "",
  });

  const [step,  setStep]  = useState(1);
  const [error, setError] = useState("");

  /* Fetch categories */
  useEffect(() => {
    api.get("/api/categories/")
      .then(res => setCategories(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoadingCats(false));
  }, []);

  /* Fetch wallet balance once so we can show it on the payment tile */
  useEffect(() => {
    api.get("/wallet/")
      .then(res => {
        const data = res.data;
        const raw = data.wallet ?? data;
        setWalletBalance(parseFloat(String(raw.balance ?? 0)));
      })
      .catch(() => setWalletBalance(0));
  }, []);

  /* Fetch nearby workers when entering step 2 */
  useEffect(() => {
    if (step === 2 && form.category_id) {
      setLoadingWorkers(true);
      setWorkers([]);
      setSelectedWorker(null);

      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;

          const roundedLat = parseFloat(latitude.toFixed(4));
          const roundedLon = parseFloat(longitude.toFixed(4));
          const locForm = new FormData();
          locForm.append("default_lat", String(roundedLat));
          locForm.append("default_long", String(roundedLon));
          api.put("/api/profile/customer/update/", locForm, {
            headers: { "Content-Type": "multipart/form-data" },
          }).catch(e => console.log("Location update failed:", e.response?.data || e));

          api.get("/api/servicemen/nearby/", {
            params: { category: form.category, lat: latitude, lon: longitude },
          })
            .then(res => setWorkers(res.data))
            .catch(err => {
              console.log("Nearby API error:", err.response?.data);
              setError("Failed to load professionals. Please try again.");
            })
            .finally(() => setLoadingWorkers(false));
        },
        () => {
          setLoadingWorkers(false);
          setError("Location access denied. Please enable location to find nearby professionals.");
        }
      );
    }
  }, [step, form.category_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const goNext = () => {
    setError("");
    if (step === 1 && !form.category_id) { setError("Please select a service category."); return; }
    if (step === 2 && !selectedWorker) { setError("Please select a professional to continue."); return; }
    setStep(s => s + 1);
  };

  const convertTo12hr = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const handleSubmit = async () => {
    if (!form.scheduled_date || !form.scheduled_time || !form.name || !form.phone || !form.address || !form.problem_title || !form.payment) {
      setError("Please fill in all required fields.");
      return;
    }

    // Wallet-specific check before even creating the booking
    if (form.payment === "Wallet" && (walletBalance === null || walletBalance <= 0)) {
      setError("Your wallet balance is ₹0. Please choose a different payment method or top up via a refund.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      /* ── Step 1: Create booking ── */
      const formData = new FormData();
      formData.append("category",            form.category);
      formData.append("category_id",         String(form.category_id));
      formData.append("scheduled_date",      form.scheduled_date);
      formData.append("scheduled_time",      convertTo12hr(form.scheduled_time));
      formData.append("name",                form.name);
      formData.append("phone",               form.phone);
      formData.append("address",             form.address);
      formData.append("problem_title",       form.problem_title);
      formData.append("problem_description", form.problem_description);
      formData.append("payment_method",      form.payment);
      formData.append("serviceman",          String(selectedWorker.id));

      const bookingRes = await api.post("/api/booking/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const bookingId = bookingRes.data.id;

      /* ── Step 2a: Wallet payment path ── */
      if (form.payment === "Wallet") {
        try {
          await api.post(`/wallet/booking/${bookingId}/pay/`);
          router.push(
            `/customer/my-bookings?booked=1&service=${encodeURIComponent(form.category)}&pro=${encodeURIComponent(selectedWorker?.name ?? "")}`
          );
        } catch (walletErr: any) {
          const msg =
            walletErr?.response?.data?.detail ||
            walletErr?.response?.data?.message ||
            "Wallet payment failed. Your booking was created — please pay from My Bookings.";
          setError(msg);
        }
        return;
      }

      /* ── Step 2b: Razorpay path (UPI / Cash / Card) ── */
      const intentRes = await api.post(
        `/api/booking/${bookingId}/payment/create-intent/`,
        { stage: "advance", gateway: "razorpay" }
      );
      const { order_id, amount, key } = intentRes.data;

      await new Promise<void>((resolve, reject) => {
        const options = {
          key, amount, currency: "INR",
          name: "HomeFixer",
          description: `Visiting charge for booking #${bookingId}`,
          order_id,
          handler: async (response: any) => {
            try {
              await api.post(`/api/booking/${bookingId}/payment/razorpay/verify/`, {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });
              resolve();
            } catch { reject(new Error("Payment verification failed")); }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
          prefill: { name: form.name, contact: form.phone },
          theme: { color: "#2563eb" },
        };

        const launch = () => {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        };
        if ((window as any).Razorpay) { launch(); }
        else {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = launch;
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.body.appendChild(script);
        }
      });

      router.push(
        `/customer/my-bookings?booked=1&service=${encodeURIComponent(form.category)}&pro=${encodeURIComponent(selectedWorker?.name ?? "")}`
      );

    } catch (err: any) {
      const msg = err.message || err.response?.data?.detail || JSON.stringify(err.response?.data) || "Booking failed.";
      setError(msg === "Payment cancelled" ? "Payment was cancelled. Your booking was not confirmed." : msg);
      console.log("Booking/payment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Build payment methods array with live wallet balance ── */
  const paymentMethods = [
    { id: "UPI",              label: "UPI",   icon: "📲", sub: null },
    { id: "Cash on Delivery", label: "Cash",  icon: "💵", sub: null },
    { id: "Card",             label: "Card",  icon: "💳", sub: null },
    {
      id: "Wallet",
      label: "Wallet",
      icon: "💰",
      sub: walletBalance !== null
        ? walletBalance > 0
          ? `₹${walletBalance.toFixed(2)} available`
          : "₹0.00 — no balance"
        : "Checking...",
      disabled: walletBalance !== null && walletBalance <= 0,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 text-black">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Book a Service</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 && "What service do you need?"}
            {step === 2 && `Finding professionals near you for ${form.category}`}
            {step === 3 && "Almost there! Fill in the details"}
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* ─── STEP 1: Category ─── */}
          {step === 1 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-4">Select a category</h2>
              {loadingCats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map(cat => {
                    const icon = Object.keys(categoryIcons).find(k =>
                      cat.name.toLowerCase().includes(k.toLowerCase())
                    ) || "default";
                    const selected = form.category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setForm({ ...form, category: cat.name, category_id: cat.id }); setError(""); }}
                        className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all text-center
                          ${selected ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/50"}`}
                      >
                        {selected && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <FiCheck size={11} className="text-white" />
                          </span>
                        )}
                        <span className="text-3xl">{categoryIcons[icon]}</span>
                        <span className={`text-sm font-semibold ${selected ? "text-blue-700" : "text-gray-700"}`}>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: Select Professional ─── */}
          {step === 2 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-4">Available professionals</h2>
              {loadingWorkers ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : workers.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl">🔍</span>
                  <p className="text-gray-500 mt-3">No professionals found nearby.</p>
                  <p className="text-gray-400 text-sm">Try a different category or check your location settings.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workers.map(w => {
                    const selected = selectedWorker?.id === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => { setSelectedWorker(w); setError(""); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                          ${selected ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-blue-200"}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {w.name?.[0] || <FiUser />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold ${selected ? "text-blue-700" : "text-gray-900"}`}>{w.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FiMapPin size={11} /> {w.distance?.toFixed(1) ?? "—"} km away
                            </span>
                            {w.rating && (
                              <span className="flex items-center gap-1 text-xs text-yellow-600">
                                <FiStar size={11} /> {w.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        {selected && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <FiCheck size={13} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: Details ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700 mb-2">Booking details</h2>

              {/* Summary pill */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 text-sm">
                <span className="text-xl">
                  {categoryIcons[Object.keys(categoryIcons).find(k =>
                    form.category.toLowerCase().includes(k.toLowerCase())
                  ) || "default"]}
                </span>
                <div>
                  <p className="font-semibold text-blue-800">{form.category}</p>
                  <p className="text-blue-600 text-xs">with {selectedWorker?.name}</p>
                </div>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Date *</label>
                  <input name="scheduled_date" type="date" value={form.scheduled_date} onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Time *</label>
                  <input name="scheduled_time" type="time" value={form.scheduled_time} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                  <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone *</label>
                  <input name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Service Address *</label>
                <input name="address" placeholder="123 Main Street, City" value={form.address} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Problem */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Problem Title *</label>
                <input name="problem_title" placeholder="E.g. Tap leaking, Fan not working" value={form.problem_title} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Describe the problem</label>
                <textarea name="problem_description" placeholder="E.g. The kitchen tap has been leaking since yesterday..." value={form.problem_description} onChange={handleChange}
                  rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              {/* ── Payment Method ── */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Payment Method *
                </label>

                {/* Top row: UPI, Cash, Card */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {paymentMethods.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setForm({ ...form, payment: p.id }); setError(""); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium
                        ${form.payment === p.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30"
                        }`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Wallet — full-width row so balance text fits */}
                {(() => {
                  const w = paymentMethods[3];
                  const isSelected = form.payment === w.id;
                  const isDisabled = !!w.disabled;
                  return (
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => { if (!isDisabled) { setForm({ ...form, payment: w.id }); setError(""); } }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left
                        ${isSelected
                          ? "border-blue-600 bg-blue-50"
                          : isDisabled
                          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                          : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                        }`}
                    >
                      <span className="text-xl flex-shrink-0">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                          Wallet
                        </p>
                        {w.sub && (
                          <p className={`text-xs font-medium mt-0.5 ${
                            walletBalance !== null && walletBalance > 0
                              ? "text-green-600"
                              : "text-red-500"
                          }`}>
                            {w.sub}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <FiCheck size={11} className="text-white" />
                        </div>
                      )}
                      {isDisabled && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          Insufficient
                        </span>
                      )}
                    </button>
                  );
                })()}

                <p className="text-xs text-gray-400 mt-2">
                  {form.payment === "Wallet"
                    ? "Your wallet balance will be deducted instantly. No card required."
                    : "Payment is processed securely via Razorpay after confirming."}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => { setStep(s => s - 1); setError(""); }}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={goNext} disabled={step === 1 && !form.category_id}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition flex items-center gap-2">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming...</>
                ) : (
                  <>✅ Confirm Booking</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}