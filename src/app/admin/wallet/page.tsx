"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, ArrowUpRight, Check, X, Filter, Search, RefreshCw } from "lucide-react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

type Status = "Approved" | "Pending" | "Rejected";

interface WithdrawalRequest {
  id: number;
  provider: string;   // user_name from API
  amount: number;
  date: string;       // created_at
  status: Status;
  bank: string;       // bank_details / account_number from API
}

// ── Map raw API shape → local interface ──────────────────────────────────────
function normalize(raw: any): WithdrawalRequest {
  return {
    id:       raw.id,
    provider: raw.user_name || raw.serviceman_name || raw.name || "Unknown",
    amount:   parseFloat(raw.amount ?? raw.requested_amount ?? 0),
    date:     raw.created_at
      ? new Date(raw.created_at).toLocaleDateString("en-IN", {
          day: "2-digit", month: "2-digit", year: "numeric",
        })
      : "—",
    status: capitalize(raw.status ?? "Pending") as Status,
    bank:
      raw.bank_details ||
      (raw.bank_name && raw.account_number
        ? `${raw.bank_name} ****${String(raw.account_number).slice(-4)}`
        : raw.account_number
        ? `****${String(raw.account_number).slice(-4)}`
        : "—"),
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const STATUS_STYLE: Record<Status, string> = {
  Pending:  "bg-orange-100 text-orange-600",
  Approved: "bg-green-100  text-green-700",
  Rejected: "bg-red-100    text-red-600",
};

const STATUS_LABEL: Record<Status, string> = {
  Pending:  "—",
  Approved: "Payment Processed",
  Rejected: "Request Denied",
};

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminWalletPage() {
  // ── All hooks MUST be declared before any conditional return ─────────────
  const [requests,     setRequests]     = useState<WithdrawalRequest[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error,        setError]        = useState("");
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/admin/withdrawals/`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
      setRequests(data.map(normalize));
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load withdrawal requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  // ── Approve / Reject ──────────────────────────────────────────────────────
  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      await axios.patch(
        `${API_BASE}/admin/withdrawals/${id}/action/`,
        { action },
        { headers: getHeaders() }
      );
      // Optimistic update so the UI responds immediately
      const newStatus: Status = action === "approve" ? "Approved" : "Rejected";
      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
      );
    } catch (err: any) {
      alert(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        `Failed to ${action} request.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalAmount    = requests.reduce((s, r) => s + r.amount, 0);
  const pendingAmount  = requests.filter(r => r.status === "Pending") .reduce((s, r) => s + r.amount, 0);
  const approvedAmount = requests.filter(r => r.status === "Approved").reduce((s, r) => s + r.amount, 0);
  const pendingCount   = requests.filter(r => r.status === "Pending").length;
  const approvedCount  = requests.filter(r => r.status === "Approved").length;

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return requests.filter(r => {
      const q = searchTerm.toLowerCase();
      const matchSearch  = r.provider.toLowerCase().includes(q) || r.bank.toLowerCase().includes(q);
      const matchStatus  = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total */}
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg">
          <div className="flex justify-between items-center mb-3 opacity-80">
            <span className="text-sm font-medium">Total Withdrawals</span>
            <Wallet size={20} />
          </div>
          <h2 className="text-4xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</h2>
          <div className="mt-4 flex items-center gap-1 text-xs bg-white/10 w-fit px-3 py-1 rounded-full">
            <ArrowUpRight size={12} />
            {requests.length} total requests
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-2">Pending Withdrawals</p>
          <h2 className="text-4xl font-bold text-orange-500">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </h2>
          <p className="text-xs text-slate-400 mt-3">
            {pendingCount} request{pendingCount !== 1 ? "s" : ""} awaiting approval
          </p>
        </div>

        {/* Paid */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-2">Total Paid</p>
          <h2 className="text-4xl font-bold text-green-600">
            ₹{approvedAmount.toLocaleString("en-IN")}
          </h2>
          <p className="text-xs text-slate-400 mt-3">
            {approvedCount} payment{approvedCount !== 1 ? "s" : ""} processed
          </p>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">Withdrawal Requests</h3>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search provider or bank…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-200 bg-white w-full sm:w-64"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-2xl px-4 py-2.5 bg-white">
              <Filter size={15} className="text-slate-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-slate-700"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchWithdrawals}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Bank Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">

                    {/* Provider */}
                    <td className="px-6 py-5 font-semibold text-slate-900">
                      {req.provider}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 text-slate-500">{req.date}</td>

                    {/* Bank */}
                    <td className="px-6 py-5 text-slate-500">{req.bank}</td>

                    {/* Amount */}
                    <td className="px-6 py-5 font-bold text-slate-900">
                      ₹{req.amount.toLocaleString("en-IN")}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[req.status]}`}>
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      {req.status === "Pending" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleAction(req.id, "approve")}
                            disabled={actionLoading === req.id}
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === req.id
                              ? <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin block" />
                              : <Check size={16} />
                            }
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "reject")}
                            disabled={actionLoading === req.id}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-center text-xs italic text-slate-400">
                          {STATUS_LABEL[req.status]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <Wallet size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-semibold">No withdrawal requests found</p>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm || statusFilter !== "All"
                ? "Try adjusting your search or filter"
                : "Requests will appear here when servicemen submit them"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}