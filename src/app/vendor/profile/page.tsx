"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

export default function VendorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [isApproved, setIsApproved] = useState(false);

  // ✅ All form fields as flat state — no nested component
  const [businessName,       setBusinessName]       = useState("");
  const [fullAddress,        setFullAddress]        = useState("");
  const [city,               setCity]               = useState("");
  const [state,              setState]              = useState("");
  const [contactNumber,      setContactNumber]      = useState("");
  const [openingTime,        setOpeningTime]        = useState("");
  const [closingTime,        setClosingTime]        = useState("");
  const [storeLat,           setStoreLat]           = useState("");
  const [storeLong,          setStoreLong]          = useState("");
  const [accountHolderName,  setAccountHolderName]  = useState("");
  const [bankName,           setBankName]           = useState("");
  const [accountNumber,      setAccountNumber]      = useState("");
  const [ifscCode,           setIfscCode]           = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/vendor"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile/");
      const u = res.data.user;
      const p = res.data.profile;

      setUser({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
      setIsApproved(p?.is_approved ?? false);

      if (p) {
        setBusinessName(p.business_name       || "");
        setFullAddress(p.full_address          || "");
        setCity(p.city                          || "");
        setState(p.state                        || "");
        setContactNumber(p.contact_number       || "");
        setOpeningTime(p.opening_time           || "");
        setClosingTime(p.closing_time           || "");
        setStoreLat(p.store_lat                 ? String(p.store_lat)  : "");
        setStoreLong(p.store_long               ? String(p.store_long) : "");
        setAccountHolderName(p.account_holder_name || "");
        setBankName(p.bank_name                 || "");
        setAccountNumber(p.account_number       || "");
        setIfscCode(p.ifsc_code                 || "");
      }
    } catch {
      router.replace("/vendor");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(""); setSuccess("");
    try {
      // ✅ FormData — backend uses MultiPartParser
      const data = new FormData();
      data.append("business_name",       businessName);
      data.append("full_address",        fullAddress);
      data.append("city",                city);
      data.append("state",               state);
      data.append("contact_number",      contactNumber);
      data.append("opening_time",        openingTime);
      data.append("closing_time",        closingTime);
      data.append("store_lat",           storeLat);
      data.append("store_long",          storeLong);
      data.append("account_holder_name", accountHolderName);
      data.append("bank_name",           bankName);
      data.append("account_number",      accountNumber);
      data.append("ifsc_code",           ifscCode);

      await api.put("/api/profile/vendor/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.detail || JSON.stringify(err?.response?.data) || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-800 mb-1";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/vendor/dashboard")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
        </div>

        {/* User Info Card */}
        <div className="bg-amber-500 text-white rounded-2xl p-5 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-400 border-2 border-white/50 flex items-center justify-center text-2xl font-bold shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "V"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg truncate">{user.name}</p>
            <p className="text-amber-100 text-sm truncate">{user.email}</p>
            {user.phone && <p className="text-amber-100 text-sm">📞 {user.phone}</p>}
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
            isApproved ? "bg-green-500" : "bg-yellow-600"
          }`}>
            {isApproved ? "✓ Approved" : "⏳ Pending"}
          </span>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Business Details</h3>

          <div>
            <label className={labelClass}>Business Name</label>
            <input className={inputClass} value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Raman Hardware" />
          </div>

          <div>
            <label className={labelClass}>Full Address</label>
            <input className={inputClass} value={fullAddress}
              onChange={e => setFullAddress(e.target.value)}
              placeholder="Shop / store address" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City</label>
              <input className={inputClass} value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Vadodara" />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input className={inputClass} value={state}
                onChange={e => setState(e.target.value)}
                placeholder="Gujarat" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Contact Number</label>
            <input className={inputClass} value={contactNumber}
              onChange={e => setContactNumber(e.target.value)}
              placeholder="9876543210" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Opening Time</label>
              <input type="time" className={inputClass} value={openingTime}
                onChange={e => setOpeningTime(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Closing Time</label>
              <input type="time" className={inputClass} value={closingTime}
                onChange={e => setClosingTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Store Location */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 mb-4 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Store Location</h3>
            <p className="text-amber-600 text-xs mt-0.5 font-medium">
              ⚠️ Required — servicemen find you based on these coordinates
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Store Latitude</label>
              <input className={inputClass} value={storeLat}
                onChange={e => setStoreLat(e.target.value)}
                placeholder="22.3283" />
            </div>
            <div>
              <label className={labelClass}>Store Longitude</label>
              <input className={inputClass} value={storeLong}
                onChange={e => setStoreLong(e.target.value)}
                placeholder="73.2421" />
            </div>
          </div>
          <p className="text-gray-400 text-xs">
            Find at{" "}
            <a href="https://maps.google.com" target="_blank" className="text-blue-500 underline">
              maps.google.com
            </a>{" "}
            → right click → "What's here?"
          </p>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Bank Details</h3>

          <div>
            <label className={labelClass}>Account Holder Name</label>
            <input className={inputClass} value={accountHolderName}
              onChange={e => setAccountHolderName(e.target.value)}
              placeholder="Full name as per bank" />
          </div>

          <div>
            <label className={labelClass}>Bank Name</label>
            <input className={inputClass} value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="e.g. Bank of Baroda" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Account Number</label>
              <input className={inputClass} value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="Account number" />
            </div>
            <div>
              <label className={labelClass}>IFSC Code</label>
              <input className={inputClass} value={ifscCode}
                onChange={e => setIfscCode(e.target.value)}
                placeholder="BARB0XYZABC" />
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl mb-4">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-4">
            ✕ {error}
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-colors text-base">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </main>
  );
}