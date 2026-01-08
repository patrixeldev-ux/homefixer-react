"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();

  const customerName = "John Doe"; // Replace with dynamic name from auth context or API

  const actions = [
    {
      title: "Book a Service",
      description: "Schedule a new service with our professionals.",
      buttonText: "Book Now",
      onClick: () => router.push("/customer/booking"),
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-200",
    },
    {
      title: "My Bookings",
      description: "View your upcoming and past service bookings.",
      buttonText: "View Bookings",
      onClick: () => router.push("/customer/my-bookings"), // placeholder
      bgColor: "bg-green-100",
      hoverColor: "hover:bg-green-200",
    },
    {
      title: "Profile",
      description: "Update your personal details and preferences.",
      buttonText: "Go to Profile",
      onClick: () => router.push("/customer/profile"), // placeholder
      bgColor: "bg-yellow-100",
      hoverColor: "hover:bg-yellow-200",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
            Welcome, {customerName}!
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Choose an action below to get started.
          </p>
        </header>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {actions.map((action, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl shadow-xl ${action.bgColor} transition transform hover:scale-105 cursor-pointer ${action.hoverColor}`}
            >
              <h2 className="text-2xl font-bold mb-2">{action.title}</h2>
              <p className="text-gray-700 mb-4">{action.description}</p>
              <button
                onClick={action.onClick}
                className="mt-auto px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
              >
                {action.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Optional: Upcoming Bookings Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">Upcoming Bookings</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
            You have no upcoming bookings yet. Book a service to get started!
          </div>
        </section>
      </div>
    </main>
  );
}
