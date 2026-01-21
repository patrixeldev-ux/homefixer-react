"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

export default function CustomerProfile() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch {}
    finally {
      localStorage.clear();
      router.push("/");
    }
  };

  // Customer data (replace with API later)
  const [customer, setCustomer] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://via.placeholder.com/150",
    address: "123 Main St, City, State 12345",
    joinDate: "January 2023",
  });

  const handleSave = () => {
    // Save to backend later
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1A73E8]/5 via-white to-[#1E88E5]/5 p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1A73E8]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFC107]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className={`bg-white/80 backdrop-blur-xl border rounded-3xl shadow-2xl p-8 mb-8 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={customer.avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-[#1A73E8]/30 shadow-xl"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#212121]">{customer.name}</h1>
              <p className="text-[#1A73E8] font-medium mb-3">
                Member since {customer.joinDate}
              </p>
              <p className="text-gray-600">{customer.email}</p>
              <p className="text-gray-600">{customer.phone}</p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 bg-gradient-to-r from-[#1A73E8] to-[#1565C0] text-white rounded-xl shadow-lg hover:brightness-110 transition"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white/80 backdrop-blur-xl border rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#212121] mb-6">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                value={customer.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="w-full mt-2 px-4 py-3 border rounded-xl disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                value={customer.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                className="w-full mt-2 px-4 py-3 border rounded-xl disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                value={customer.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className="w-full mt-2 px-4 py-3 border rounded-xl disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
                value={customer.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                className="w-full mt-2 px-4 py-3 border rounded-xl disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSave}
              className="px-8 py-4 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
