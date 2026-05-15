"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  Check,
  X,
  Filter,
  Search,
} from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

interface WithdrawalRequest {
  id: number;
  provider: string;
  amount: number;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
  bank: string;
}

const Adminwallet: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const adminToken = localStorage.getItem("adminToken");
      
      if (!adminToken) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
  
    }, [router]);
  
      if (loading) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-2xl font-bold text-blue-600">
            Loading...
          </div>
        </div>
      );
    }
  
  const [searchTerm, setSearchTerm] =
    useState<string>("");

  const [statusFilter, setStatusFilter] =
    useState<string>("All");

  const [requests, setRequests] = useState<
    WithdrawalRequest[]
  >([
    {
      id: 1,
      provider: "Rahul Sharma",
      amount: 1500,
      date: "10/04/2026",
      status: "Approved",
      bank: "Axis ****5858",
    },
    {
      id: 2,
      provider: "Priyanshi Mehta",
      amount: 1200,
      date: "12/04/2026",
      status: "Pending",
      bank: "IDFC ****5558",
    },
    {
      id: 3,
      provider: "Amit Patel",
      amount: 1600,
      date: "15/04/2026",
      status: "Rejected",
      bank: "IDBI ****5808",
    },
    {
      id: 4,
      provider: "Sneha Sharma",
      amount: 2000,
      date: "18/04/2026",
      status: "Approved",
      bank: "HDFC ****0858",
    },
  ]);

  // ================= HANDLE STATUS =================
  const handleAction = (
    id: number,
    newStatus: "Approved" | "Rejected"
  ): void => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: newStatus,
            }
          : req
      )
    );
  };

  // ================= FILTERED DATA =================
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.provider
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        req.bank
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "All" ||
        req.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    requests,
    searchTerm,
    statusFilter,
  ]);

  // ================= STATS =================
  const totalAmount = requests.reduce(
    (acc, req) => acc + req.amount,
    0
  );

  const pendingAmount = requests
    .filter(
      (req) => req.status === "Pending"
    )
    .reduce(
      (acc, req) => acc + req.amount,
      0
    );

  const approvedAmount = requests
    .filter(
      (req) => req.status === "Approved"
    )
    .reduce(
      (acc, req) => acc + req.amount,
      0
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Wallet
        </h1>

        <p className="text-gray-500 mt-2">
          Approve or reject withdrawal
          requests from service providers.
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total */}
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg">
          <div className="flex justify-between items-center opacity-80 mb-3">
            <span className="font-medium">
              Total Withdrawals
            </span>

            <Wallet size={22} />
          </div>

          <h2 className="text-4xl font-bold">
            ₹{totalAmount.toLocaleString()}
          </h2>

          <div className="mt-5 flex items-center text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
            <ArrowUpRight
              size={14}
              className="mr-1"
            />
            +5% from last month
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-2">
            Pending Withdrawal
          </p>

          <h2 className="text-4xl font-bold text-orange-500">
            ₹
            {pendingAmount.toLocaleString()}
          </h2>

          <p className="text-xs text-gray-400 mt-3">
            {
              requests.filter(
                (r) =>
                  r.status === "Pending"
              ).length
            }{" "}
            requests waiting for approval
          </p>
        </div>

        {/* Paid */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-2">
            Total Paid
          </p>

          <h2 className="text-4xl font-bold text-green-600">
            ₹
            {approvedAmount.toLocaleString()}
          </h2>

          <p className="text-xs text-gray-400 mt-3">
            {
              requests.filter(
                (r) =>
                  r.status === "Approved"
              ).length
            }{" "}
            payments processed
          </p>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top */}
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-800">
            Withdrawal Requests
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                size={16}
              />

              <input
                type="text"
                placeholder="Search provider..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200 w-full"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-3">
              <Filter
                size={18}
                className="text-gray-500"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="bg-transparent outline-none text-sm font-medium text-gray-700"
              >
                <option value="All">
                  All
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">
                  Provider
                </th>

                <th className="px-6 py-4">
                  Date
                </th>

                <th className="px-6 py-4">
                  Bank Details
                </th>

                <th className="px-6 py-4">
                  Amount
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredRequests.map(
                (req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 transition-all"
                  >
                    {/* Provider */}
                    <td className="px-6 py-5 font-semibold text-gray-800">
                      {req.provider}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 text-gray-600">
                      {req.date}
                    </td>

                    {/* Bank */}
                    <td className="px-6 py-5 text-gray-600">
                      {req.bank}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5 font-bold text-gray-900">
                      ₹{req.amount}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          req.status ===
                          "Pending"
                            ? "bg-orange-100 text-orange-600"
                            : req.status ===
                              "Approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      {req.status ===
                      "Pending" ? (
                        <div className="flex justify-center gap-3">
                          {/* Approve */}
                          <button
                            onClick={() =>
                              handleAction(
                                req.id,
                                "Approved"
                              )
                            }
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all"
                            title="Approve"
                          >
                            <Check
                              size={18}
                            />
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() =>
                              handleAction(
                                req.id,
                                "Rejected"
                              )
                            }
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                            title="Reject"
                          >
                            <X
                              size={18}
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs italic text-gray-400">
                          {req.status ===
                          "Approved"
                            ? "Payment Processed"
                            : "Request Denied"}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredRequests.length ===
          0 && (
          <div className="py-16 text-center">
            <Wallet
              size={45}
              className="mx-auto text-gray-300 mb-4"
            />

            <p className="text-gray-400 text-lg">
              No withdrawal requests found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Adminwallet;