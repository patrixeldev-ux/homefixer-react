"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface Profile {
  skills: string | string[];
  visiting_charge: string;
  average_rating: number;
  is_active: boolean;
  is_approved: boolean;
  profile_image: string | null;
  current_lat: string | null;
  current_long: string | null;
}

interface User {
  name: string;
  email: string;
  phone: string;
}

export default function ServiceManProfile() {
  const router = useRouter();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [user, setUser]         = useState<User>({ name: "", email: "", phone: "" });
  const [profile, setProfile]   = useState<Profile>({
    skills: "", visiting_charge: "", average_rating: 0,
    is_active: true, is_approved: false,
    profile_image: null, current_lat: null, current_long: null,
  });
  const [form, setForm]           = useState({ skills: "", visiting_charge: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState("");
  const [error, setError]               = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/service-man"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile/");
      const u = res.data.user;
      const p = res.data.profile;
      setUser({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
      if (p) {
        setProfile(p);
        // ✅ Properly handle skills whether array or string
        const skillsStr = Array.isArray(p.skills)
          ? p.skills.join(", ")
          : typeof p.skills === "string"
            ? p.skills.replace(/[\[\]"]/g, "").replace(/,/g, ", ").trim()
            : "";
        setForm({ skills: skillsStr, visiting_charge: p.visiting_charge || "" });
        if (p.profile_image) setImagePreview(p.profile_image);
      }
    } catch {
      router.replace("/service-man");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("skills", form.skills);
      formData.append("visiting_charge", form.visiting_charge);
      if (imageFile) formData.append("profile_image", imageFile);
      await api.put("/api/profile/serviceman/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMsg("Profile updated successfully!");
      setImageFile(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Parse skills for display chips
  const skillChips = form.skills
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your professional details</p>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="p-6 flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-100 border-2 border-blue-200 flex items-center justify-center shadow">
                {imagePreview
                  ? <img src={imagePreview} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-blue-600">{user.name?.[0]?.toUpperCase() ?? "S"}</span>
                }
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                <span className="text-white text-sm">✎</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
              {user.phone && (
                <p className="text-gray-500 text-sm mt-0.5">📞 {user.phone}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  profile.is_approved
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {profile.is_approved ? "✓ Approved" : "⏳ Pending Approval"}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  profile.is_active ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                }`}>
                  {profile.is_active ? "● Active" : "○ Inactive"}
                </span>
                {profile.average_rating > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                    ⭐ {Number(profile.average_rating).toFixed(1)} rating
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-gray-900">Professional Details</h3>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Skills / Services Offered
            </label>
            <input
              value={form.skills}
              onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
              placeholder="e.g. Plumbing, Electrical, AC Repair"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {/* Preview chips */}
            {skillChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skillChips.map((s, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">Comma-separated list of services you provide</p>
          </div>

          {/* Visiting charge */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Visiting Charge (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₹</span>
              <input
                type="number"
                value={form.visiting_charge}
                onChange={e => setForm(f => ({ ...f, visiting_charge: e.target.value }))}
                placeholder="299"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Platform fee is 10% on top of your charge</p>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
              <span>✓</span> {successMsg}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
              <span>✕</span> {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              : "Save Changes"
            }
          </button>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Account Info</h3>
          <div className="space-y-3 text-sm">
            {[
              ["Status",   profile.is_active ? "Active" : "Inactive",
               profile.is_active ? "text-green-700" : "text-red-600"],
              ["Approval", profile.is_approved ? "Approved" : "Awaiting Admin Approval",
               profile.is_approved ? "text-green-700" : "text-yellow-700"],
              ...(profile.current_lat && profile.current_long ? [
                ["Last Location",
                 `${parseFloat(profile.current_lat).toFixed(4)}, ${parseFloat(profile.current_long).toFixed(4)}`,
                 "text-gray-900"]
              ] : []),
            ].map(([label, value, cls]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className={`font-semibold ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}