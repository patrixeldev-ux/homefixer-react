"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingForm {
  serviceCategory: string;
  serviceType: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  problemDescription: string;
}

const serviceOptions: { [key: string]: string[] } = {
  Plumber: ["Leak Repair", "Pipe Installation", "Drain Cleaning", "Fixture Repair"],
  Electrician: ["Wiring Repair", "Outlet Issue", "Circuit Breaker", "Lighting"],
  Carpenter: ["Furniture Repair", "Door Work", "Cabinet Work", "Wood Polishing"],
};

export default function CustomerBookingPage() {
  const router = useRouter();

  const [form, setForm] = useState<BookingForm>({
    serviceCategory: "",
    serviceType: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    address: "",
    problemDescription: "",
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && !form.serviceCategory) {
      setError("Please select a service category");
      return;
    }
    if (step === 2 && !form.serviceType) {
      setError("Please select a service type");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handlePrev = () => setStep(step - 1);

  const handleSubmit = () => {
    if (
      !form.date ||
      !form.time ||
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.problemDescription
    ) {
      setError("Please fill all required fields");
      return;
    }

    // 🔹 API call can be added here later
    console.log("Booking Data:", form);

    setSubmitted(true);
  };

  /* ================= CONFIRMATION SCREEN ================= */
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full text-center p-8">
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Booking Confirmed 🎉
          </h2>

          <p className="text-gray-700 mb-6">
            Your <strong>{form.serviceType}</strong> service has been successfully
            booked for <strong>{form.date}</strong> at{" "}
            <strong>{form.time}</strong>.
          </p>

          <button
            onClick={() => router.push("/customer/dashboard")}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  /* ================= BOOKING FORM ================= */
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Book a Service
        </h1>

        {/* Step Indicator */}
        <div className="flex mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 mx-1 rounded-full ${
                step >= s ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(serviceOptions).map((cat) => (
              <button
                key={cat}
                onClick={() => setForm({ ...form, serviceCategory: cat })}
                className={`p-6 rounded-2xl border text-center font-semibold transition ${
                  form.serviceCategory === cat
                    ? "border-blue-600 bg-blue-50 shadow-lg"
                    : "border-gray-300 hover:shadow-md"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {serviceOptions[form.serviceCategory].map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, serviceType: type })}
                className={`p-4 rounded-xl border text-left transition ${
                  form.serviceType === type
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-300 hover:shadow-sm"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="p-3 border rounded-xl w-full"
              />
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="p-3 border rounded-xl w-full"
              />
            </div>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="p-3 border rounded-xl w-full"
            />

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="p-3 border rounded-xl w-full"
            />

            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Service Address"
              className="p-3 border rounded-xl w-full"
            />

            <textarea
              name="problemDescription"
              value={form.problemDescription}
              onChange={handleChange}
              placeholder="Describe your problem"
              rows={4}
              className="p-3 border rounded-xl w-full resize-none"
            />

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 border rounded-xl hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        )}

        {/* NEXT BUTTON */}
        {step < 3 && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
