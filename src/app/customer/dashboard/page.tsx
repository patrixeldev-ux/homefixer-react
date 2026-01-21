"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

export default function CustomerDashboard() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);


  useEffect(() => { 

    setIsLoaded(true);
  }, []);

  // Mock customer data - replace with actual data from API/context
  const customer = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://via.placeholder.com/150", // Placeholder avatar
    joinDate: "January 2023",
    totalBookings: 12,
    pendingServices: 2,
    completedServices: 10,
  };

  const actions = [
    {
      title: "Book a Service",
      description: "Schedule a new service with our professionals.",
      buttonText: "Book Now",
      onClick: () => router.push("/customer/booking"),
      gradient: "from-[#1A73E8] to-[#1E88E5]",
      icon: "🔧",
      delay: "0s",
    },
    {
      title: "My Bookings",
      description: "View your upcoming and past service bookings.",
      buttonText: "View Bookings",
      onClick: () => router.push("/customer/my-bookings"),
      gradient: "from-[#FFC107] to-[#FF8F00]",
      icon: "📋",
      delay: "0.1s",
    },
    {
      title: "Profile",
      description: "Update your personal details and preferences.",
      buttonText: "Go to Profile",
      onClick: () => router.push("/customer/profile"),
      gradient: "from-[#1A73E8] to-[#1565C0]",
      icon: "👤",
      delay: "0.2s",
    },
  ];

  const recentActivities = [
    { id: 1, activity: "Booked Plumbing Service", date: "2023-10-15", status: "Completed", icon: "🔧" },
    { id: 2, activity: "Scheduled Electrical Repair", date: "2023-10-20", status: "Pending", icon: "⚡" },
    { id: 3, activity: "Updated Profile Information", date: "2023-10-10", status: "Completed", icon: "📝" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1A73E8]/5 via-white to-[#1E88E5]/5 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1A73E8]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFC107]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">


        {/* Profile Overview Section */}
        <div className={`backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl p-8 mb-8 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <img
                src={customer.avatar}
                alt="Customer Avatar"
                className="w-32 h-32 rounded-full border-4 border-[#1A73E8]/30 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div className={`text-center md:text-left transition-all duration-1000 delay-500 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-[#212121] mr-4">
                  Welcome back, {customer.name}!
                </h1>
                
              </div>
              <p className="text-[#1A73E8] mb-4 font-medium">Member since {customer.joinDate}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#212121]">Email:</span>
                  <span className="text-gray-600">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#212121]">Phone:</span>
                  <span className="text-gray-600">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#212121]">Account Status:</span>
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Bookings", value: customer.totalBookings, color: "#1A73E8", delay: "0.6s" },
            { label: "Pending Services", value: customer.pendingServices, color: "#FFC107", delay: "0.7s" },
            { label: "Completed Services", value: customer.completedServices, color: "#4CAF50", delay: "0.8s" },
          ].map((stat, index) => (
            <div
              key={index}
              className={`backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl shadow-xl p-6 text-center transition-all duration-1000 transform hover:scale-105 hover:shadow-2xl ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ animationDelay: stat.delay }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[#212121] font-medium">{stat.label}</div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-2000"
                  style={{ backgroundColor: stat.color, width: `${(stat.value / 15) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {actions.map((action, index) => (
            <div
              key={index}
              className={`group backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 transition-all duration-1000 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ animationDelay: action.delay }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
              <h2 className="text-xl font-bold mb-2 text-[#212121]">{action.title}</h2>
              <p className="text-gray-600 mb-4">{action.description}</p>
              <button
                onClick={action.onClick}
                className={`w-full px-4 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${action.gradient} hover:brightness-110`}
              >
                {action.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Recent Activities Section */}
        <div className={`backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-xl p-6 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ animationDelay: '0.9s' }}>
          <h2 className="text-2xl font-bold text-[#212121] mb-6 flex items-center">
            <span className="mr-3">📊</span> Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 transition-all duration-500 hover:shadow-md ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ animationDelay: `${1 + index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <p className="font-medium text-[#212121]">{activity.activity}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activity.status === "Completed"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-[#FFC107]/20 text-[#FF8F00] border border-[#FFC107]/30"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
          {recentActivities.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recent activities to display.</p>
          )}
        </div>
      </div>
    </main>
  );
}
