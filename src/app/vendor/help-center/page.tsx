"use client";

import { useState } from "react";

type Step =
  | "start"
  | "orders"
  | "products"
  | "payment"
  | "tracking"
  | "approval"
  | "account"
  | "contact";

export default function VendorHelpCenter() {
  const [step, setStep] = useState<Step>("start");

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#F2F4F8] flex items-center justify-center px-4">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.12)] p-8 md:p-10 space-y-8">

        {/* Intro */}
        <div className="flex items-start gap-4">
          <Avatar />
          <Bubble>
            <h1 className="text-lg font-semibold text-gray-900">
              Hi! How can HomeFixer help your store?
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Select a topic to get quick assistance.
            </p>
          </Bubble>
        </div>

        {/* Start */}
        {step === "start" && (
          <div className="grid grid-cols-1 gap-3">
            <Option text="📦 Managing material orders"       onClick={() => setStep("orders")}   />
            <Option text="🔩 Adding & managing products"     onClick={() => setStep("products")} />
            <Option text="💰 Payments & revenue"             onClick={() => setStep("payment")}  />
            <Option text="📍 Serviceman tracking"            onClick={() => setStep("tracking")} />
            <Option text="✅ Store approval & profile"       onClick={() => setStep("approval")} />
            <Option text="👤 Account or login issues"        onClick={() => setStep("account")}  />
            <Option text="📞 Contact support"                onClick={() => setStep("contact")}  />
          </div>
        )}

        {step === "orders" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "How do I receive material orders?",    a: "Servicemen place orders for your products. You'll see them in the Orders page under the Active tab. Orders need customer approval before reaching you." },
            { q: "How do I accept or reject an order?",  a: "Go to Orders → Active tab. Orders with 'Customer approved' badge can be accepted or rejected. Tap Accept to confirm you have the stock." },
            { q: "What happens after I accept?",         a: "The order moves to 'Awaiting pickup'. The serviceman will come to your store to collect the materials. Once they pick up, the order moves to Completed." },
            { q: "Order shows REQUESTED but no buttons", a: "The customer hasn't approved the order yet. Buttons appear only after customer approval." },
            { q: "What is FULFILLED status?",            a: "FULFILLED means the serviceman has picked up the materials from your store. The order is complete." },
            { q: "Orders page shows error",              a: "This usually means your session expired. Log out and log back in. If the issue persists, contact support." },
          ]} />
        )}

        {step === "products" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "How do I add a new product?",          a: "Go to Products → tap '+ Add Product' → fill in name, price, stock quantity, and category → save." },
            { q: "How do I update stock quantity?",      a: "Go to Products → tap the Edit (✎) button on any product → update the stock quantity → save." },
            { q: "What categories are available?",       a: "Categories are set by HomeFixer admin (e.g. Plumbing, Electrical, AC). Select the most relevant one for each product." },
            { q: "Low stock alert on dashboard",         a: "Products with 5 or fewer units trigger a Low Stock Alert on your dashboard. Update stock to clear the alert." },
            { q: "Can I add product images?",            a: "Yes. When adding or editing a product, tap the image field to upload a photo (JPG/PNG, under 5MB)." },
          ]} />
        )}

        {step === "payment" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "When do I get paid for orders?",       a: "Payment is processed after the serviceman picks up materials and the booking is completed. Funds are credited within 1–2 business days." },
            { q: "How is revenue calculated?",           a: "Revenue shown on your dashboard is the total cost of all ACCEPTED orders. This is your gross revenue before any platform fees." },
            { q: "What are HomeFixer's fees?",           a: "HomeFixer charges a small platform fee on each fulfilled order. The exact percentage is shown in your vendor agreement." },
            { q: "I didn't receive payment",             a: "Verify your bank details in My Profile → Bank Details. If correct, contact support with the order ID." },
          ]} />
        )}

        {step === "tracking" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "How do I track a serviceman?",         a: "Go to Tracking → select an accepted order → tap 'Track Serviceman'. You'll see their live location on the map." },
            { q: "No servicemen showing in tracking",    a: "Only ACCEPTED orders appear in tracking. If an order is still REQUESTED, it won't show until you accept it." },
            { q: "Tracking shows 'unavailable'",         a: "The serviceman may not have started their journey yet, or their location sharing is off. Try again in a few minutes." },
            { q: "Tracking stopped after booking done",  a: "Tracking automatically closes when the booking is completed. This is expected behaviour." },
          ]} />
        )}

        {step === "approval" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "My store shows Pending Approval",      a: "New vendor accounts are reviewed by HomeFixer admin. Approval takes 24–48 hours after your profile is complete." },
            { q: "What's needed for approval?",          a: "Complete your business details, store location (lat/long), and bank details in My Profile. Incomplete profiles delay approval." },
            { q: "Why is store location important?",     a: "Servicemen find your store based on GPS coordinates. Without accurate lat/long, you won't appear in nearby vendor searches." },
            { q: "How do I find my store coordinates?",  a: "Go to maps.google.com → right-click your store location → tap 'What's here?' → copy the coordinates." },
          ]} />
        )}

        {step === "account" && (
          <Answer onBack={() => setStep("start")} items={[
            { q: "I forgot my password",                 a: "On the login page, enter your email and request an OTP. Verify with the OTP, then set a new password in Settings." },
            { q: "How do I change my password?",         a: "Go to Settings → Password → enter your current password and set a new one." },
            { q: "How do I update bank details?",        a: "Go to My Profile → Bank Details → update your account number, IFSC, and holder name → save." },
            { q: "Can I change my business name?",       a: "Yes. Go to My Profile → Business Details → update the Business Name field → save." },
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
                    <a href="mailto:support@homefixer.com" className="text-orange-600 hover:underline">support@homefixer.com</a>
                  </p>
                  <p>📞 <span className="font-medium">Phone:</span>{" "}
                    <a href="tel:+919876543210" className="text-orange-600 hover:underline">+91 98765 43210</a>
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
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
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
      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-left text-gray-900 font-medium hover:border-orange-400 hover:bg-orange-50 transition shadow-sm text-sm">
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
