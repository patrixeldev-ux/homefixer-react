"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { FiArrowDownLeft, FiArrowUpRight, FiClock, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Wallet {
  balance: string | number;
  currency?: string;
}

interface WithdrawalRequest {
  id: number;
  amount: string;
  status: string;          // PENDING | APPROVED | REJECTED
  created_at: string;
  bank_account?: string;
  note?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

function fmt(amount: string | number) {
  const n = parseFloat(String(amount));
  return isNaN(n) ? "0.00" : n.toFixed(2);
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-2/5" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
      </div>
      <div className="h-4 w-16 bg-slate-200 rounded" />
    </div>
  );
}

// ─── Withdrawal modal ───────────────────────────────────────────────────────────

function WithdrawModal({
  balance,
  onClose,
  onSuccess,
}: {
  balance: string | number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount,      setAmount]      = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [note,        setNote]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  const maxAmt = parseFloat(String(balance));

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    if (amt > maxAmt) { setError(`Amount exceeds wallet balance ₹${fmt(balance)}.`); return; }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/wallet/withdrawal/request/", {
        amount: amt,
        bank_account: bankAccount || undefined,
        note: note || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      setError(e?.response?.data?.detail || e?.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Wallet</p>
              <h2 className="text-xl font-bold mt-0.5">Withdraw Funds</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
              <FiX size={15} />
            </button>
          </div>
          <p className="text-sm text-white/70 mt-3">Available: <span className="font-bold text-white">₹{fmt(balance)}</span></p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                max={maxAmt}
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Account <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              value={bankAccount}
              onChange={e => setBankAccount(e.target.value)}
              placeholder="Account number / UPI ID"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Note <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Reason for withdrawal"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={submitting}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting || !amount}
              className="flex-[2] py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                : "Submit Request"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function CustomerWalletPage() {
  const [wallet,       setWallet]       = useState<Wallet | null>(null);
  const [withdrawals,  setWithdrawals]  = useState<WithdrawalRequest[]>([]);
  const [loadingW,     setLoadingW]     = useState(true);
  const [loadingR,     setLoadingR]     = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");
  const [activeTab,    setActiveTab]    = useState<"overview" | "history">("overview");

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet/");
      // API may return { balance, currency } or { wallet: { balance } }
      const data = res.data;
      setWallet(data.wallet ?? data);
    } catch { /* ignore */ }
    finally { setLoadingW(false); }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get(`/wallet/withdrawal/request/`);
      const data = res.data;
      setWithdrawals(Array.isArray(data) ? data : data.results ?? []);
    } catch { /* ignore */ }
    finally { setLoadingR(false); }
  };

  useEffect(() => {
    fetchWallet();
    fetchWithdrawals();
  }, []);

  const balance    = wallet ? parseFloat(String(wallet.balance)) : 0;
  const pendingAmt = withdrawals
    .filter(w => w.status === "PENDING")
    .reduce((s, w) => s + parseFloat(w.amount), 0);

  const handleWithdrawSuccess = () => {
    setShowWithdraw(false);
    setSuccessMsg("Withdrawal request submitted! It will be reviewed within 1–2 business days.");
    setTimeout(() => setSuccessMsg(""), 5000);
    fetchWallet();
    fetchWithdrawals();
  };

  const tabs = [
    { key: "overview", label: "Overview"   },
    { key: "history",  label: "Withdrawals" },
  ] as const;

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 sm:p-8">

      {/* ── Page title ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Wallet</h1>
        <p className="text-slate-500 mt-1">Refunds from cancellations land here. Use your balance for future payments.</p>
      </div>

      {/* ── Success banner ── */}
      {successMsg && (
        <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-5 py-4 rounded-2xl">
          <FiCheckCircle size={16} className="flex-shrink-0 mt-0.5" />
          {successMsg}
        </div>
      )}

      {/* ── Balance card ── */}
      <div className="relative mb-6 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a2f5e 35%, #1d4ed8 70%, #3b82f6 100%)",
          boxShadow: "0 20px 60px rgba(29, 78, 216, 0.35), 0 4px 16px rgba(0,0,0,0.3)",
        }}>

        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
        {/* Sheen line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative px-8 pt-7 pb-6 text-white">

          {/* Top row: label + chip */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300/80 mb-1">
                Available Balance
              </p>
              {loadingW ? (
                <div className="h-11 w-44 bg-white/15 rounded-xl animate-pulse" />
              ) : (
                <p className="text-5xl font-black tracking-tight leading-none">
                  ₹<span>{fmt(balance)}</span>
                </p>
              )}
            </div>
            {/* Wallet chip icon */}
            <div className="w-12 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mt-1 flex-shrink-0">
              <div className="w-7 h-5 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/60 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-yellow-600/40" />
              </div>
            </div>
          </div>

          {/* Status line */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <p className="text-blue-200/90 text-xs font-medium">
              {pendingAmt > 0
                ? `₹${fmt(pendingAmt)} withdrawal pending`
                : "No pending withdrawals · refunds land here automatically"}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-5" />

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={balance <= 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm
                hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all active:scale-95 shadow-lg shadow-black/20"
            >
              <FiArrowUpRight size={14} />
              Withdraw
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/15
              text-white/90 font-semibold rounded-xl text-xs backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Refunds auto-credited
            </div>
          </div>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: "💳",
            label: "Available Balance",
            value: `₹${fmt(balance)}`,
            sub: "Ready to use",
            bg: "bg-blue-50 border-blue-100",
            val: "text-blue-700",
          },
          {
            icon: "⏳",
            label: "Pending Withdrawals",
            value: withdrawals.filter(w => w.status === "PENDING").length.toString(),
            sub: `₹${fmt(pendingAmt)} in queue`,
            bg: "bg-yellow-50 border-yellow-100",
            val: "text-yellow-700",
          },
          {
            icon: "✅",
            label: "Approved Withdrawals",
            value: withdrawals.filter(w => w.status === "APPROVED").length.toString(),
            sub: "Transferred to bank",
            bg: "bg-green-50 border-green-100",
            val: "text-green-700",
          },
        ].map(card => (
          <div key={card.label} className={`${card.bg} border rounded-2xl p-5 flex items-center gap-4`}>
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">
              {card.icon}
            </div>
            <div>
              <p className={`text-2xl font-bold ${card.val}`}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-slate-400">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === t.key
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* How it works */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4 text-lg">How Your Wallet Works</h2>
            <div className="space-y-4">
              {[
                {
                  icon: "🔄",
                  title: "Automatic Refunds",
                  desc: "When you cancel a booking, the advance payment is automatically credited to this wallet — no forms, no waiting.",
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  icon: "💸",
                  title: "Pay with Wallet",
                  desc: "At checkout, choose 'Pay from Wallet' instead of Razorpay. Your balance is deducted instantly — no card needed.",
                  color: "bg-green-50 text-green-600",
                },
                {
                  icon: "🏦",
                  title: "Withdraw Anytime",
                  desc: "Request a bank transfer at any time. Approved withdrawals are processed within 1–2 business days.",
                  color: "bg-purple-50 text-purple-600",
                },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 text-lg`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent withdrawals preview */}
          {!loadingR && withdrawals.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Requests</h2>
                <button onClick={() => setActiveTab("history")} className="text-xs text-blue-600 font-semibold hover:underline">
                  View all →
                </button>
              </div>
              {withdrawals.slice(0, 3).map(w => (
                <div key={w.id} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    w.status === "APPROVED" ? "bg-green-100 text-green-600" :
                    w.status === "REJECTED" ? "bg-red-100 text-red-600" :
                    "bg-yellow-100 text-yellow-600"
                  }`}>
                    {w.status === "APPROVED" ? <FiCheckCircle size={16} /> :
                     w.status === "REJECTED" ? <FiX size={16} /> :
                     <FiClock size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">Withdrawal Request #{w.id}</p>
                    <p className="text-slate-400 text-xs">
                      {new Date(w.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">₹{fmt(w.amount)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[w.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingR && withdrawals.length === 0 && balance <= 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="font-bold text-slate-700">No wallet activity yet</p>
              <p className="text-slate-400 text-sm mt-1">Refunds from cancelled bookings will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Withdrawals tab ── */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Withdrawal Requests</h2>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={balance <= 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition"
            >
              <FiArrowDownLeft size={13} />
              New Request
            </button>
          </div>

          {loadingR ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="font-bold text-slate-700">No withdrawal requests</p>
              <p className="text-slate-400 text-sm mt-1">Request a bank transfer anytime from your wallet balance.</p>
            </div>
          ) : (
            withdrawals.map(w => (
              <div key={w.id} className="flex items-start gap-4 px-6 py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  w.status === "APPROVED" ? "bg-green-100 text-green-600" :
                  w.status === "REJECTED" ? "bg-red-100 text-red-600" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {w.status === "APPROVED" ? <FiCheckCircle size={16} /> :
                   w.status === "REJECTED" ? <FiX size={16} /> :
                   <FiClock size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Request #{w.id}</p>
                      {w.bank_account && (
                        <p className="text-slate-500 text-xs mt-0.5">→ {w.bank_account}</p>
                      )}
                      {w.note && (
                        <p className="text-slate-400 text-xs mt-0.5 italic">"{w.note}"</p>
                      )}
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(w.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">₹{fmt(w.amount)}</p>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[w.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {w.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Withdraw modal ── */}
      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
}