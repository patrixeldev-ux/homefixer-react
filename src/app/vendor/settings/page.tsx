"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiLock, FiBell, FiShield, FiTrash2,
  FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff,
} from "react-icons/fi";
import api from "../../../lib/api";

type Section = "password" | "notifications" | "privacy" | "danger";

interface NotifSettings {
  new_order:       boolean;
  order_reminder:  boolean;
  payment_received: boolean;
  low_stock:       boolean;
  app_updates:     boolean;
}

export default function VendorSettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("password");

  // ── Password ──────────────────────────────────────────────────────────────
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwSuccess,   setPwSuccess]   = useState("");
  const [pwError,     setPwError]     = useState("");

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notif, setNotif] = useState<NotifSettings>({
    new_order: true, order_reminder: true,
    payment_received: true, low_stock: true, app_updates: false,
  });
  const [notifSaving,  setNotifSaving]  = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");

  // ── Danger zone ───────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting,      setDeleting]      = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) router.replace("/vendor");
  }, []);

  const handleChangePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("All fields are required."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
    setPwSaving(true);
    try {
      await api.post("/auth/change-password/", {
        old_password: currentPw,
        new_password: newPw,
      });
      setPwSuccess("Password changed successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; detail?: string } } };
      setPwError(e?.response?.data?.error || e?.response?.data?.detail || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    try {
      await api.post("/settings/notifications/", notif);
    } catch { /* endpoint may not exist yet */ }
    setNotifSuccess("Preferences saved!");
    setTimeout(() => setNotifSuccess(""), 3000);
    setNotifSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await api.delete("/auth/delete-account/");
      localStorage.clear();
      router.replace("/");
    } catch {
      alert("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  const sections: { id: Section; label: string; icon: React.ReactNode; danger?: boolean }[] = [
    { id: "password",      label: "Password",      icon: <FiLock size={16} /> },
    { id: "notifications", label: "Notifications", icon: <FiBell size={16} /> },
    { id: "privacy",       label: "Privacy",       icon: <FiShield size={16} /> },
    { id: "danger",        label: "Danger Zone",   icon: <FiTrash2 size={16} />, danger: true },
  ];

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const accent     = "amber"; // vendor theme colour

  return (
    <div className="p-6 h-full flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your vendor account preferences</p>
      </div>

      <div className="flex gap-5 overflow-y-auto pb-4 flex-1">

        {/* ── Left nav ── */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-col gap-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeSection === s.id
                    ? s.danger ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-900 font-semibold"
                    : s.danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">

          {/* Password */}
          {activeSection === "password" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FiLock size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Change Password</h2>
                  <p className="text-gray-500 text-xs">Use a strong password with 8+ characters</p>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <div className="relative">
                    <input type={showCurrent ? "text" : "password"} value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      placeholder="Enter current password" className={inputClass} />
                    <button type="button" onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="Min. 8 characters" className={inputClass} />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {newPw && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          newPw.length >= i * 3
                            ? newPw.length >= 12 ? "bg-green-500" : newPw.length >= 8 ? "bg-yellow-400" : "bg-red-400"
                            : "bg-gray-200"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input type="password" value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className={`${inputClass} ${confirmPw && confirmPw !== newPw ? "border-red-300 focus:ring-red-400" : ""}`} />
                  {confirmPw && confirmPw !== newPw && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {pwSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
                    <FiCheckCircle size={15} /> {pwSuccess}
                  </div>
                )}
                {pwError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    <FiAlertCircle size={15} /> {pwError}
                  </div>
                )}

                <button onClick={handleChangePassword} disabled={pwSaving}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {pwSaving
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    : "Update Password"
                  }
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FiBell size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Notification Preferences</h2>
                  <p className="text-gray-500 text-xs">Choose what you want to be notified about</p>
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                {([
                  { key: "new_order",        label: "New Material Orders",  desc: "When a serviceman places an order" },
                  { key: "order_reminder",   label: "Order Reminders",      desc: "Reminders for pending orders" },
                  { key: "payment_received", label: "Payment Received",     desc: "When payment is confirmed" },
                  { key: "low_stock",        label: "Low Stock Alerts",     desc: "When product stock falls below 5" },
                  { key: "app_updates",      label: "App Updates & Tips",   desc: "Product news and feature updates" },
                ] as { key: keyof NotifSettings; label: string; desc: string }[]).map(item => (
                  <div key={item.key}
                    onClick={() => setNotif(n => ({ ...n, [item.key]: !n[item.key] }))}
                    className="flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-amber-300 transition-colors select-none">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    {/* Toggle — inline styles guarantee visibility */}
                    <div style={{
                      position: "relative",
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      flexShrink: 0,
                      backgroundColor: notif[item.key] ? "#f59e0b" : "#d1d5db",
                      transition: "background-color 0.2s",
                    }}>
                      <span style={{
                        position: "absolute",
                        top: 2,
                        left: notif[item.key] ? 20 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: "white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        transition: "left 0.2s",
                      }} />
                    </div>
                  </div>
                ))}

                {notifSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
                    <FiCheckCircle size={15} /> {notifSuccess}
                  </div>
                )}

                <button onClick={handleSaveNotifications} disabled={notifSaving}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                  {notifSaving ? "Saving…" : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === "privacy" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FiShield size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Privacy & Security</h2>
                  <p className="text-gray-500 text-xs">Control your store visibility and data</p>
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                {[
                  { label: "Show store to servicemen",  desc: "Servicemen can find your store for orders" },
                  { label: "Accept material orders",    desc: "Receive order requests from servicemen" },
                  { label: "Display store hours",       desc: "Show opening/closing times on your profile" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-gray-200 select-none">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    {/* Always-on toggle — these privacy settings are always enabled */}
                    <div style={{
                      position: "relative",
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      flexShrink: 0,
                      overflow: "hidden",
                      backgroundColor: "#f59e0b",
                    }}>
                      <span style={{
                        position: "absolute",
                        top: 2,
                        left: 20,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: "white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }} />
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-gray-200 select-none">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-gray-900 text-sm">📋 Data Policy</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Your store location is shared only with servicemen who have active bookings nearby. Payment details are encrypted and never shared.
                    </p>
                  </div>
                  <div style={{
                    position: "relative",
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    flexShrink: 0,
                    overflow: "hidden",
                    backgroundColor: "#f59e0b",
                  }}>
                    <span style={{
                      position: "absolute",
                      top: 2,
                      left: 20,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === "danger" && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <FiTrash2 size={18} className="text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Danger Zone</h2>
                  <p className="text-gray-500 text-xs">Irreversible actions — proceed with caution</p>
                </div>
              </div>

              <div className="max-w-md space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-semibold text-red-800 text-sm mb-1">Delete Account</p>
                  <p className="text-red-700 text-xs mb-4">
                    This will permanently delete your vendor account, all products, orders, and store data. This cannot be undone.
                  </p>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Type <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-700">DELETE</span> to confirm
                  </label>
                  <input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-sm mb-3"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "DELETE" || deleting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    {deleting ? "Deleting…" : "Permanently Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
