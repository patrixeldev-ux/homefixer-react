"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiStar, FiMapPin, FiCheckCircle, FiClock, FiMap } from "react-icons/fi";
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
  experience_years?: number | string | null;
  upi_id?: string | null;
  kyc_document?: string | null;
}

interface User {
  name: string;
  email: string;
  phone: string;
}

interface Category {
  id: number;
  name: string;
  category_type: string;
  visiting_charge: string;
  parent?: number | null;
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
  
  const [form, setForm] = useState({ 
    name: "", phone: "", skills: "", visiting_charge: "",
    experience_years: "", upi_id: "", 
    lat: null as number | null, long: null as number | null, address: ""
  });

  const [categories, setCategories]     = useState<Category[]>([]);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [kycFile, setKycFile]           = useState<File | null>(null);
  const [successMsg, setSuccessMsg]     = useState("");
  const [error, setError]               = useState("");

  const [detecting, setDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/service-man"); return; }
    fetchProfile();
    fetchCategories();
  }, []);

  // Reverse geocode on initial load if we have coordinates but no text address
  useEffect(() => {
    if (form.lat && form.long && !form.address) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${form.lat}&lon=${form.long}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setForm(f => ({ ...f, address: data.display_name }));
          }
        }).catch(e => console.error("Initial reverse geocode failed", e));
    }
  }, [form.lat, form.long]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/", { params: { category_type: "SERVICE" } });
      const cats = Array.isArray(res.data) ? res.data : [];
      setCategories(cats.filter((c: any) => c.category_type === "SERVICE" || !c.category_type));
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/");
      const u = res.data.user;
      const p = res.data.profile;
      setUser({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
      if (p) {
        setProfile(p);
        const skillsStr = Array.isArray(p.skills)
          ? p.skills.join(", ")
          : typeof p.skills === "string"
            ? p.skills.replace(/[\[\]"]/g, "").replace(/,/g, ", ").trim()
            : "";
            
        setForm({ 
          name: u.name || "",
          phone: u.phone || "",
          skills: skillsStr, 
          visiting_charge: p.visiting_charge || "",
          experience_years: p.experience_years?.toString() || "",
          upi_id: p.upi_id || "",
          lat: p.current_lat ? parseFloat(p.current_lat) : null,
          long: p.current_long ? parseFloat(p.current_long) : null,
          address: ""
        });
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

  const handleKycChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setKycFile(file);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(f => ({ ...f, address: val }));
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=in`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (e) { console.error(e); }
    }, 600);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setForm(f => ({ 
      ...f, 
      address: suggestion.display_name, 
      lat: parseFloat(suggestion.lat), 
      long: parseFloat(suggestion.lon) 
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const detectLocation = () => {
    if (!("geolocation" in navigator)) { alert("Geolocation not supported"); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let foundAddress = form.address;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) foundAddress = data.display_name;
        } catch (e) { console.error(e); }
        setForm(f => ({ ...f, lat: lat, long: lng, address: foundAddress }));
        setDetecting(false);
        setSuggestions([]);
        setShowSuggestions(false);
      },
      (error) => {
        alert("Please allow location access");
        setDetecting(false);
      }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(""); setSuccessMsg("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("skills", form.skills);
      fd.append("visiting_charge", form.visiting_charge);
      
      if (form.experience_years) fd.append("experience_years", form.experience_years);
      if (form.upi_id) fd.append("upi_id", form.upi_id);
      if (form.lat !== null) fd.append("current_lat", form.lat.toString());
      if (form.long !== null) fd.append("current_long", form.long.toString());
      if (imageFile) fd.append("profile_image", imageFile);
      if (kycFile) fd.append("kyc_document", kycFile);

      await api.put("/profile/serviceman/update/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMsg("Profile updated successfully!");
      setImageFile(null);
      setKycFile(null);
      
      // Update local user state so header updates
      setUser(prev => ({ ...prev, name: form.name, phone: form.phone }));
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  // Build a structured list of categories for the dropdown: parents followed by their children
  const parentCategories = categories.filter(c => !c.parent);
  const structuredCategories = parentCategories.flatMap(parent => {
    const children = categories.filter(c => c.parent === parent.id);
    return [parent, ...children];
  });

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your professional details</p>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto pb-4">

        {/* ── Avatar + account info row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="p-5 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
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

              <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.phone && <p className="text-gray-500 text-sm mt-0.5">📞 {user.phone}</p>}

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  profile.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {profile.is_approved ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                  {profile.is_approved ? "Approved" : "Pending"}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  profile.is_active ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                }`}>
                  {profile.is_active ? "● Active" : "○ Inactive"}
                </span>
                {profile.average_rating > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                    <FiStar size={10} fill="currentColor" />
                    {Number(profile.average_rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Account Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-1.5"><FiUser size={12} /> Status</span>
                <span className={`font-semibold text-xs ${profile.is_active ? "text-green-700" : "text-red-600"}`}>
                  {profile.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-1.5"><FiCheckCircle size={12} /> Approval</span>
                <span className={`font-semibold text-xs ${profile.is_approved ? "text-green-700" : "text-yellow-700"}`}>
                  {profile.is_approved ? "Approved" : "Awaiting"}
                </span>
              </div>
              {profile.current_lat && profile.current_long && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-500 flex items-center gap-1.5"><FiMapPin size={12} /> Location</span>
                  <span className="font-mono text-xs text-gray-700">
                    {parseFloat(profile.current_lat).toFixed(4)}, {parseFloat(profile.current_long).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Edit form ── */}
        <div className="flex flex-col gap-4">
          
          {/* Section 1: Personal Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Your phone number" className={inputClass} />
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Service Location / Address</label>
                  <button type="button" onClick={detectLocation} disabled={detecting}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200">
                    {detecting ? (
                      <><span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> Locating...</>
                    ) : (
                      <><FiMap size={12} /> Detect Location</>
                    )}
                  </button>
                </div>
                
                <div className="relative">
                  <input value={form.address} onChange={handleAddressChange} placeholder="Start typing your address..." className={inputClass} />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((s, idx) => (
                        <div key={s.place_id || idx} onClick={() => handleSelectSuggestion(s)} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                          <p className="text-sm text-gray-800 font-medium leading-tight">{s.display_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {form.lat !== null && form.long !== null && (
                  <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1 font-medium">
                    <FiCheckCircle /> Location pinned successfully ({Number(form.lat).toFixed(4)}, {Number(form.long).toFixed(4)})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Professional Details</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className={labelClass}>Service Category</label>
                  <select
                    value={form.skills}
                    onChange={e => {
                      const catName = e.target.value;
                      const selectedCat = categories.find(c => c.name === catName);
                      setForm(f => ({
                        ...f,
                        skills: catName,
                        visiting_charge: selectedCat?.visiting_charge || f.visiting_charge
                      }));
                    }}
                    className={inputClass}
                  >
                    <option value="">Select your service category</option>
                    {structuredCategories.map(c => (
                      <option key={c.id} value={c.name} className={c.parent ? "text-gray-500 pl-4" : "font-bold"}>
                        {c.parent ? `  — ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visiting charge (Read-only) */}
                <div>
                  <label className={labelClass}>Visiting Charge (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₹</span>
                    <input type="number" value={form.visiting_charge} readOnly className={`${inputClass} pl-8 bg-gray-50 text-gray-500 cursor-not-allowed`} />
                  </div>
                </div>

                {/* Experience Years */}
                <div>
                  <label className={labelClass}>Experience (Years)</label>
                  <input type="number" min="0" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))} placeholder="e.g. 5" className={inputClass} />
                </div>

                {/* UPI ID */}
                <div>
                  <label className={labelClass}>UPI ID</label>
                  <input value={form.upi_id} onChange={e => setForm(f => ({ ...f, upi_id: e.target.value }))} placeholder="e.g. name@bank" className={inputClass} />
                </div>

                {/* KYC Document */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>KYC Document (Aadhar/PAN/etc)</label>
                  <input type="file" onChange={handleKycChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  <p className="text-xs text-gray-400 mt-1.5">Upload a clear photo or PDF of your identification document.</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-2">
                {/* Messages */}
                {successMsg && (
                 <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
                   <FiCheckCircle size={15} /> {successMsg}
                 </div>
                )}
                {error && (
                 <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-4">
                   ✕ {error}
                 </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    : "Save All Changes"
                  }
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
