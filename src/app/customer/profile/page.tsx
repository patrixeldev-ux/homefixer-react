"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser, FiMail, FiPhone, FiMapPin,
  FiCheckCircle, FiEdit2, FiX,
} from "react-icons/fi";
import api from "../../../lib/api";

interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export default function CustomerProfile() {
  const router = useRouter();

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [isEditing,  setIsEditing]  = useState(false);
  const [customer,   setCustomer]   = useState<Customer | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = localStorage.getItem("user");
      return s && s !== "undefined" ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [form,       setForm]       = useState({ name: "", phone: "", address: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg,   setErrorMsg]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/profile/");
        const u: Customer = res.data.user ?? res.data;
        setCustomer(u);
        localStorage.setItem("user", JSON.stringify(u));
      } catch { /* use cached */ }
      finally { setLoading(false); }
    })();
  }, []);

  const startEditing = () => {
    if (!customer) return;
    setForm({ name: customer.name || "", phone: customer.phone || "", address: customer.address || "" });
    setErrorMsg("");
    setIsEditing(true);
  };

  const cancelEditing = () => { setIsEditing(false); setErrorMsg(""); };

  const handleSave = async () => {
    if (!form.name.trim()) { setErrorMsg("Name is required."); return; }
    setSaving(true); setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      if (form.address) fd.append("address", form.address);
      const res = await api.put("/profile/customer/update/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated: Customer = { ...customer!, ...(res.data.user ?? res.data ?? {}), ...form };
      setCustomer(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      setErrorMsg(e?.response?.data?.detail || e?.response?.data?.message || "Failed to save. Please try again.");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initial = customer?.name?.[0]?.toUpperCase() ?? "C";
  const avatarSrc = customer?.avatar && customer.avatar !== ""
    ? customer.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(customer?.name || "U")}&background=2563eb&color=fff&size=128`;

  const inp = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your personal information</p>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto pb-4">

        {/* ── Avatar + account info row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-100 border-2 border-blue-200 shadow mb-4">
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(customer?.name || "U")}&background=2563eb&color=fff&size=128`;
                  }}
                />
              </div>

              <h2 className="font-bold text-gray-900 text-lg">{customer?.name || "—"}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{customer?.email || "—"}</p>
              {customer?.phone && <p className="text-gray-500 text-sm mt-0.5">📞 {customer.phone}</p>}

              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                  <FiUser size={10} /> Customer
                </span>
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Account Info</h3>
            <div className="space-y-2.5 text-sm">
              {[
                { icon: <FiMail size={12} />,  label: "Email",   value: customer?.email   || "—" },
                { icon: <FiPhone size={12} />, label: "Phone",   value: customer?.phone   || "Not set" },
                { icon: <FiMapPin size={12} />,label: "Address", value: customer?.address || "Not set" },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0 gap-2">
                  <span className="text-gray-500 flex items-center gap-1.5 flex-shrink-0">{row.icon} {row.label}</span>
                  <span className={`font-medium text-xs text-right max-w-[55%] break-words ${row.value === "Not set" ? "text-gray-400 italic" : "text-gray-800"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Edit form + quick actions ── */}
        <div className="flex flex-col gap-4">

          {/* Personal details card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button onClick={startEditing}
                  className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors">
                  <FiEdit2 size={13} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={cancelEditing}
                    className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <FiX size={13} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-1.5 rounded-xl transition-colors">
                    {saving
                      ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                      : <><FiCheckCircle size={13} /> Save</>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* View mode */}
            {!isEditing && (
              <div className="space-y-4">
                {[
                  { icon: <FiUser size={15} />,  label: "Full Name", value: customer?.name    },
                  { icon: <FiMail size={15} />,  label: "Email",     value: customer?.email   },
                  { icon: <FiPhone size={15} />, label: "Phone",     value: customer?.phone   },
                  { icon: <FiMapPin size={15} />,label: "Address",   value: customer?.address },
                ].map(f => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0 mt-0.5">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{f.label}</p>
                      <p className={`mt-0.5 text-sm ${f.value ? "text-gray-800 font-medium" : "text-gray-400 italic"}`}>
                        {f.value || "Not set"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit mode */}
            {isEditing && (
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Email <span className="text-gray-400 font-normal text-xs">(cannot be changed)</span></label>
                  <input value={customer?.email || ""} disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className={lbl}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Address</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Your address" className={inp} />
                </div>
              </div>
            )}

            {/* Messages */}
            {successMsg && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                <FiCheckCircle size={15} /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                ✕ {errorMsg}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => router.push("/customer/booking")}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-semibold text-blue-700 transition-colors border border-blue-100">
                📅 Book a Service
              </button>
              <button onClick={() => router.push("/customer/my-bookings")}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors border border-gray-100">
                📋 My Bookings
              </button>
              <button onClick={() => router.push("/customer/help-center")}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors border border-gray-100">
                ❓ Help Center
              </button>
              <button onClick={() => router.push("/feedback")}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors border border-gray-100">
                💬 Give Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
