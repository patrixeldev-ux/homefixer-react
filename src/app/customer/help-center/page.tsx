"use client";

import { useState } from "react";

type Step =
  | "start"
  | "booking"
  | "payment"
  | "technician"
  | "account"
  | "support"
  | "contact"; // 👈 NEW STEP

export default function HelpCenter() {
  const [step, setStep] = useState<Step>("start");

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#F2F4F8] flex items-center justify-center px-4">
      {/* Ambient background */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Help Container */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.12)] p-8 md:p-10 space-y-10">
        {/* Intro */}
        <div className="flex items-start gap-4">
          <Avatar />
          <Bubble>
            <h1 className="text-lg font-semibold text-gray-900">
              Hi! How can HomeFixer help you today?
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Select an option below to get quick assistance.
            </p>
          </Bubble>
        </div>

        {/* OPTIONS — ALL KEPT + ONE ADDED */}
        {step === "start" && (
          <div className="grid grid-cols-1 gap-4">
            <Option text="Problem with a booking" onClick={() => setStep("booking")} />
            <Option text="Payment or refund issue" onClick={() => setStep("payment")} />
            <Option text="Technician / service issue" onClick={() => setStep("technician")} />
            <Option text="Account or profile issue" onClick={() => setStep("account")} />
            <Option text="Contact support" onClick={() => setStep("support")} />

            {/* ✅ NEW OPTION */}
            <Option
              text="Email & Phone Support"
              onClick={() => setStep("contact")}
            />
          </div>
        )}

        {step === "booking" && (
          <Answer
            text="You can reschedule or cancel bookings from the My Bookings section before the service starts."
            onBack={() => setStep("start")}
          />
        )}

        {step === "payment" && (
          <Answer
            text="Payments are processed securely. Refunds (if applicable) are credited within 3–5 business days."
            onBack={() => setStep("start")}
          />
        )}

        {step === "technician" && (
          <Answer
            text="If a technician is delayed or unavailable, raise an issue and we’ll resolve it quickly."
            onBack={() => setStep("start")}
          />
        )}

        {step === "account" && (
          <Answer
            text="You can update your personal details from the Profile section. For login issues, contact support."
            onBack={() => setStep("start")}
          />
        )}

        {step === "support" && (
          <Answer
            text="Our support team is available 24/7 to assist you."
            onBack={() => setStep("start")}
          />
        )}

        {/* ✅ EMAIL + PHONE STEP */}
        {step === "contact" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar />
              <Bubble>
                <p className="text-gray-800 mb-3">
                  You can contact HomeFixer using the details below:
                </p>

                <div className="space-y-2 text-sm">
                  <p>
                    📧 <span className="font-medium">Email:</span>{" "}
                    <a
                      href="mailto:admin@homefixer.com"
                      className="text-blue-600 hover:underline"
                    >
                      admin@homefixer.com
                    </a>
                  </p>

                  <p>
                    📞 <span className="font-medium">Phone:</span>{" "}
                    <a
                      href="tel:+919876543210"
                      className="text-blue-600 hover:underline"
                    >
                      +91 98765 43210
                    </a>
                  </p>
                </div>
              </Bubble>
            </div>

            <div className="flex gap-4">
              <SecondaryButton text="Back" onClick={() => setStep("start")} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------- UI Components ---------- */

function Avatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-semibold shadow-md">
      HF
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F7F8FA] rounded-2xl px-5 py-4 shadow-sm max-w-[85%]">
      {children}
    </div>
  );
}

function Option({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-4 rounded-xl border border-gray-200 text-left text-gray-900 font-medium
      hover:border-gray-400 hover:bg-gray-50 transition shadow-sm"
    >
      {text}
    </button>
  );
}

function Answer({ text, onBack }: { text: string; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar />
        <Bubble>
          <p className="text-gray-800">{text}</p>
        </Bubble>
      </div>

      <div className="flex gap-4">
        <SecondaryButton text="Back" onClick={onBack} />
      </div>
    </div>
  );
}

function SecondaryButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-800 font-medium hover:bg-gray-100 transition"
    >
      {text}
    </button>
  );
}
