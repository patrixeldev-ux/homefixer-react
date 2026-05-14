"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import api from "../../../lib/api";

/* ---------- TYPES ---------- */
type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "vendor" | "serviceman";
  city: string;
  address: string;
  totalBookings: number;
  status: "Active" | "Inactive";
  joinedAt: string;
};

/* ---------- PAGE ---------- */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState(""); // <-- search state

  /* ---------- FETCH USERS LIST ---------- */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/admin/users", { params: { per_page: 20 } });

      const rawUsers =
        Array.isArray(res.data?.data?.data)
          ? res.data.data.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const mappedUsers: User[] = rawUsers.map((user: any) => ({
        id: user.id,
        name: user.name || "-",
        email: user.email || "-",
        phone: user.phone || "-",
        role: user.role || "customer",
        city: user.city || "-",
        address: user.address || "-",
        totalBookings: user.total_bookings || 0,
        status: user.is_verified ? "Active" : "Inactive",
        joinedAt: user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-GB")
          : "-",
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FETCH USER BY ID ---------- */
  const fetchUserById = async (userId: number) => {
    setUserLoading(true);
    setUserError(null);
    setSelectedUser(null);

    try {
      const res = await api.get(`/admin/users/${userId}`);
      const user = res.data?.data ?? res.data;

      setSelectedUser({
        id: user.id,
        name: user.name || "-",
        email: user.email || "-",
        phone: user.phone || "-",
        role: user.role || "customer",
        city: user.city || "-",
        address: user.address || "-",
        totalBookings: user.total_bookings || 0,
        status: user.is_verified ? "Active" : "Inactive",
        joinedAt: user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-GB")
          : "-",
      });
    } catch (err) {
      setUserError("Failed to load user details.");
    } finally {
      setUserLoading(false);
    }
  };

  /* ---------- APPROVE USER ---------- */
  const approveUser = async (userId: number) => {
    if (!confirm("Approve this user?")) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/users/${userId}/approve`);
      fetchUsers();
      if (selectedUser?.id === userId) fetchUserById(userId);
    } catch (err) {
      alert("Failed to approve user");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- BAN USER ---------- */
  const banUser = async (userId: number) => {
    const reason = prompt("Reason for banning user:");
    if (!reason) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason });
      fetchUsers();
      if (selectedUser?.id === userId) fetchUserById(userId);
    } catch (err) {
      alert("Failed to ban user");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------- DATATABLE COLUMNS ---------- */
  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Role",
        selector: (row) => row.role,
        sortable: true,
        cell: (row) => <span className="capitalize">{row.role}</span>,
      },
      {
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        cell: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-xs ${
              row.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.status}
          </span>
        ),
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="flex gap-2">
            <button
              onClick={() => fetchUserById(row.id)}
              className="px-4 py-1 text-sm bg-gray-900 text-white rounded-full shadow hover:bg-gray-800 transition duration-200"
            >
              View
            </button>
            {row.status === "Inactive" && (
              <button
                disabled={actionLoading}
                onClick={() => approveUser(row.id)}
                className="px-5 py-1 text-sm bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition duration-200"
              >
                Approve
              </button>
            )}
            {row.status === "Active" && (
              <button
                disabled={actionLoading}
                onClick={() => banUser(row.id)}
                className="px-5 py-1 text-sm bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition duration-200"
              >
                Ban
              </button>
            )}
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
      },
    ],
    [actionLoading]
  );

  // ---------- FILTERED USERS FOR SEARCH ----------
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- CUSTOM STYLES FOR BORDERS ----------
  const customStyles = {
    table: {
      style: {
        border: "1px solid #e5e7eb", // gray border around table
      },
    },
    headRow: {
      style: {
        borderBottom: "1px solid #d1d5db", // bottom border for header
      },
    },
    rows: {
      style: {
        borderBottom: "1px solid #e5e7eb", // border between rows
      },
    },
    cells: {
      style: {
        borderRight: "1px solid #e5e7eb", // vertical border between cells
      },
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* ---------- HEADER ---------- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">Manage customers, vendors & servicemen</p>
      </div>

      {/* ---------- SEARCH INPUT ---------- */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ---------- DATATABLE ---------- */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredUsers}
            progressPending={loading}
            pagination
            highlightOnHover
            pointerOnHover
            responsive
            customStyles={customStyles}
          />
        </div>
      )}

      {/* ---------- MODAL ---------- */}
      {(userLoading || selectedUser) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            {userLoading ? (
              <p className="text-center">Loading...</p>
            ) : (
              selectedUser && (
                <>
                  <h2 className="text-xl font-bold mb-4">User Details</h2>
                  <p>
                    <b>Name:</b> {selectedUser.name}
                  </p>
                  <p>
                    <b>Email:</b> {selectedUser.email}
                  </p>
                  <p>
                    <b>Status:</b> {selectedUser.status}
                  </p>

                  <div className="mt-6 flex justify-end gap-2">
                    {selectedUser.status === "Inactive" && (
                      <button
                        onClick={() => approveUser(selectedUser.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition duration-200"
                      >
                        Approve
                      </button>
                    )}
                    {selectedUser.status === "Active" && (
                      <button
                        onClick={() => banUser(selectedUser.id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition duration-200"
                      >
                        Ban
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="px-6 py-2 bg-gray-800 text-white rounded-full shadow hover:bg-gray-900 transition duration-200"
                    >
                      Close
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
