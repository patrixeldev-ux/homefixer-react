"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ShieldCheck,
  ShieldX,
  Trash2,
  Eye,
} from "lucide-react";

import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

interface UserType {
  id: number;
  name: string;
  email: string;
  phone: string;
  city?: string;

  role:
    | "CUSTOMER"
    | "SERVICEMAN"
    | "VENDOR";

  status:
    | "ACTIVE"
    | "INACTIVE";

  business_name?: string;

  skills?: string[] | string;

  created_at?: string;
}

const UsersPage = () => {

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const [users, setUsers] =
    useState<UserType[]>([]);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedUser, setSelectedUser] =
    useState<UserType | null>(
      null
    );

  const usersPerPage = 10;

  /*
    =====================================
    AUTH CHECK
    =====================================
  */

  useEffect(() => {

    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (!token) {

      router.push("/auth");

      return;
    }

    fetchUsers();

  }, []);

  /*
    =====================================
    HEADERS
    =====================================
  */

  const getHeaders = () => {

    const token =
      localStorage.getItem(
        "accessToken"
      );

    return token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {};
  };

  /*
    =====================================
    FETCH USERS
    =====================================
  */

  const fetchUsers =
    async () => {

      try {

        setLoading(true);

        const headers =
          getHeaders();

        const [
          customersRes,
          servicemenRes,
          vendorsRes,
        ] = await Promise.all([

          axios.get(
            `${API_BASE}/admin/customers/`,
            { headers }
          ),

          axios.get(
            `${API_BASE}/admin/servicemen/all/`,
            { headers }
          ),

          axios.get(
            `${API_BASE}/admin/vendors/all/`,
            { headers }
          ),
        ]);

        /*
          =========================
          CUSTOMERS
          =========================
        */

        const customers =
          customersRes.data.map(
            (user: any) => ({

              id: user.id,

              name:
                user.name ||
                user.full_name ||
                "Customer",

              email:
                user.email ||
                "No Email",

              phone:
                user.phone ||
                "No Phone",

              city:
                user.city ||
                "N/A",

              role: "CUSTOMER",

              status:
                user.is_active
                  ? "ACTIVE"
                  : "INACTIVE",

              created_at:
                user.created_at,
            })
          );

        /*
          =========================
          SERVICEMEN
          =========================
        */

        const servicemen =
          servicemenRes.data.map(
            (user: any) => ({

              id: user.id,

              name:
                user.name ||
                user.full_name ||
                "Serviceman",

              email:
                user.email ||
                "No Email",

              phone:
                user.phone ||
                "No Phone",

              city:
                user.city ||
                "N/A",

              role: "SERVICEMAN",

              status:
                user.is_active
                  ? "ACTIVE"
                  : "INACTIVE",

              skills:
                user.skills,

              created_at:
                user.created_at,
            })
          );

        /*
          =========================
          VENDORS
          =========================
        */

        const vendors =
          vendorsRes.data.map(
            (user: any) => ({

              id: user.id,

              name:
                user.owner_name ||
                user.name ||
                "Vendor",

              email:
                user.email ||
                "No Email",

              phone:
                user.phone ||
                "No Phone",

              city:
                user.city ||
                "N/A",

              role: "VENDOR",

              business_name:
                user.business_name,

              status:
                user.is_active
                  ? "ACTIVE"
                  : "INACTIVE",

              created_at:
                user.created_at,
            })
          );

        /*
          =========================
          COMBINE + SORT
          =========================
        */

        const combined = [
          ...customers,
          ...servicemen,
          ...vendors,
        ];

        combined.sort(
          (
            a: UserType,
            b: UserType
          ) =>
            new Date(
              b.created_at || ""
            ).getTime() -
            new Date(
              a.created_at || ""
            ).getTime()
        );

        setUsers(combined);

      } catch (err) {

        console.error(
          "FETCH USERS ERROR:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /*
    =====================================
    FILTER USERS
    =====================================
  */

  const filteredUsers =
    useMemo(() => {

      return users.filter(
        (user) => {

          const searchText = `
            ${user.name}
            ${user.email}
            ${user.phone}
            ${user.city}
            ${user.role}
            ${user.business_name || ""}
          `.toLowerCase();

          const matchesSearch =
            searchText.includes(
              search.toLowerCase()
            );

          const matchesRole =
            roleFilter === "ALL"
              ? true
              : user.role ===
                roleFilter;

          const matchesStatus =
            statusFilter === "ALL"
              ? true
              : user.status ===
                statusFilter;

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        }
      );

    }, [
      users,
      search,
      roleFilter,
      statusFilter,
    ]);

  /*
    =====================================
    PAGINATION
    =====================================
  */

  const totalPages =
    Math.ceil(
      filteredUsers.length /
        usersPerPage
    );

  const startIndex =
    (currentPage - 1) *
    usersPerPage;

  const currentUsers =
    filteredUsers.slice(
      startIndex,
      startIndex + usersPerPage
    );

  /*
    =====================================
    ROLE COLORS
    =====================================
  */

  const getRoleStyle = (
    role: string
  ) => {

    switch (role) {

      case "SERVICEMAN":
        return "bg-green-100 text-green-700";

      case "VENDOR":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  /*
    =====================================
    STATUS COLORS
    =====================================
  */

  const getStatusStyle = (
    status: string
  ) => {

    switch (status) {

      case "ACTIVE":
        return "bg-green-100 text-green-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };

  /*
    =====================================
    DELETE USER
    =====================================
  */

  const handleDelete =
    async (user: UserType) => {

      try {

        setActionLoading(user.id);

        const headers =
          getHeaders();

        if (
          user.role ===
          "SERVICEMAN"
        ) {

          await axios.delete(

            `${API_BASE}/admin/servicemen/${user.id}/control/`,

            { headers }
          );
        }

        else if (
          user.role === "VENDOR"
        ) {

          await axios.delete(

            `${API_BASE}/admin/vendors/${user.id}/control/`,

            { headers }
          );
        }

        else {

          await axios.delete(

            `${API_BASE}/admin/users/${user.id}/`,

            { headers }
          );
        }

        setUsers((prev) =>
          prev.filter(
            (u) => u.id !== user.id
          )
        );

        setSelectedUser(null);

      } catch (err) {

        console.error(
          "DELETE USER ERROR:",
          err
        );

      } finally {

        setActionLoading(null);
      }
    };

  /*
    =====================================
    TOGGLE STATUS
    =====================================
  */

  const toggleUserStatus =
    async (user: UserType) => {

      try {

        setActionLoading(user.id);

        const headers =
          getHeaders();

        if (
          user.role ===
            "SERVICEMAN" ||
          user.role === "VENDOR"
        ) {

          const endpoint =
            user.role ===
            "SERVICEMAN"

              ? `${API_BASE}/admin/servicemen/${user.id}/control/`

              : `${API_BASE}/admin/vendors/${user.id}/control/`;

          await axios.patch(

            endpoint,

            {
              is_active:
                user.status !==
                "ACTIVE",
            },

            { headers }
          );
        }

        else {

          await axios.patch(

            `${API_BASE}/admin/users/${user.id}/`,

            {
              is_active:
                user.status !==
                "ACTIVE",
            },

            { headers }
          );
        }

        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,

                  status:
                    u.status ===
                    "ACTIVE"

                      ? "INACTIVE"

                      : "ACTIVE",
                }
              : u
          )
        );

        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,

                status:
                  prev.status ===
                  "ACTIVE"

                    ? "INACTIVE"

                    : "ACTIVE",
              }
            : null
        );

      } catch (err) {

        console.error(
          "STATUS UPDATE ERROR:",
          err
        );

      } finally {

        setActionLoading(null);
      }
    };

  /*
    =====================================
    LOADING
    =====================================
  */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">

        <div className="flex flex-col items-center gap-4">

          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />

          <p className="text-black font-medium">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">

      {/* ================= HEADER ================= */}

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

          <div>

            <h1 className="text-4xl font-bold text-black">
              Users
            </h1>

            <p className="text-neutral-500 mt-2">
              Manage customers,
              vendors and servicemen
            </p>
          </div>

          {/* SEARCH + FILTERS */}

          <div className="flex flex-col lg:flex-row gap-3">

            {/* SEARCH */}

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 min-w-[280px]">

              <Search
                size={18}
                className="text-black"
              />

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="ml-3 w-full bg-transparent outline-none text-black placeholder:text-neutral-400"
              />
            </div>

            {/* ROLE FILTER */}

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3">

              <Filter
                size={18}
                className="text-black mr-2"
              />

              <select
                value={
                  roleFilter
                }
                onChange={(e) => {

                  setRoleFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="bg-transparent outline-none text-black font-medium"
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
            </div>

            {/* STATUS FILTER */}

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3">

              <select
                value={
                  statusFilter
                }
                onChange={(e) => {

                  setStatusFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="bg-transparent outline-none text-black font-medium"
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        {/* TABLE HEADER */}

        <div className="hidden lg:grid grid-cols-6 gap-4 bg-[#f8fafc] px-6 py-4 text-sm font-bold text-black border-b border-slate-200">

          <p>Name</p>

          <p>Email</p>

          <p>Phone</p>

          <p>Role</p>

          <p>Status</p>

          <p>Action</p>
        </div>

        {/* USERS */}

        {currentUsers.map(
          (user) => (

            <div
              key={user.id}
              className="grid grid-cols-1 lg:grid-cols-6 gap-4 px-6 py-5 border-b border-slate-100 hover:bg-slate-50 transition-all"
            >

              {/* NAME */}

              <div>

                <h3 className="font-semibold text-black">
                  {user.name}
                </h3>

                <p className="text-xs text-neutral-500 mt-1">
                  {user.city}
                </p>
              </div>

              {/* EMAIL */}

              <div>

                <p className="text-black break-all">
                  {user.email}
                </p>
              </div>

              {/* PHONE */}

              <div>

                <p className="text-black">
                  {user.phone}
                </p>
              </div>

              {/* ROLE */}

              <div>

                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${getRoleStyle(
                    user.role
                  )}`}
                >

                  {user.role}
                </span>
              </div>

              {/* STATUS */}

              <div>

                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${getStatusStyle(
                    user.status
                  )}`}
                >

                  {user.status}
                </span>
              </div>

              {/* ACTION */}

              <div>

                <button
                  onClick={() =>
                    setSelectedUser(
                      user
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all"
                >

                  <Eye size={16} />

                  View
                </button>
              </div>
            </div>
          )
        )}

        {/* EMPTY */}

        {currentUsers.length ===
          0 && (

          <div className="py-20 text-center">

            <p className="text-black text-lg">
              No users found
            </p>
          </div>
        )}
      </div>

      {/* ================= PAGINATION ================= */}

      {filteredUsers.length > 0 && (
        <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <p className="text-sm text-black">
            Showing{" "}
            <span className="font-bold">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold">
              {Math.min(
                startIndex + usersPerPage,
                filteredUsers.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-bold">
              {filteredUsers.length}
            </span>{" "}
            users
          </p>

          <div className="flex items-center gap-2 flex-wrap">

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(index + 1)
                  }
                  className={`w-10 h-10 rounded-2xl font-bold transition-all ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-[#f8fafc] text-black hover:bg-slate-200"
                  }`}
                >
                  {index + 1}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
                )
              }
              disabled={
                currentPage === totalPages
              }
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">

          <div className="bg-white w-full max-w-4xl rounded-3xl p-8 relative shadow-2xl">

            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedUser(null)
              }
              className="absolute top-5 right-5 bg-[#f8fafc] hover:bg-slate-200 w-10 h-10 rounded-xl transition-all"
            >
              ✕
            </button>

            {/* TITLE */}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-black">
                User Details
              </h2>

              <p className="text-neutral-500 mt-2">
                Complete user information
              </p>
            </div>

            {/* DETAILS */}

            <div className="grid md:grid-cols-2 gap-5">

              {/* NAME */}

              <div className="bg-white border border-slate-200 rounded-3xl p-5">

                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <User size={16} />
                  Name
                </div>

                <h3 className="font-semibold text-lg mt-3 text-black">
                  {selectedUser.name}
                </h3>
              </div>

              {/* EMAIL */}

              <div className="bg-white border border-slate-200 rounded-3xl p-5">

                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <Mail size={16} />
                  Email
                </div>

                <h3 className="font-semibold text-lg mt-3 text-black break-all">
                  {selectedUser.email}
                </h3>
              </div>

              {/* PHONE */}

              <div className="bg-white border border-slate-200 rounded-3xl p-5">

                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <Phone size={16} />
                  Phone
                </div>

                <h3 className="font-semibold text-lg mt-3 text-black">
                  {selectedUser.phone}
                </h3>
              </div>

              {/* ROLE */}

              <div className="bg-white border border-slate-200 rounded-3xl p-5">

                <p className="text-sm text-neutral-500">
                  Role
                </p>

                <div className="mt-3">
                  <span
                    className={`px-4 py-2 rounded-2xl text-sm font-bold ${getRoleStyle(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* CITY */}

              <div className="bg-white border border-slate-200 rounded-3xl p-5">

                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <MapPin size={16} />
                  City
                </div>

                <h3 className="font-semibold text-lg mt-3 text-black">
                  {selectedUser.city}
                </h3>
              </div>

              {/* STATUS */}

              <div className="bg-white border border-slate-200 rounded-3xl p-5">

                <p className="text-sm text-neutral-500">
                  Status
                </p>

                <div className="mt-3">
                  <span
                    className={`px-4 py-2 rounded-2xl text-sm font-bold ${getStatusStyle(
                      selectedUser.status
                    )}`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-4 mt-8">

              <button
                disabled={
                  actionLoading ===
                  selectedUser.id
                }
                onClick={() =>
                  toggleUserStatus(
                    selectedUser
                  )
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition-all ${
                  selectedUser.status ===
                  "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >

                {selectedUser.status ===
                "ACTIVE" ? (
                  <>
                    <ShieldX size={18} />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Activate
                  </>
                )}
              </button>

              <button
                disabled={
                  actionLoading ===
                  selectedUser.id
                }
                onClick={() =>
                  handleDelete(
                    selectedUser
                  )
                }
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white font-semibold transition-all"
              >
                <Trash2 size={18} />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;