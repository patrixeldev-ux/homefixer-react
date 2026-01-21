"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api"; // your axios instance

interface Service {
  id: number;
  name: string;
}

interface ServiceCategory {
  id: number;
  name: string;
  services: Service[];
}

const paymentMethods = ["UPI", "Debit Card", "Cash on Delivery"];

export default function CustomerBookingPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    category: "",
    service: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    address: "",
    problem: "",
    payment: "",
    images: [] as File[],
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // ------------------ FETCH ALL CATEGORIES WITH AUTH ------------------
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const types = ["plumbing", "electrician", "carpenter"];
      let allCategories: ServiceCategory[] = [];

      for (let t of types) {
        try {
          const res = await api.get("/api/services/categories", {
            params: { type: t },
          });
          if (res.data.success && Array.isArray(res.data.data)) {
            allCategories = [...allCategories, ...res.data.data];
          }
        } catch (err: any) {
          console.error(`Failed to fetch ${t}:`, err.response?.data || err.message);
        }
      }

      setCategories(allCategories);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  // ------------------ HANDLERS ------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length + form.images.length > 8) {
      setError("You can upload maximum 8 images");
      return;
    }
    setForm({ ...form, images: [...form.images, ...files] });
    setError("");
  };

  const removeImage = (index: number) => {
    const updated = [...form.images];
    updated.splice(index, 1);
    setForm({ ...form, images: updated });
  };

  const handleSubmit = () => {
    if (
      !form.category ||
      !form.service ||
      !form.date ||
      !form.time ||
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.payment
    ) {
      setError("Please fill all required fields");
      return;
    }
    setError("");
    setShowPopup(true);
    console.log("Booking Data:", form);
  };

  const closePopup = () => {
    setShowPopup(false);
    router.push("/customer/dashboard");
  };

  // ------------------ UI ------------------
  return (
    <main className="min-h-screen bg-blue-50 p-6 flex justify-center items-start relative">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl p-10 mt-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
          Book Home Service
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
        )}

        {/* STEP INDICATOR */}
        <div className="flex mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 mx-1 rounded transition-all duration-300 ${
                step >= s ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 – CATEGORY */}
        {step === 1 && (
          <div>
            {loading ? (
              <p className="text-center text-gray-500">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-center text-gray-500">
                No categories available at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setForm({ ...form, category: cat.name, service: "" })
                    }
                    className={`border rounded-2xl p-6 font-semibold text-lg transition
                      ${
                        form.category === cat.name
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "hover:border-blue-400 hover:bg-blue-50"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 – SERVICE TYPE */}
        {step === 2 && (
          <div>
            {categories.find((c) => c.name === form.category)?.services
              .length === 0 ? (
              <p className="text-center text-gray-500">
                No services available for this category
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories
                  .find((c) => c.name === form.category)
                  ?.services.map((srv) => (
                    <button
                      key={srv.id}
                      onClick={() => setForm({ ...form, service: srv.name })}
                      className={`border rounded-2xl p-4 text-left text-lg transition
                        ${
                          form.service === srv.name
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "hover:border-blue-400 hover:bg-blue-50"
                        }`}
                    >
                      {srv.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 – DETAILS */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="date"
                onChange={handleChange}
                className="input"
              />
              <input
                type="time"
                name="time"
                onChange={handleChange}
                className="input"
              />
            </div>

            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="input"
            />

            <input
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              className="input"
            />

            <input
              name="address"
              placeholder="Service Address"
              onChange={handleChange}
              className="input"
            />

            <textarea
              name="problem"
              placeholder="Describe your problem"
              rows={4}
              onChange={handleChange}
              className="input resize-none"
            />

            {/* IMAGE UPLOAD */}
            <div>
              <label className="font-semibold mb-2 block">
                Upload Images (Max 8)
              </label>
              <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Choose Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {form.images.length > 0 && (
                <div className="mt-3 flex gap-3 flex-wrap">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-20 h-20 object-cover rounded shadow-sm"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAYMENT */}
            <div>
              <label className="font-semibold">Payment Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {paymentMethods.map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, payment: p })}
                    className={`border rounded-2xl p-3 text-center text-lg transition
                      ${
                        form.payment === p
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "hover:border-blue-400 hover:bg-blue-50"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NAV BUTTONS */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border rounded-xl hover:bg-gray-100 transition"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Confirm Booking
            </button>
          )}
        </div>
      </div>

      {/* CONFIRMATION POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-white opacity-100"></div>
          <div className="relative bg-white rounded-3xl p-8 w-96 text-center shadow-lg z-10">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Booking Confirmed!
            </h2>
            <p className="mb-2">
              <span className="font-semibold">Service:</span> {form.service}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Date:</span> {form.date}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Time:</span> {form.time}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Payment:</span> {form.payment}
            </p>
            <button
              onClick={closePopup}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: #2563eb;
        }
      `}</style>
    </main>
  );
}
