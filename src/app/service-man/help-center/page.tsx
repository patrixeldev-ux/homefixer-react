"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step =
  | "start"
  | "bookings"
  | "payment"
  | "materials"
  | "tracking"
  | "account"
  | "approval"
  | "contact";

export default function ServicemanHelpCenter() {
  const [step, setStep] = useState<Step>("start");
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#F2F4F8] flex items-center justify-center px-4">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.12)] p-8 md:p-10 space-y-8">

        {/* Intro */}
        <div className="flex items-start gap-4">
          <Avatar />
          <Bubble>
            <h1 className="text-lg font-semibold text-gray-900">
              Hi Serviceman! How can HomeFixer help you?
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Select a topic to get quick assistance.
            </p>
          </Bubble>
        </div>

        {/* Start */}
        {step === "start" && (
          <div className="grid grid-cols-1 gap-3">
            <Option text="📋 Booking requests & management"  onClick={() => setStep("bookings")}  />
            <Option text="💰 Payments & earnings"            onClick={() => setStep("payment")}   />
            <Option text="🔩 Ordering materials from vendors" onClick={() => setStep("materials")} />
            <Option text="📍 Live tracking issues"           onClick={() => setStep("tracking")}  />
            <Option text="✅ Account approval & profile"     onClick={() => setStep("approval")}  />
            <Option text="👤 Account or login issues"        onClick={() => setStep("account")}   />
            <Option text="📞 Contact support"                onClick={() => setStep("contact")}   />
          </div>
        )}

        {step === "bookings" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "How do I accept a booking?",         a: "Go to User Requests in the sidebar. You'll see pending bookings — tap Accept to confirm or Reject to decline." },
            { q: "Can I cancel an accepted booking?",  a: "Contact support to cancel an accepted booking. Frequent cancellations may affect your rating." },
            { q: "How do I mark a service as done?",   a: "Open the booking from My Bookings, scroll to the bottom, and tap 'Mark Service as Done'. The customer will then be prompted to make the final payment." },
            { q: "Why is my booking still ONGOING?",   a: "The booking stays ONGOING until the customer completes the final payment after you mark it done." },
          ]} />
        )}

        {step === "payment" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "When do I get paid?",                a: "You receive your service charge after the customer completes the final payment. Payments are processed within 1–2 business days." },
            { q: "What is the platform fee?",          a: "HomeFixer charges a 10% platform fee on your service charge. This is deducted before your payout." },
            { q: "How do I set my visiting charge?",   a: "Go to My Profile and update your Visiting Charge. This is the base amount customers pay for your visit." },
            { q: "I didn't receive my payment",        a: "Check your bank details in My Profile. If correct, contact support with your booking ID." },
          ]} />
        )}

        {step === "materials" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "How do I order materials?",          a: "Open an active booking → tap 'Order Materials from Vendor' → select a category → choose a nearby vendor → add products to cart → send the order." },
            { q: "The customer needs to approve?",     a: "Yes. After you send the order, the customer must approve it before the vendor receives it. This protects both parties." },
            { q: "No vendors found nearby",            a: "Make sure your location is updated. Vendors within 10 km with the selected category in stock will appear." },
            { q: "Can I order from multiple vendors?", a: "Currently one vendor per booking order. You can place a new order if you need items from a different vendor." },
          ]} />
        )}

        {step === "tracking" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "Live tracking map not loading",      a: "Allow location permissions in your browser. The map requires GPS access to show your position." },
            { q: "My location isn't updating",         a: "Check that location permissions are granted and you have a stable internet connection. The map updates every 4 seconds." },
            { q: "How do I navigate to the vendor?",  a: "In the tracking map, tap the 'Vendor' toggle at the top to switch the route to the vendor's location." },
            { q: "Tracking shows wrong location",      a: "Reload the page. If the issue persists, check your device GPS settings." },
          ]} />
        )}

        {step === "approval" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "My account shows Pending Approval",  a: "New serviceman accounts are reviewed by the HomeFixer admin team. Approval typically takes 24–48 hours after profile completion." },
            { q: "What do I need for approval?",       a: "Complete your profile with your skills, visiting charge, and a profile photo. Incomplete profiles take longer to approve." },
            { q: "I was approved but can't get jobs",  a: "Make sure your status is set to Online on the dashboard. Customers can only book servicemen who are online." },
            { q: "How do I update my skills?",         a: "Go to My Profile → Professional Details → update the Skills field with comma-separated services (e.g. Plumbing, Electrical)." },
          ]} />
        )}

        {step === "account" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "I forgot my password",               a: "On the login page, enter your email and request an OTP. Use the OTP to verify, then set a new password in Settings." },
            { q: "How do I change my password?",       a: "Go to Settings → Password → enter your current password and set a new one." },
            { q: "My profile photo isn't uploading",   a: "Use a JPG or PNG under 5MB. If the issue persists, try a different browser." },
            { q: "How do I update my phone number?",   a: "Phone number changes require identity verification. Contact support with your registered email." },
          ]} />
        )}

        {step === "contact" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar />
              <Bubble>
                <p className="text-gray-800 mb-3 font-medium">Reach our support team:</p>
                <div className="space-y-2 text-sm">
                  <p>📧 <span className="font-medium">Email:</span>{" "}
                    <a href="mailto:support@homefixer.com" className="text-green-600 hover:underline">support@homefixer.com</a>
                  </p>
                  <p>📞 <span className="font-medium">Phone:</span>{" "}
                    <a href="tel:+919876543210" className="text-green-600 hover:underline">+91 98765 43210</a>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">Available Mon–Sat, 9 AM – 7 PM IST</p>
                </div>
              </Bubble>
            </div>
            <BackButton onClick={() => setStep("start")} />
          </div>
        )}

      </div>
    </main>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Avatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
      HF
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F7F8FA] rounded-2xl px-5 py-4 shadow-sm flex-1">
      {children}
    </div>
  );
}

function Option({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-left text-gray-900 font-medium hover:border-green-400 hover:bg-green-50 transition shadow-sm text-sm">
      {text}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">
      ← Back to topics
    </button>
  );
}

function Answer({ items, onBack }: {
  items: { q: string; a: string }[];
  onBack: () => void;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar />
        <Bubble>
          <p className="text-gray-700 text-sm">Here are answers to common questions on this topic:</p>
        </Bubble>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition">
              <span>{item.q}</span>
              <span className="text-gray-400 ml-3 flex-shrink-0">{open === i ? "▲" : "▼"}</span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 pt-1 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <BackButton onClick={onBack} />
    </div>
  );
}
