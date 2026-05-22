"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Wallet,
  IndianRupee,
  ArrowDownCircle,
  Clock3,
  CheckCircle2,
  XCircle,
  Landmark,
} from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

interface WalletData {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawn: number;
}

interface WithdrawalItem {
  id: string;
  amount: string;
  date: string;
  method: string;
  status: "Completed" | "Pending" | "Rejected";
}

const Withdrawal: React.FC = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const adminToken = localStorage.getItem("adminToken");
      
      if (!adminToken) {
        router.push("/auth");
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
  
  const [withdrawAmount, setWithdrawAmount] =
    useState<string>("");

  const wallet: WalletData = {
    totalBalance: 48500,
    availableBalance: 32000,
    pendingBalance: 8500,
    withdrawn: 15000,
  };

  const withdrawals: WithdrawalItem[] = [
    {
      id: "WD001",
      amount: "₹5,000",
      date: "10 May 2026",
      method: "Bank Transfer",
      status: "Completed",
    },
    {
      id: "WD002",
      amount: "₹2,500",
      date: "07 May 2026",
      method: "UPI",
      status: "Pending",
    },
    {
      id: "WD003",
      amount: "₹8,000",
      date: "03 May 2026",
      method: "Bank Transfer",
      status: "Rejected",
    },
  ];

  const totalWithdrawals = useMemo(() => {
    return withdrawals.length;
  }, [withdrawals]);

  const handleWithdraw = (): void => {
    if (!withdrawAmount.trim()) {
      alert("Please enter withdrawal amount");
      return;
    }

    alert(
      `₹${withdrawAmount} withdrawal request submitted`
    );

    setWithdrawAmount("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Withdrawal Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your wallet balance and
            withdrawal requests.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <Wallet
            size={32}
            className="text-green-600"
          />
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Earnings */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Total Earnings
              </p>

              <h2 className="text-4xl font-bold mt-3 text-gray-900">
                ₹{wallet.totalBalance}
              </h2>
            </div>

            <div className="bg-blue-100 p-5 rounded-3xl">
              <IndianRupee className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Available */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Available Balance
              </p>

              <h2 className="text-4xl font-bold mt-3 text-green-600">
                ₹{wallet.availableBalance}
              </h2>
            </div>

            <div className="bg-green-100 p-5 rounded-3xl">
              <Wallet className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Pending Amount
              </p>

              <h2 className="text-4xl font-bold mt-3 text-orange-500">
                ₹{wallet.pendingBalance}
              </h2>
            </div>

            <div className="bg-orange-100 p-5 rounded-3xl">
              <Clock3 className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Withdrawn */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Withdrawn
              </p>

              <h2 className="text-4xl font-bold mt-3 text-purple-600">
                ₹{wallet.withdrawn}
              </h2>
            </div>

            <div className="bg-purple-100 p-5 rounded-3xl">
              <ArrowDownCircle className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= WITHDRAW SECTION ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Withdraw Card */}
        <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Withdraw Money
            </h2>

            <p className="text-gray-500 mt-1">
              Request withdrawal directly to
              your bank account.
            </p>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold text-gray-700 mb-3">
              Enter Amount
            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50">
              <IndianRupee className="text-gray-700" />

              <input
                type="number"
                placeholder="Enter withdrawal amount"
                value={withdrawAmount}
                onChange={(
                  e: React.ChangeEvent<HTMLInputElement>
                ) =>
                  setWithdrawAmount(
                    e.target.value
                  )
                }
                className="w-full bg-transparent outline-none ml-3 text-gray-700 font-semibold"
              />
            </div>
          </div>

          {/* Quick Amount */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[1000, 2000, 5000, 10000].map(
              (amount) => (
                <button
                  key={amount}
                  onClick={() =>
                    setWithdrawAmount(
                      amount.toString()
                    )
                  }
                  className="bg-blue-100 text-blue-600 transition-all px-5 py-3 rounded-2xl font-semibold"
                >
                  ₹{amount}
                </button>
              )
            )}
          </div>

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            className="w-full bg-green-600 hover:bg-green-700 transition-all text-white py-5 rounded-2xl font-bold text-lg"
          >
            Withdraw Now
          </button>
        </div>

        {/* ================= BANK DETAILS ================= */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Landmark className="text-blue-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Bank Details
              </h2>

              <p className="text-gray-500 text-sm">
                Linked account
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-400">
                Account Holder
              </p>

              <h3 className="font-semibold text-gray-900 mt-1">
                Rahul Sharma
              </h3>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Bank Name
              </p>

              <h3 className="font-semibold text-gray-900 mt-1">
                State Bank of India
              </h3>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Account Number
              </p>

              <h3 className="font-semibold text-gray-900 mt-1">
                XXXX XXXX 4589
              </h3>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                IFSC Code
              </p>

              <h3 className="font-semibold text-gray-900 mt-1">
                SBIN0004589
              </h3>
            </div>
          </div>

          <button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 transition-all text-white py-4 rounded-2xl font-semibold">
            Update Bank Details
          </button>
        </div>
      </div>

      {/* ================= HISTORY ================= */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Withdrawal History
            </h2>

            <p className="text-gray-500 mt-1">
              Track all your previous
              withdrawals.
            </p>
          </div>

          <div className="bg-gray-100 px-5 py-3 rounded-2xl text-sm font-semibold text-gray-700">
            Total Transactions:{" "}
            {totalWithdrawals}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-5 gap-4 px-4 py-4 bg-gray-100 rounded-2xl text-sm font-semibold text-gray-600 mb-4">
          <p>Transaction ID</p>
          <p>Date</p>
          <p>Method</p>
          <p>Amount</p>
          <p>Status</p>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {withdrawals.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 transition-all"
            >
              {/* ID */}
              <div>
                <p className="text-xs text-gray-400 lg:hidden">
                  Transaction ID
                </p>

                <h3 className="font-semibold text-gray-900">
                  {item.id}
                </h3>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs text-gray-400 lg:hidden">
                  Date
                </p>

                <h3 className="font-medium text-gray-700">
                  {item.date}
                </h3>
              </div>

              {/* Method */}
              <div>
                <p className="text-xs text-gray-400 lg:hidden">
                  Method
                </p>

                <h3 className="font-medium text-gray-700">
                  {item.method}
                </h3>
              </div>

              {/* Amount */}
              <div>
                <p className="text-xs text-gray-400 lg:hidden">
                  Amount
                </p>

                <h3 className="font-bold text-blue-600">
                  {item.amount}
                </h3>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 w-fit ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : item.status === "Pending"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.status ===
                    "Completed" && (
                    <CheckCircle2 size={16} />
                  )}

                  {item.status === "Pending" && (
                    <Clock3 size={16} />
                  )}

                  {item.status ===
                    "Rejected" && (
                    <XCircle size={16} />
                  )}

                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;