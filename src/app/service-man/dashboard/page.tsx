"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGeolocated } from "react-geolocated";
import api from "../../../lib/api";

/* ================= TYPES ================= */

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface OverviewStat {
  label: string;
  value: number;
}

interface CustomerRequest {
  id: number;
  name: string;
  distance: string;
  service: string;
}

/* ================= HELPERS ================= */

function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

/* ================= PAGE ================= */

export default function ServiceManDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);

  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });

  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    avatar: "/assets/default-avatar.png",
  });

  /* ===== Dummy (replace later with API) ===== */

  const [overviewStats] = useState<OverviewStat[]>([
    { label: "Completed Today", value: 19 },
    { label: "Completed Weekly", value: 19 },
    { label: "Completed Monthly", value: 256 },
    { label: "Pending Requests", value: 21 },
  ]);

  const [customerRequests] = useState<CustomerRequest[]>([
    { id: 1, name: "Ajay Sharma", distance: "3 km", service: "Electrical Service" },
    { id: 2, name: "Vinod Patel", distance: "4 km", service: "AC Repairing" },
    { id: 3, name: "Ayush Patel", distance: "6 km", service: "Plumbing" },
    { id: 4, name: "Atul Shah", distance: "2 km", service: "AC Repairing" },
  ]);

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const userId = getUserIdFromToken();

    if (!userId) {
      router.replace("/service-man");
      return;
    }

    try {
      const res = await api.get(`/api/profile/serviceman/${userId}`);
      const userData = res.data.data.user;

      setUser({
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || "/assets/default-avatar.png",
      });
    } catch (error) {
      console.error("Profile fetch failed", error);
      router.replace("/service-man");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await api.post("/api/logout");
      localStorage.clear();
      router.replace("/service-man");
    } catch (error) {
      alert("Logout failed");
    } finally {
      setLoadingLogout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between bg-blue-600 text-white rounded-3xl p-10 mb-6 shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-20 h-20 rounded-full border-2 border-white"
          />
          <div>
            <p className="text-sm">Welcome</p>
            <h1 className="text-lg font-bold">{user.name}</h1>
            <p className="text-xs text-gray-100">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
        
        <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className={`px-5 py-2 rounded-lg text-sm font-medium ${
              loadingLogout
                ? "bg-gray-400"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loadingLogout ? "Logging out..." : "Logout"}
          </button>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-5 py-2 rounded-full text-sm font-medium ${
              isOnline ? "bg-green-500" : "bg-red-600"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
          <button
            onClick={() => {
              if (window.confirm("Do you want to share your current location?")) {
                getPosition();
                setLocationSharingEnabled(true);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              locationSharingEnabled ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            {locationSharingEnabled ? "Location Shared" : "Share Location"}
          </button>

          
        </div>
      </div>

      {/* ===== OVERVIEW ===== */}
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {overviewStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow text-center"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ===== CUSTOMER REQUESTS ===== */}
      <h2 className="text-xl font-bold mb-4">Customer Requests</h2>
      <div className="space-y-4">
        {customerRequests.map((req) => (
          <div
            key={req.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{req.name}</p>
              <p className="text-sm text-gray-500">Distance: {req.distance}</p>
              <p className="text-sm text-gray-500">
                Requested Service: {req.service}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Accept
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
