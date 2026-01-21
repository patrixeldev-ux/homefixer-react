"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import api from "../../../lib/api";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface Service {
  id: number;
  name: string;
  base_price: number;
}

interface ServiceManProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  joinDate: string;
  experience_years: number;
  skills: string[];
  hourly_rate: number;
  bio: string;
  services: Service[];
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

export default function ServiceManProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"personal" | "professional">("personal");
  const [profile, setProfile] = useState<ServiceManProfile | null>(null);

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async (): Promise<void> => {
    try {
      const userId = getUserIdFromToken();

      if (!userId) {
        router.push("/login");
        return;
      }

      const res = await api.get(`/api/profile/serviceman/${userId}`);

      const user = res.data.data.user;
      const profileData = res.data.data.profile;

      setProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || "/assets/default-avatar.png",
        address: profileData.address ?? "",
        joinDate: profileData.join_date ?? "",
        experience_years: profileData.experience_years ?? 0,
        skills: profileData.skills ?? [],
        hourly_rate: profileData.hourly_rate ?? 0,
        bio: profileData.bio ?? "",
        services: res.data.data.services ?? [],
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async (): Promise<void> => {
    if (!profile) return;

    try {
      await api.put("/api/profile/serviceman", {
        experience_years: profile.experience_years,
        hourly_rate: profile.hourly_rate,
        skills: profile.skills,
        bio: profile.bio,
        address: profile.address,
      });

      setEditing(false);
      fetchProfile();
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile");
    }
  };

  const updateField = <K extends keyof ServiceManProfile>(
    key: K,
    value: ServiceManProfile[K]
  ) => {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full border"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-blue-600">Joined: {profile.joinDate}</p>

            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p>Email: {profile.email}</p>
              <p>Phone: {profile.phone}</p>
              <p className="font-semibold text-green-600">
                ₹ {profile.hourly_rate}/hr
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setTab("personal")}
            className={`px-5 py-2 rounded-lg font-medium ${
              tab === "personal"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setTab("professional")}
            className={`px-5 py-2 rounded-lg font-medium ${
              tab === "professional"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Professional Info
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-8">
          {tab === "personal" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Name" value={profile.name} disabled />
              <Input label="Email" value={profile.email} disabled />
              <Input label="Phone" value={profile.phone} disabled />

              <Input
                label="Address"
                value={profile.address}
                disabled={!editing}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField("address", e.target.value)
                }
              />

              <Textarea
                label="Bio"
                value={profile.bio}
                disabled={!editing}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  updateField("bio", e.target.value)
                }
              />
            </div>
          )}

          {tab === "professional" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Experience (Years)"
                type="number"
                value={profile.experience_years}
                disabled={!editing}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField("experience_years", Number(e.target.value))
                }
              />

              <Input
                label="Hourly Rate"
                type="number"
                value={profile.hourly_rate}
                disabled={!editing}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField("hourly_rate", Number(e.target.value))
                }
              />
            </div>
          )}
        </div>

        {editing && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

/* ================= UI COMPONENTS ================= */

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100"
      />
    </div>
  );
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="md:col-span-2">
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        {...props}
        rows={4}
        className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100"
      />
    </div>
  );
}
