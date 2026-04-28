"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FiEdit2, FiCheck, FiX, FiLogOut, FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function CustomerProfile() {
  const router = useRouter();

  // ✅ Seed from localStorage immediately (same pattern as dashboard)
  const [customer, setCustomer] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit form — only populated when Edit is clicked
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Fetch fresh profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/profile/");
        const freshUser = res.data.user ?? res.data;
        setCustomer(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } catch (err) {
        console.log("Profile fetch failed (showing cached data):", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const startEditing = () => {
    if (!customer) return;

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setErrorMsg("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const profileForm = new FormData();
      profileForm.append("name", form.name);
      profileForm.append("phone", form.phone);
      if (form.address) profileForm.append("address", form.address);
      const res = await api.put("/api/profile/customer/update/", profileForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update local state + localStorage with fresh data
     const updated = res.data.user ?? res.data ?? {};

      const mergedUser = {
        ...customer,
        ...updated,
        ...form,
      };

      setCustomer(mergedUser);
      localStorage.setItem("user", JSON.stringify(mergedUser));

      setIsEditing(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      console.log("Profile update error:", err.response?.data);
      setErrorMsg(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to save. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout/");
    } catch {}
    finally {
      localStorage.clear();
      router.push("/");
    }
  };

  // Fields for display mode
  const displayFields = [
    { label: "Full Name", value: customer?.name, icon: <FiUser size={16} />, key: "name" },
    { label: "Email", value: customer?.email, icon: <FiMail size={16} />, key: "email" },
    { label: "Phone", value: customer?.phone, icon: <FiPhone size={16} />, key: "phone" },
    { label: "Address", value: customer?.address, icon: <FiMapPin size={16} />, key: "address" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "Syncing your profile..." : "Manage your personal information"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
          >
            <FiLogOut size={14} />
            Logout
          </button>
        </div>

        {/* Avatar + Name Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 flex items-center gap-5">
          <img
            src={
              customer?.avatar && customer.avatar !== ""
                ? customer.avatar
                : "/avatar.png"
            }
            onError={(e: any) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                customer?.name || "U"
              )}&background=3b82f6&color=fff&size=128`;
            }}
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow"
            alt="avatar"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {customer?.name || "—"}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">{customer?.email || "—"}</p>
            <span className="inline-block mt-2 text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              Customer
            </span>
          </div>
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
            <FiCheck size={15} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Personal Information</h3>
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200 px-4 py-1.5 rounded-xl hover:bg-blue-50 transition"
              >
                <FiEdit2 size={13} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition"
                >
                  <FiX size={13} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-sm text-white bg-blue-600 px-4 py-1.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
                >
                  {saving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <><FiCheck size={13} /> Save</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* VIEW MODE */}
          {!isEditing && (
            <div className="space-y-4">
              {displayFields.map((f) => (
                <div key={f.key} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {f.label}
                    </p>
                    <p className="text-gray-800 mt-0.5">
                      {f.value || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <div className="space-y-4">
              {/* Email is read-only */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Email <span className="text-gray-400 normal-case font-normal">(cannot be changed)</span>
                </label>
                <input
                  value={customer?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Full Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your address"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}