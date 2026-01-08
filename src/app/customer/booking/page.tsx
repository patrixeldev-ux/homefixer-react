"use client";

import React, { useState } from "react";

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
  Electrician: ["Wiring Repair", "Outlet Installation", "Circuit Breaker", "Lighting"],
  Carpenter: ["Furniture Repair", "Door Installation", "Flooring", "Cabinet Work"],
  Cleaner: ["House Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning"],
  Painter: ["Interior Painting", "Exterior Painting", "Wall Repair", "Color Consultation"],
};

export default function BookingPage() {
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
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.serviceCategory || !form.serviceType || !form.date || !form.time || !form.name || !form.phone || !form.address || !form.problemDescription) {
      setError("All fields are required.");
      return;
    }

    // Frontend only: log the booking data
    console.log("Booking submitted:", form);
    alert("Booking submitted successfully!");
    // Reset form
    setForm({
      serviceCategory: "",
      serviceType: "",
      date: "",
      time: "",
      name: "",
      phone: "",
      address: "",
      problemDescription: "",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
          Book a Service
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Category
            </label>
            <select
              name="serviceCategory"
              value={form.serviceCategory}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {Object.keys(serviceOptions).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              disabled={!form.serviceCategory}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Type</option>
              {form.serviceCategory &&
                serviceOptions[form.serviceCategory].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Description
            </label>
            <textarea
              name="problemDescription"
              value={form.problemDescription}
              onChange={handleChange}
              placeholder="Describe the problem in detail"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition duration-200"
          >
            Book Now
          </button>
        </form>
      </div>
    </main>
  );
}
