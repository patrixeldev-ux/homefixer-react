"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock3,
  Search,
  Filter,
  BadgeCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

interface RequestType {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "Customer" | "Vendor" | "Service Man";
  city: string;
  service: string;
  experience: string;
  amount: string;
  status: "Pending" | "Approved" | "Rejected";
}

type PageType =
  | "approval"
  | "users"
  | "money";

const Adminapproval: React.FC = () => {
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
            Loading ...
          </div>
        </div>
      );
    }
  
  const [pageType, setPageType] =
    useState<PageType>("approval");

  const [roleFilter, setRoleFilter] =
    useState<string>("All");

  const [statusFilter, setStatusFilter] =
    useState<string>("Pending");

  const [searchTerm, setSearchTerm] =
    useState<string>("");

  const [requests, setRequests] = useState<
    RequestType[]
  >([
    {
      id: 101,
      name: "Sunil Sharma",
      email: "sunil@gmail.com",
      phone: "+91 9876543210",
      role: "Service Man",
      city: "Ahmedabad",
      service: "AC Repair",
      experience: "4 Years",
      amount: "₹12,000",
      status: "Pending",
    },

    {
      id: 102,
      name: "Meera Patel",
      email: "meera@gmail.com",
      phone: "+91 9988776655",
      role: "Vendor",
      city: "Surat",
      service: "Home Cleaning Products",
      experience: "2 Years",
      amount: "₹18,000",
      status: "Approved",
    },

    {
      id: 103,
      name: "Jayesh Verma",
      email: "jayesh@gmail.com",
      phone: "+91 9090909090",
      role: "Service Man",
      city: "Vadodara",
      service: "Electrician",
      experience: "5 Years",
      amount: "₹9,500",
      status: "Rejected",
    },

    {
      id: 104,
      name: "Priya Shah",
      email: "priya@gmail.com",
      phone: "+91 8888888888",
      role: "Vendor",
      city: "Rajkot",
      service: "Plumbing",
      experience: "3 Years",
      amount: "₹1,000",
      status: "Approved",
    },
  ]);

  // ================= APPROVE =================
  const approveUser = (id: number): void => {
    const updatedRequests = requests.map((user) =>
      user.id === id
        ? {
            ...user,
            status: "Approved",
          }
        : user
    ) as RequestType[];

    setRequests(updatedRequests);
  };

  // ================= REJECT =================
  const rejectUser = (id: number): void => {
    const updatedRequests = requests.map((user) =>
      user.id === id
        ? {
            ...user,
            status: "Rejected",
          }
        : user
    ) as RequestType[];

    setRequests(updatedRequests);
  };

  // ================= FILTER =================
  const filteredRequests = useMemo(() => {
    return requests.filter((user) => {
      const matchesSearch =
        user.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        user.email
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      if (pageType === "approval") {
        const matchesRole =
          roleFilter === "All" ||
          user.role === roleFilter;

        const matchesStatus =
          statusFilter === "All" ||
          user.status === statusFilter;

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus &&
          (user.role === "Service Man" ||
            user.role === "Vendor")
        );
      }

      if (pageType === "users") {
        const matchesRole =
          roleFilter === "All" ||
          user.role === roleFilter;

        return (
          matchesSearch && matchesRole
        );
      }

      if (pageType === "money") {
        const matchesRole =
          roleFilter === "All" ||
          user.role === roleFilter;

        const matchesStatus =
          statusFilter === "All" ||
          user.status === statusFilter;

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus &&
          (user.role === "Service Man" ||
            user.role === "Vendor")
        );
      }

      return true;
    });
  }, [
    requests,
    pageType,
    roleFilter,
    statusFilter,
    searchTerm,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage approvals, users and
            money requests.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setPageType("approval");
              setRoleFilter("All");
              setStatusFilter("Pending");
            }}
            className={`px-5 py-3 rounded-2xl font-semibold transition-all ${
              pageType === "approval"
                ? "bg-black text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            Pending Approval
          </button>

          <button
            onClick={() => {
              setPageType("users");
              setRoleFilter("All");
              setStatusFilter("All");
            }}
            className={`px-5 py-3 rounded-2xl font-semibold transition-all ${
              pageType === "users"
                ? "bg-black text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            Manage Users
          </button>

          <button
            onClick={() => {
              setPageType("money");
              setRoleFilter("All");
              setStatusFilter("Pending");
            }}
            className={`px-5 py-3 rounded-2xl font-semibold transition-all ${
              pageType === "money"
                ? "bg-black text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            Approval Money
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 w-full shadow-sm">
          <Search
            size={18}
            className="text-gray-700"
          />

          <input
            type="text"
            placeholder="Search user..."
            className="w-full ml-3 outline-none text-gray-700"
            value={searchTerm}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement>
            ) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <Filter
            size={18}
            className="text-gray-700 mr-2"
          />

          <select
            value={roleFilter}
            onChange={(
              e: React.ChangeEvent<HTMLSelectElement>
            ) =>
              setRoleFilter(e.target.value)
            }
            className="outline-none bg-transparent text-gray-700 text-sm font-medium"
          >
            <option value="All">
              All Roles
            </option>

            {(pageType === "approval" ||
              pageType === "money") && (
              <>
                <option value="Service Man">
                  Service Man
                </option>

                <option value="Vendor">
                  Vendor
                </option>
              </>
            )}

            {pageType === "users" && (
              <>
                <option value="Customer">
                  Customer
                </option>

                <option value="Service Man">
                  Service Man
                </option>

                <option value="Vendor">
                  Vendor
                </option>
              </>
            )}
          </select>
        </div>

        {/* Status Filter */}
        {(pageType === "approval" ||
          pageType === "money") && (
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
            <Clock3
              size={18}
              className="text-gray-700 mr-2"
            />

            <select
              value={statusFilter}
              onChange={(
                e: React.ChangeEvent<HTMLSelectElement>
              ) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="outline-none bg-transparent text-gray-700 text-sm font-medium"
            >
              <option value="All">
                All Status
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
        )}
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {/* Total */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                Total Users
              </p>

              <h2 className="text-3xl text-gray-700 font-bold mt-2">
                {requests.length}
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Users className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                Approved
              </p>

              <h2 className="text-3xl text-gray-700 font-bold mt-2">
                {
                  requests.filter(
                    (u) =>
                      u.status ===
                      "Approved"
                  ).length
                }
              </h2>
            </div>

            <div className="bg-green-100 p-4 rounded-2xl">
              <CheckCircle className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                Pending
              </p>

              <h2 className="text-3xl text-gray-700 font-bold mt-2">
                {
                  requests.filter(
                    (u) =>
                      u.status ===
                      "Pending"
                  ).length
                }
              </h2>
            </div>

            <div className="bg-yellow-100 p-4 rounded-2xl">
              <Clock3 className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                Rejected
              </p>

              <h2 className="text-3xl text-gray-700 font-bold mt-2">
                {
                  requests.filter(
                    (u) =>
                      u.status ===
                      "Rejected"
                  ).length
                }
              </h2>
            </div>

            <div className="bg-red-100 p-4 rounded-2xl">
              <XCircle className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid gap-6">
        {filteredRequests.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6"
          >
            <div className="flex flex-col xl:flex-row xl:justify-between gap-6">
              {/* Left */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-5">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-xs font-bold">
                    ID {user.id}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      user.role === "Vendor"
                        ? "bg-orange-100 text-orange-600"
                        : user.role ===
                          "Customer"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {user.role}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      user.status ===
                      "Approved"
                        ? "bg-green-100 text-green-600"
                        : user.status ===
                          "Rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>

                <p className="text-gray-500 mt-1">
                  {user.email}
                </p>

                <div className="grid md:grid-cols-2 gap-5 mt-6">
                  <div>
                    <p className="text-sm text-gray-400">
                      Phone
                    </p>

                    <p className="font-semibold text-gray-700">
                      {user.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      City
                    </p>

                    <p className="font-semibold text-gray-700">
                      {user.city}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Service
                    </p>

                    <p className="font-semibold text-gray-700">
                      {user.service}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Experience
                    </p>

                    <p className="font-semibold text-gray-700">
                      {user.experience}
                    </p>
                  </div>

                  {pageType === "money" && (
                    <div>
                      <p className="text-sm text-gray-400">
                        Request Amount
                      </p>

                      <p className="font-bold text-green-600">
                        {user.amount}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {(pageType === "approval" ||
                pageType === "money") && (
                <div className="flex flex-col sm:flex-row xl:flex-col gap-4 min-w-[220px]">
                  {/* Approve */}
                  <button
                    onClick={() =>
                      approveUser(user.id)
                    }
                    disabled={
                      user.status ===
                      "Approved"
                    }
                    className={`py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      user.status ===
                      "Approved"
                        ? "bg-green-100 text-green-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <BadgeCheck size={18} />

                    {user.status ===
                    "Approved"
                      ? "Approved"
                      : "Approve"}
                  </button>

                  {/* Reject */}
                  <button
                    onClick={() =>
                      rejectUser(user.id)
                    }
                    disabled={
                      user.status ===
                      "Rejected"
                    }
                    className={`py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      user.status ===
                      "Rejected"
                        ? "bg-red-100 text-red-600 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    <XCircle size={18} />

                    {user.status ===
                    "Rejected"
                      ? "Rejected"
                      : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <Wallet
              size={50}
              className="mx-auto text-gray-300 mb-4"
            />

            <p className="text-gray-400 text-lg">
              No data found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Adminapproval;