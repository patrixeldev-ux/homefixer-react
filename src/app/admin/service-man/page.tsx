"use client";

import { useState } from "react";

/* ---------------- STATIC SERVICEMEN DATA ---------------- */
interface ServiceMan {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

const staticServiceMen: ServiceMan[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@gmail.com",
    phone: "+91 9123456780",
    role: "servicemen",
    created_at: "2026-01-03T09:30:00Z",
    avatar_url: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@gmail.com",
    phone: "+91 9123456781",
    role: "servicemen",
    created_at: "2026-01-06T14:15:00Z",
    avatar_url: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: 3,
    name: "Amit Shah",
    email: "amit@gmail.com",
    phone: "+91 9123456782",
    role: "servicemen",
    created_at: "2026-01-09T11:00:00Z",
    avatar_url: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

export default function ServiceManPage() {
  const [serviceMen, setServiceMen] = useState<ServiceMan[]>(staticServiceMen);

  const handleEdit = (id: number) => {
    alert(`Edit serviceman with ID: ${id}`);
  };

  const handleBan = (id: number) => {
    if (confirm("Are you sure you want to ban this serviceman?")) {
      setServiceMen(serviceMen.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {serviceMen.map((sm) => (
        <div
          key={sm.id}
          className="bg-white shadow rounded-lg p-4 flex flex-col items-start gap-2 hover:shadow-lg transition"
        >
          <img
            src={sm.avatar_url || "/default-avatar.png"}
            alt={sm.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <h3 className="font-semibold text-lg">{sm.name}</h3>
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
            {sm.email}
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
            {sm.phone}
          </p>
          <p className="text-sm text-gray-400">
            Joined: {new Date(sm.created_at).toLocaleDateString()}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleEdit(sm.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleBan(sm.id)}
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
