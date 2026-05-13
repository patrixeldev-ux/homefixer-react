"use client";

import { useState } from "react";

/* ---------------- STATIC VENDOR DATA ---------------- */
interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

const staticVendors: Vendor[] = [
  {
    id: 1,
    name: "Dhruv Parekh",
    email: "dhruv@gmail.com",
    phone: "+91 9876543210",
    role: "vendor",
    created_at: "2026-01-10T12:00:00Z",
    avatar_url: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Sonal Patel",
    email: "sonal@gmail.com",
    phone: "+91 9876543211",
    role: "vendor",
    created_at: "2026-01-08T10:30:00Z",
    avatar_url: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Karan Mehta",
    email: "karan@gmail.com",
    phone: "+91 9876543212",
    role: "vendor",
    created_at: "2026-01-05T15:45:00Z",
    avatar_url: "https://randomuser.me/api/portraits/men/56.jpg",
  },
];

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>(staticVendors);

  const handleEdit = (id: number) => {
    alert(`Edit vendor with ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to ban this vendor?")) {
      setVendors(vendors.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {vendors.map((vendor) => (
        <div
          key={vendor.id}
          className="bg-white shadow rounded-lg p-4 flex flex-col items-start gap-2 hover:shadow-lg transition"
        >
          <img
            src={vendor.avatar_url || "/default-avatar.png"}
            alt={vendor.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <h3 className="font-semibold text-lg">{vendor.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 12h.01M12 12h.01M8 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z"
              />
            </svg>
            {vendor.email}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5h2l1 5h13l1-5h2M16 7v6m-8-6v6m-4 4h16v2H4v-2z"
              />
            </svg>
            {vendor.phone}
          </p>
          <p className="text-sm text-gray-400">
            Joined: {new Date(vendor.created_at).toLocaleDateString()}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleEdit(vendor.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(vendor.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Ban
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
