"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiClock, FiMapPin } from "react-icons/fi";
import api from "../../../lib/api";

export default function VendorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  const [user,       setUser]       = useState({ name: "", email: "", phone: "" });
  const [isApproved, setIsApproved] = useState(false);

  const [businessName,      setBusinessName]      = useState("");
  const [fullAddress,       setFullAddress]       = useState("");
  const [city,              setCity]              = useState("");
  const [stateName,         setStateName]         = useState("");
  const [contactNumber,     setContactNumber]     = useState("");
  const [openingTime,       setOpeningTime]       = useState("");
  const [closingTime,       setClosingTime]       = useState("");
  const [storeLat,          setStoreLat]          = useState("");
  const [storeLong,         setStoreLong]         = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName,          setBankName]          = useState("");
  const [accountNumber,     setAccountNumber]     = useState("");
  const [ifscCode,          setIfscCode]          = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/vendor"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
<<<<<<< HEAD
      const res = await api.get("/profile/");
=======
      const res = await api.get("/api/profile/");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      const u = res.data.user; const p = res.data.profile;
      setUser({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
      setIsApproved(p?.is_approved ?? false);
      if (p) {
        setBusinessName(p.business_name || "");
        setFullAddress(p.full_address || "");
        setCity(p.city || ""); setStateName(p.state || "");
        setContactNumber(p.contact_number || "");
        setOpeningTime(p.opening_time || ""); setClosingTime(p.closing_time || "");
        setStoreLat(p.store_lat ? String(p.store_lat) : "");
        setStoreLong(p.store_long ? String(p.store_long) : "");
        setAccountHolderName(p.account_holder_name || "");
        setBankName(p.bank_name || ""); setAccountNumber(p.account_number || "");
        setIfscCode(p.ifsc_code || "");
      }
    } catch { router.replace("/vendor"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const data = new FormData();
      data.append("business_name", businessName); data.append("full_address", fullAddress);
      data.append("city", city); data.append("state", stateName);
      data.append("contact_number", contactNumber);
      data.append("opening_time", openingTime); data.append("closing_time", closingTime);
      data.append("store_lat", storeLat); data.append("store_long", storeLong);
      data.append("account_holder_name", accountHolderName);
      data.append("bank_name", bankName); data.append("account_number", accountNumber);
      data.append("ifsc_code", ifscCode);
<<<<<<< HEAD
      await api.put("/profile/vendor/update/", data, { headers: { "Content-Type": "multipart/form-data" } });
=======
      await api.put("/api/profile/vendor/update/", data, { headers: { "Content-Type": "multipart/form-data" } });
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Failed to update profile");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inp = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-sm";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="h-full flex flex-col gap-5">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your store details and bank information</p>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto pb-4">

        {/* ── Avatar + status row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-amber-400" />
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-3xl font-bold text-orange-600 mb-3">
                {user.name?.[0]?.toUpperCase() ?? "V"}
              </div>
              <h2 className="font-bold text-gray-900 text-lg">{businessName || user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.phone && <p className="text-gray-500 text-sm mt-0.5">📞 {user.phone}</p>}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {isApproved ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                  {isApproved ? "Approved" : "Pending Approval"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => router.push("/vendor/products")}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-orange-50 hover:bg-orange-100 rounded-xl text-sm font-semibold text-orange-700 transition-colors">
                📦 Manage Products
              </button>
              <button onClick={() => router.push("/vendor/orders")}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                📋 View Orders
              </button>
              <button onClick={() => router.push("/vendor/settings")}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* ── Forms ── */}
        <div className="flex flex-col gap-4">

          {/* Business details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Business Details</h3>
            <div>
              <label className={lbl}>Business Name</label>
              <input className={inp} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Raman Hardware" />
            </div>
            <div>
              <label className={lbl}>Full Address</label>
              <input className={inp} value={fullAddress} onChange={e => setFullAddress(e.target.value)} placeholder="Shop / store address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>City</label><input className={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="Vadodara" /></div>
              <div><label className={lbl}>State</label><input className={inp} value={stateName} onChange={e => setStateName(e.target.value)} placeholder="Gujarat" /></div>
            </div>
            <div>
              <label className={lbl}>Contact Number</label>
              <input className={inp} value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="9876543210" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Opening Time</label><input type="time" className={inp} value={openingTime} onChange={e => setOpeningTime(e.target.value)} /></div>
              <div><label className={lbl}>Closing Time</label><input type="time" className={inp} value={closingTime} onChange={e => setClosingTime(e.target.value)} /></div>
            </div>
          </div>

          {/* Store location */}
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><FiMapPin className="text-orange-500" /> Store Location</h3>
              <p className="text-orange-600 text-xs mt-0.5 font-medium">⚠️ Required — servicemen find you based on these coordinates</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Latitude</label><input className={inp} value={storeLat} onChange={e => setStoreLat(e.target.value)} placeholder="22.3283" /></div>
              <div><label className={lbl}>Longitude</label><input className={inp} value={storeLong} onChange={e => setStoreLong(e.target.value)} placeholder="73.2421" /></div>
            </div>
            <p className="text-gray-400 text-xs">
              Find at <a href="https://maps.google.com" target="_blank" className="text-orange-500 underline">maps.google.com</a> → right click → "What's here?"
            </p>
          </div>

          {/* Bank details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Bank Details</h3>
            <div><label className={lbl}>Account Holder Name</label><input className={inp} value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} placeholder="Full name as per bank" /></div>
            <div><label className={lbl}>Bank Name</label><input className={inp} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Bank of Baroda" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Account Number</label><input className={inp} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account number" /></div>
              <div><label className={lbl}>IFSC Code</label><input className={inp} value={ifscCode} onChange={e => setIfscCode(e.target.value)} placeholder="BARB0XYZABC" /></div>
            </div>
          </div>

          {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2"><FiCheckCircle size={15} /> {success}</div>}
          {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">✕ {error}</div>}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
