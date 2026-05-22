"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  CheckCircle,
  Clock3,
  XCircle,
  User,
  ShieldCheck,
  Store,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

interface ApprovalRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;

  role:
    | "CUSTOMER"
    | "SERVICEMAN"
    | "VENDOR";

  status:
    | "APPROVED"
    | "REJECTED"
    | "PENDING";

  created_at?: string;

  skills?: string[] | string;
  experience_years?: number;

  business_name?: string;

  address?: string;

  is_approved?: boolean;
  is_active?: boolean;
}

export default function ApprovalPage() {

  const [requests, setRequests] =
    useState<ApprovalRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("ALL");
  
  const [statusFilter, setStatusFilter] =
    useState("PENDING");

  useEffect(() => {
    fetchRequests();
  }, []);

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const fetchRequests = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem("accessToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        servicemenRes,
        vendorsRes,
      ] = await Promise.all([
        axios.get(
          `${API_BASE}/admin/servicemen/pending/`,
          { headers }
        ),

        axios.get(
          `${API_BASE}/admin/vendors/pending/`,
          { headers }
        ),
      ]);

      const servicemen =
        servicemenRes.data.map((s: any) => ({
          ...s,
          role: "SERVICEMAN",
          status: s.is_active === false
            ? "REJECTED"
            : s.is_approved
            ? "APPROVED"
            : "PENDING",
        }));

      const vendors =
        vendorsRes.data.map((v: any) => ({
          ...v,
          role: "VENDOR",
          status: v.is_active === false
            ? "REJECTED"
            : v.is_approved
            ? "APPROVED"
            : "PENDING",
        }));

      const combined = [
        ...servicemen,
        ...vendors,
      ];
      
      combined.sort(
        (a, b) =>
          Number(b.id) - Number(a.id)
      );
      
      setRequests(combined);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  const updateApprovalStatus = async (
    request: ApprovalRequest,
    action: "approve" | "reject"
  ) => {

    try {

      const token =
        localStorage.getItem("accessToken");

      if (request.role === "CUSTOMER")
        return;

      const endpoint =
        request.role === "SERVICEMAN"
          ? `${API_BASE}/admin/servicemen/${request.id}/control/`
          : `${API_BASE}/admin/vendors/${request.id}/control/`;

      await axios.patch(
        endpoint,
        {
          is_approved:
            action === "approve",

          is_active:
            action === "approve",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((item) =>
          item.id === request.id &&
          item.role === request.role
            ? {
                ...item,
                status:
                  action === "approve"
                    ? "APPROVED"
                    : "REJECTED",
              }
            : item
        )
      );

    } catch (err) {

      console.error(err);
    }
  };

  const getRoleColor = (
    role: string
  ) => {

    switch (role) {

      case "VENDOR":
        return {
          card:
            "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400",

          badge:
            "bg-orange-600 text-white",
        };

      case "SERVICEMAN":
        return {
          card:
            "bg-gradient-to-br from-green-50 to-green-100 border-green-400",

          badge:
            "bg-green-600 text-white",
        };

      case "CUSTOMER":
        return {
          card:
            "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400",

          badge:
            "bg-blue-600 text-white",
        };

      default:
        return {
          card:
            "bg-white border-slate-300",

          badge:
            "bg-slate-600 text-white",
        };
    }
  };

  const getStatusBadge = (
    status: string
  ) => {

    switch (status) {

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const filteredRequests = useMemo(() => {

    return requests.filter((req) => {
  
      /*
        =========================
        SEARCH
        =========================
      */
  
      const searchText = `
        ${req.name || ""}
        ${req.email || ""}
        ${req.phone || ""}
        ${req.business_name || ""}
        ${req.role || ""}
        ${req.status || ""}
      `
        .toLowerCase();
  
      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );
  
      /*
        =========================
        ROLE FILTER
        =========================
      */
  
      const matchesRole =
        roleFilter === "ALL"
          ? true
          : req.role === roleFilter;
  
      /*
        =========================
        STATUS FILTER
        =========================
      */
  
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : req.status === statusFilter;
  
      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  
  }, [
    requests,
    search,
    roleFilter,
    statusFilter,
  ]);

  return (
    <div className="p-6 bg-[#f7f8fc] min-h-screen">

      <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-8 shadow-sm">

        <h1 className="text-4xl font-bold text-slate-900">
          Approval Management
        </h1>

        <p className="text-slate-500 mt-2">
          Manage vendors, servicemen and customer records
        </p>

        <div className="flex flex-col lg:flex-row gap-4 mt-6">

          <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-4 py-3 flex-1">

            <Search
              size={18}
              className="text-slate-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="bg-transparent outline-none w-full text-black"
              placeholder="Search requests..."
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-black"
          >

            <option value="ALL">
              All Roles
            </option>

            <option value="CUSTOMER">
              Customer
            </option>

            <option value="SERVICEMAN">
              Serviceman
            </option>

            <option value="VENDOR">
              Vendor
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-black"
          >

            <option value="ALL">
              All Status
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </div>
      </div>

      {loading ? (

        <div className="text-center py-20 text-slate-500">
          Loading...
        </div>

      ) : (

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {filteredRequests.length === 0 &&
                !loading && (
              
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              
                  <h3 className="text-2xl font-bold text-slate-800">
                    No Requests Found
                  </h3>
              
                  <p className="text-slate-500 mt-3">
                    Try changing filters
                  </p>
                </div>
              )}

          {filteredRequests.map((req) => (

            <div
              key={`${req.role}-${req.id}`}
              className={`${getRoleColor(req.role).card}
              border-2 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all`}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(req.role).badge}`}
                  >
                    {req.role}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(req.status)}`}
                  >
                    {req.status}
                  </span>
                </div>

                {req.role === "CUSTOMER" ? (
                  <User className="text-blue-700" />
                ) : req.role === "SERVICEMAN" ? (
                  <ShieldCheck className="text-green-700" />
                ) : (
                  <Store className="text-orange-700" />
                )}
              </div>

              <div className="mt-6">

                <h2 className="text-2xl font-bold text-slate-900">
                  {req.business_name || req.name}
                </h2>

                <p className="text-slate-600 mt-2">
                  {req.email}
                </p>

                <p className="text-slate-500 mt-1">
                  {req.phone}
                </p>

                {req.skills && (

                  <div className="mt-4 flex flex-wrap gap-2">

                    {(
                      Array.isArray(req.skills)
                        ? req.skills

                        : typeof req.skills === "string"

                        ? req.skills
                            .replace(/[\\[\\]']/g, "")
                            .split(",")
                            .map((s: string) =>
                              s.trim()
                            )

                        : []
                    ).map(
                      (
                        skill: string,
                        index: number
                      ) => (

                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                  )}
              </div>

              <div className="flex gap-3 mt-6">

                {req.role !== "CUSTOMER" ? (
                  <>
                    <button
                      onClick={() =>
                        updateApprovalStatus(
                          req,
                          "approve"
                        )
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold transition"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateApprovalStatus(
                          req,
                          "reject"
                        )
                      }
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-semibold transition"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold transition"
                  >
                    View Bookings
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}