"use client";

import { useEffect, useState } from "react";
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

  /* ---------- FETCH USERS LIST ---------- */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/api/admin/users", {
        params: { per_page: 20 },
      });

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
      const res = await api.get(`/api/admin/users/${userId}`);
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
      await api.post(`/api/admin/users/${userId}/approve`);
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
      await api.post(`/api/admin/users/${userId}/ban`, { reason });
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

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* ---------- HEADER ---------- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">
          Manage customers, vendors & servicemen
        </p>
      </div>

      {/* ---------- TABLE ---------- */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => fetchUserById(user.id)}
                      className="px-3 py-1 text-xs bg-gray-900 text-white rounded"
                    >
                      View
                    </button>

                    {user.status === "Inactive" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => approveUser(user.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                    )}

                    {user.status === "Active" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => banUser(user.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- MODAL ---------- */}
      {(userLoading || selectedUser) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            {userLoading ? (
              <p className="text-center">Loading...</p>
            ) : (
              selectedUser && (
                <>
                  <h2 className="text-xl font-bold mb-4">User Details</h2>
                  <p><b>Name:</b> {selectedUser.name}</p>
                  <p><b>Email:</b> {selectedUser.email}</p>
                  <p><b>Status:</b> {selectedUser.status}</p>

                  <div className="mt-6 flex justify-end gap-2">
                    {selectedUser.status === "Inactive" && (
                      <button
                        onClick={() => approveUser(selectedUser.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                    )}
                    {selectedUser.status === "Active" && (
                      <button
                        onClick={() => banUser(selectedUser.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        Ban
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="px-4 py-2 bg-gray-800 text-white rounded"
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
