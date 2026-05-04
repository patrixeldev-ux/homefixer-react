"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

type Role = "CUSTOMER" | "SERVICEMAN" | "VENDOR" | null;
type Step = 0 | 1 | 2 | 3 | 4;

const ratingLabels: Record<number, { text: string; color: string }> = {
  1: { text: "Poor",      color: "text-red-500" },
  2: { text: "Fair",      color: "text-orange-500" },
  3: { text: "Good",      color: "text-yellow-500" },
  4: { text: "Very Good", color: "text-blue-500" },
  5: { text: "Excellent", color: "text-green-600" },
};

const commonQuestions = [
  {
    id: "overall_experience",
    label: "Overall, how was your experience with HomeFixer?",
    type: "textarea",
    placeholder: "Tell us what went well or what could be better...",
  },
  {
    id: "biggest_pain",
    label: "What is your biggest pain point or frustration using the platform?",
    type: "textarea",
    placeholder: "Be honest — this helps us improve the most...",
  },
  {
    id: "improvement",
    label: "What one thing would most improve your experience?",
    type: "text",
    placeholder: "e.g. Faster response, better pricing clarity...",
  },
];

const customerQuestions = [
  {
    id: "find_serviceman",
    label: "How did you find your serviceman for the last job?",
    type: "radio",
    options: ["Through HomeFixer app", "Word of mouth / referral", "JustDial / Google", "Contractor / building staff", "Other"],
  },
  {
    id: "price_upfront",
    label: "Did you know the price before the serviceman arrived?",
    type: "radio",
    options: ["Yes, clearly", "Roughly / estimate only", "No, I was told after", "I was surprised by the final price"],
  },
  {
    id: "wait_time",
    label: "How long did you wait for the serviceman to arrive?",
    type: "radio",
    options: ["Less than 1 hour", "1–2 hours", "Half day (3–5 hours)", "More than 5 hours", "They didn't show up"],
  },
  {
    id: "one_visit",
    label: "Was the job completed in a single visit?",
    type: "radio",
    options: ["Yes, done in one visit", "No, needed to come back once", "No, multiple visits required"],
  },
  {
    id: "overcharged",
    label: "Did you feel overcharged or unsure about the pricing?",
    type: "radio",
    options: ["No, pricing was fair and clear", "Slightly, but acceptable", "Yes, I felt overcharged", "I wasn't sure what I was paying for"],
  },
  {
    id: "app_again",
    label: "Would you book via HomeFixer again if it guaranteed arrival time?",
    type: "radio",
    options: ["Yes, definitely", "Probably yes", "Maybe", "Probably not"],
  },
  {
    id: "customer_notes",
    label: "Any other feedback for us?",
    type: "textarea",
    placeholder: "Anything else you'd like us to know...",
  },
];

const servicemanQuestions = [
  {
    id: "service_type",
    label: "What is your primary service type?",
    type: "radio",
    options: ["Plumbing", "Electrical", "AC Repair / Installation", "Carpentry", "Painting", "Multiple services", "Other"],
  },
  {
    id: "jobs_per_week",
    label: "How many jobs do you get per week on average?",
    type: "radio",
    options: ["0–2 jobs", "3–5 jobs", "6–10 jobs", "More than 10 jobs"],
  },
  {
    id: "how_customers",
    label: "How do you currently get customers?",
    type: "radio",
    options: ["HomeFixer app", "WhatsApp / referrals", "JustDial / online listing", "Contractor / building staff", "Word of mouth only"],
  },
  {
    id: "material_time",
    label: "How long does material sourcing take per job on average?",
    type: "radio",
    options: ["Less than 30 mins", "30 mins – 1 hour", "1–2 hours", "More than 2 hours (major delay)"],
  },
  {
    id: "lost_job_parts",
    label: "Have you ever lost a job because you couldn't get a part in time?",
    type: "radio",
    options: ["Yes, this happens often", "Yes, occasionally", "Rarely", "Never"],
  },
  {
    id: "pay_monthly",
    label: "If HomeFixer gave you 5 confirmed jobs/week, would you pay ₹199/month?",
    type: "radio",
    options: ["Yes, definitely", "Maybe if I see consistent work", "No, I wouldn't pay", "I need more information first"],
  },
  {
    id: "sm_notes",
    label: "What would make you use HomeFixer every day for your work?",
    type: "textarea",
    placeholder: "Be specific — what features or guarantees matter most to you?",
  },
];

const vendorQuestions = [
  {
    id: "product_category",
    label: "What products/materials do you primarily sell?",
    type: "radio",
    options: ["Plumbing & pipes", "Electrical parts & wiring", "AC parts & refrigeration", "Carpentry & hardware tools", "Multiple categories", "Other"],
  },
  {
    id: "sm_sales_percent",
    label: "What percentage of your sales comes from servicemen vs. retail customers?",
    type: "radio",
    options: ["Less than 25% from servicemen", "25–50% from servicemen", "50–75% from servicemen", "More than 75% from servicemen"],
  },
  {
    id: "order_method",
    label: "How do servicemen currently order from you?",
    type: "radio",
    options: ["Walk-in only", "Phone calls", "WhatsApp messages", "Mix of all methods"],
  },
  {
    id: "stock_problems",
    label: "Do you face issues with stock — overstocking or running out?",
    type: "radio",
    options: ["Yes, I often overstock slow items", "Yes, I often run out of fast-moving items", "Both problems happen", "No major stock issues"],
  },
  {
    id: "lost_sale_vendor",
    label: "Have you ever lost a sale because a serviceman went to another vendor?",
    type: "radio",
    options: ["Yes, frequently", "Yes, sometimes", "Rarely", "Never"],
  },
  {
    id: "digital_orders",
    label: "If HomeFixer sent you structured digital orders from servicemen in your area, would you use it?",
    type: "radio",
    options: ["Yes, immediately", "Yes, after seeing a demo", "Maybe, depends on the price", "No, I prefer current methods"],
  },
  {
    id: "pay_vendor",
    label: "Would you pay ₹300–500/month for an inventory management + order system?",
    type: "radio",
    options: ["Yes, ₹300/month sounds right", "Yes if it genuinely saves time", "Maybe at a lower price", "No, I wouldn't pay for software"],
  },
  {
    id: "vendor_notes",
    label: "What would make HomeFixer most useful for your business?",
    type: "textarea",
    placeholder: "Tell us what features or guarantees matter most to you...",
  },
];

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2 mt-2">
      {options.map(opt => (
        <label
          key={opt}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
            value === opt
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          <input type="radio" className="hidden" checked={value === opt} onChange={() => onChange(opt)} />
          <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            value === opt ? "border-white" : "border-gray-400"
          }`}>
            {value === opt && <span className="w-2 h-2 rounded-full bg-white" />}
          </span>
          {opt}
        </label>
      ))}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 0, label: "You" },
    { num: 1, label: "Your Role" },
    { num: 2, label: "General" },
    { num: 3, label: "Specific" },
    { num: 4, label: "Done" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
              step > s.num
                ? "bg-green-500 text-white"
                : step === s.num
                ? "bg-blue-600 text-white shadow-lg scale-110"
                : "bg-gray-200 text-gray-500"
            }`}>
              {step > s.num ? "✓" : s.num}
            </div>
            <span className={`text-xs mt-1 font-semibold ${
              step === s.num ? "text-white" : step > s.num ? "text-green-200" : "text-blue-200"
            }`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 h-0.5 mb-5 mx-1 transition-all ${
              step > s.num ? "bg-green-400" : "bg-white/30"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const router = useRouter();

  const [step, setStep]               = useState<Step>(0);
  const [role, setRole]               = useState<Role>(null);
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [recommend, setRecommend]     = useState("");
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);

  // Contact info — collected before role selection
  const [contactName,  setContactName]  = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactError, setContactError] = useState("");

  const setAnswer = (id: string, value: string) =>
    setAnswers(prev => ({ ...prev, [id]: value }));

  const roleQuestions =
    role === "CUSTOMER"   ? customerQuestions  :
    role === "SERVICEMAN" ? servicemanQuestions :
    role === "VENDOR"     ? vendorQuestions     : [];

  const activeRating = hoverRating || rating;

  const canProceed = () => {
    if (step === 0) return contactName.trim().length > 0 && contactEmail.includes("@");
    if (step === 1) return role !== null;
    if (step === 2) return rating > 0 && !!answers["overall_experience"] && !!answers["biggest_pain"];
    return true;
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!contactName.trim()) { setContactError("Name is required."); return; }
      if (!contactEmail.includes("@")) { setContactError("Valid email is required."); return; }
      setContactError("");
      setStep(1);
    } else if (step === 3) {
      // Submit to backend
      setLoading(true);
      try {
        const recommendMap: Record<string, string> = {
          "Yes, definitely!": "YES",
          "Maybe":            "MAYBE",
          "Not really":       "NO",
        };

        const payload = {
          role,
          name:                   contactName,
          email:                  contactEmail,
          phone_number:           contactPhone || undefined,
          overall_rating:         rating,
          overall_experience:     answers["overall_experience"] || "",
          biggest_pain:           answers["biggest_pain"]       || "",
          improvement_suggestion: answers["improvement"]        || "",
          would_recommend:        recommendMap[recommend]       || "",
          // All role-specific answers (exclude the common ones)
          role_answers: Object.fromEntries(
            Object.entries(answers).filter(
              ([k]) => !["overall_experience", "biggest_pain", "improvement"].includes(k)
            )
          ),
        };

        await api.post("/api/feedback/", payload);

        setStep(4);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string; message?: string } }; message?: string };
        const msg = e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Failed to submit. Please try again.";
        alert(msg);
      } finally {
        setLoading(false);
      }
    } else {
      setStep((step + 1) as Step);
    }
  };

  const roleConfig = {
    CUSTOMER:   { label: "Customer",   emoji: "🏠", color: "bg-blue-600",  border: "border-blue-600" },
    SERVICEMAN: { label: "Serviceman", emoji: "🔧", color: "bg-green-600", border: "border-green-600" },
    VENDOR:     { label: "Vendor",     emoji: "🏪", color: "bg-amber-500", border: "border-amber-500" },
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden px-6 py-24 text-center"
        style={{
          background: "linear-gradient(135deg, #0b1e4a 0%, #0d3b8e 25%, #1565c0 45%, #1e88e5 65%, #42a5f5 80%, #7c3aed 100%)",
        }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />

        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto max-w-2xl rounded-[36px] border border-white/20 bg-white/10 px-10 py-12 shadow-[0_30px_90px_rgba(15,23,42,0.4)] backdrop-blur-xl">
            <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              Your Voice Matters
            </p>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              Share Your Feedback
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-blue-100">
              Help us improve HomeFixer. Your honest feedback shapes the future of our platform.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-blue-50 py-28 px-6">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5] mb-4">Why It Matters</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl mb-6">
              We Actually Listen
            </h2>
            <p className="text-lg leading-8 text-slate-600 mb-4">
              Every piece of feedback is reviewed by our product team. We don't let your input disappear into a void — it directly influences our next update, feature, or policy change.
            </p>
            <p className="text-lg leading-8 text-slate-600">
              From improving serviceman matching to fixing payment flows, your experience guides every decision we make at HomeFixer.
            </p>
          </div>
          <div className="rounded-[30px] border border-slate-200 bg-white p-10 shadow-[0_22px_50px_rgba(15,23,42,0.08)] text-center">
            <div className="text-6xl mb-5">💬</div>
            <p className="text-4xl font-bold text-[#1E88E5] mb-1">5,000+</p>
            <p className="text-slate-500 text-sm mb-8">Reviews Collected</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-[#1E88E5]">4.8★</p>
                <p className="text-xs text-slate-500 mt-1">Avg Rating</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-[#1E88E5]">92%</p>
                <p className="text-xs text-slate-500 mt-1">Would Recommend</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="bg-[#F8FAFC] py-28 pt-32 px-6">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5] mb-4">Leave a Review</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Submit Your Feedback</h2>
          </div>

          <StepIndicator step={step} />

          {/* ── STEP 0: CONTACT INFO ── */}
          {step === 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-10">
              <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Tell us about yourself</h2>
              <p className="text-gray-500 text-sm text-center mb-8">
                Your details help us follow up if needed. Email is required.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={contactName}
                    onChange={e => { setContactName(e.target.value); setContactError(""); }}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => { setContactEmail(e.target.value); setContactError(""); }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {contactError && (
                <p className="mt-3 text-red-500 text-sm">{contactError}</p>
              )}

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black rounded-2xl transition-colors text-base shadow-lg"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 1: ROLE SELECTION ── */}
          {step === 1 && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Who are you?</h2>
              <p className="text-gray-500 text-sm text-center mb-8">
                Select your role so we can ask you the most relevant questions.
              </p>

              <div className="space-y-4">
                {(["CUSTOMER", "SERVICEMAN", "VENDOR"] as const).map(r => {
                  const cfg = roleConfig[r];
                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all text-left ${
                        role === r
                          ? `${cfg.border} ${cfg.color} text-white shadow-lg scale-[1.02]`
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <span className="text-3xl">{cfg.emoji}</span>
                      <p className={`text-base font-bold ${role === r ? "text-white" : "text-gray-900"}`}>
                        {cfg.label}
                      </p>
                      {role === r && <span className="ml-auto text-xl">✓</span>}
                    </button>                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-2xl transition-colors text-sm shadow-md"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: COMMON QUESTIONS ── */}
          {step === 2 && role && (
            <div className="space-y-5">

              <div className="flex items-center justify-between mb-2">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white ${roleConfig[role].color}`}>
                  <span>{roleConfig[role].emoji}</span>
                  <span>{roleConfig[role].label}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 text-base mb-1">Overall Rating *</h3>
                <p className="text-gray-500 text-xs mb-4">How would you rate your overall HomeFixer experience?</p>
                <div className="flex gap-3 justify-center mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-5xl transition-all duration-100 hover:scale-110 ${
                        star <= activeRating ? "text-yellow-400" : "text-gray-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {activeRating > 0 && (
                  <p className={`text-center text-sm font-bold ${ratingLabels[activeRating].color}`}>
                    {ratingLabels[activeRating].text}
                  </p>
                )}
              </div>

              {/* Common questions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h3 className="font-bold text-gray-900 text-base">General Questions</h3>
                {commonQuestions.map(q => (
                  <div key={q.id}>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      {q.label}
                      {(q.id === "overall_experience" || q.id === "biggest_pain") && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {q.type === "textarea" ? (
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={e => setAnswer(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      />
                    ) : (
                      <input
                        value={answers[q.id] || ""}
                        onChange={e => setAnswer(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Recommend */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Would you recommend HomeFixer to a friend?
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {["Yes, definitely!", "Maybe", "Not really"].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRecommend(opt)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        recommend === opt
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white font-bold rounded-2xl transition-colors text-sm shadow-md"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: ROLE-SPECIFIC QUESTIONS ── */}
          {step === 3 && role && (
            <div className="space-y-5">

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white ${roleConfig[role].color}`}>
                <span>{roleConfig[role].emoji}</span>
                <span>
                  {role === "CUSTOMER"   && "Customer Questions"}
                  {role === "SERVICEMAN" && "Serviceman Questions"}
                  {role === "VENDOR"     && "Vendor Questions"}
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-7">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {role === "CUSTOMER"   && "Your Experience as a Customer"}
                    {role === "SERVICEMAN" && "Your Experience as a Serviceman"}
                    {role === "VENDOR"     && "Your Experience as a Vendor"}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">All questions are optional but your answers help us the most.</p>
                </div>

                {roleQuestions.map((q, idx) => (
                  <div key={q.id}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <span className="text-blue-500 mr-2 font-black">{idx + 1}.</span>
                      {q.label}
                    </label>

                    {q.type === "radio" && q.options && (
                      <RadioGroup
                        options={q.options}
                        value={answers[q.id] || ""}
                        onChange={v => setAnswer(q.id, v)}
                      />
                    )}

                    {q.type === "textarea" && (
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={e => setAnswer(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-bold rounded-2xl transition-colors text-sm shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : "Submit Feedback →"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: THANK YOU ── */}
          {step === 4 && role && (
            <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-5">🙏</div>
              <h3 className="text-2xl font-black text-blue-900 mb-3">Thank You{contactName ? `, ${contactName.split(" ")[0]}` : ""}!</h3>
              <p className="text-gray-600 mb-2">
                Your feedback as a <strong>{roleConfig[role].label}</strong> has been received.
              </p>
              <p className="text-gray-400 text-sm mb-1">
                ⭐ Rating: {rating}/5 — {ratingLabels[rating]?.text}
              </p>
              {recommend && (
                <p className="text-gray-400 text-sm mb-1">
                  Would recommend: <strong>{recommend}</strong>
                </p>
              )}
              {contactEmail && (
                <p className="text-gray-400 text-sm mb-6">
                  Confirmation sent to: <strong>{contactEmail}</strong>
                </p>
              )}
              <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
                We review every submission carefully. Your input directly shapes how HomeFixer evolves for everyone.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => {
                    setStep(0);
                    setRole(null);
                    setRating(0);
                    setRecommend("");
                    setAnswers({});
                    setContactName("");
                    setContactEmail("");
                    setContactPhone("");
                    setContactError("");
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm transition-colors"
                >
                  Submit Another
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-2.5 border border-blue-200 text-blue-700 font-bold rounded-xl hover:bg-blue-50 text-sm transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {step !== 4 && (
        <section className="relative py-20 px-6 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0b1e4a 0%, #0d3b8e 25%, #1565c0 50%, #7c3aed 100%)",
          }}
        >
          <div className="absolute top-0 right-1/3 w-72 h-72 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }} />

          <div className="relative mx-auto w-fit">
            <div className="rounded-[36px] border border-white/20 bg-white/10 px-12 py-12 shadow-[0_30px_90px_rgba(15,23,42,0.4)] backdrop-blur-xl max-w-xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Have an urgent issue?</h2>
            <p className="text-blue-200 mb-8">For immediate support or complaints, reach our team directly.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={() => router.push("/contact")}
                className="rounded-full border border-white/70 bg-white/10 px-8 py-3.5 text-sm font-semibold text-yellow-200 transition-all hover:scale-105 hover:bg-white hover:text-[#1E88E5]">
                Contact Support
              </button>
              <button onClick={() => router.push("/")}
                className="rounded-full border border-white/70 bg-white/10 px-8 py-3.5 text-sm font-semibold text-yellow-200 transition-all hover:scale-105 hover:bg-white hover:text-[#1E88E5]">
                Back to Home
              </button>
            </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}