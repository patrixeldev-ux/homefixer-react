"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import api from "../../../lib/api";
import { FiEdit } from "react-icons/fi";

interface VendorProfile {
  vendorPhoto?: string;
  shopName?: string;
  gstNumber?: string;
  contactNo?: string;
  email?: string;
  storeTiming?: string;
  cityState?: string;
  address?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState<number | null>(null);

  /* =========================
     GET userId FROM LOCAL STORAGE
  ========================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.id);
    } else {
      setError("Vendor not logged in");
      setLoading(false);
    }
  }, []);

  /* =========================
     FETCH VENDOR PROFILE
  ========================== */
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    api
      .get(`/api/profile/vendor/${userId}`)
      .then((res) => {
        const { user, profile } = res.data.data;

        setProfile({
          vendorPhoto: user.vendor_photo || "https://ui-avatars.com/api/?name=Vendor",
          shopName: profile.business_name,
          gstNumber: profile.gst_number,
          contactNo: user.phone,
          email: user.email,
          storeTiming: profile.opening_hours,
          cityState: profile.city_state,
          address: profile.store_address,
          accountHolderName: profile.account_holder_name,
          bankName: profile.bank_name,
          accountNumber: profile.account_number,
          ifscCode: profile.ifsc_code,
          upiId: profile.upi_id,
        });
      })
      .catch((err) => {
        console.error("PROFILE API ERROR:", err.response?.data || err.message);
        setError("Failed to load vendor profile");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!profile) return;

    setLoading(true);
    api
      .put("/api/profile/vendor", {
        business_name: profile.shopName,
        gst_number: profile.gstNumber,
        store_address: profile.address,
        opening_hours: profile.storeTiming,
      })
      .then(() => {
        alert("Profile updated successfully");
        setIsEditing(false);
      })
      .catch(() => alert("Failed to update profile"))
      .finally(() => setLoading(false));
  };

  const Line = ({ label, value }: { label: string; value?: string }) => (
    <p className="text-[16px] mb-2">
      <span className="font-semibold text-gray-700">{label}:</span>{" "}
      <span className="text-gray-900">{value || "-"}</span>
    </p>
  );

  /* =========================
     STATES
  ========================== */
  if (loading)
    return <div className="p-10 text-lg font-semibold">Loading profile...</div>;

  if (error)
    return <div className="p-10 text-red-600 font-semibold">{error}</div>;

  if (!profile) return null;

  /* =========================
     UI
  ========================== */
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Vendor Profile
          </h1>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            <FiEdit />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-8 rounded-xl shadow flex gap-8 items-center mb-10">
          <img
            src={profile.vendorPhoto}
            className="w-36 h-36 rounded-full border object-cover"
            onError={(e) =>
              ((e.target as HTMLImageElement).src =
                "https://ui-avatars.com/api/?name=Vendor")
            }
          />
          <div>
            <h2 className="text-2xl font-semibold">
              {profile.accountHolderName}
            </h2>
            <p className="text-gray-600 text-lg">{profile.shopName}</p>
            <p className="text-gray-500">{profile.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Business */}
          <div className="bg-white p-6 rounded-xl border border-blue-500">
            <h3 className="text-xl font-semibold mb-4">Business Details</h3>

            {isEditing ? (
              <div className="space-y-3">
                <input name="shopName" value={profile.shopName} onChange={handleChange} className="input input-bordered w-full" />
                <input name="gstNumber" value={profile.gstNumber} onChange={handleChange} className="input input-bordered w-full" />
                <input name="contactNo" value={profile.contactNo} onChange={handleChange} className="input input-bordered w-full" />
                <input name="email" value={profile.email} onChange={handleChange} className="input input-bordered w-full" />
                <input name="storeTiming" value={profile.storeTiming} onChange={handleChange} className="input input-bordered w-full" />
                <input name="cityState" value={profile.cityState} onChange={handleChange} className="input input-bordered w-full" />
                <textarea name="address" value={profile.address} onChange={handleChange} className="textarea textarea-bordered w-full" />
              </div>
            ) : (
              <>
                <Line label="Shop Name" value={profile.shopName} />
                <Line label="GST Number" value={profile.gstNumber} />
                <Line label="Phone" value={profile.contactNo} />
                <Line label="Email" value={profile.email} />
                <Line label="Store Timing" value={profile.storeTiming} />
                <Line label="City / State" value={profile.cityState} />
                <Line label="Address" value={profile.address} />
              </>
            )}
          </div>

          {/* Bank */}
          <div className="bg-white p-6 rounded-xl border border-blue-500">
            <h3 className="text-xl font-semibold mb-4">Bank Details</h3>
            <Line label="Account Holder" value={profile.accountHolderName} />
            <Line label="Bank Name" value={profile.bankName} />
            <Line label="Account Number" value={profile.accountNumber} />
            <Line label="IFSC" value={profile.ifscCode} />
            <Line label="UPI ID" value={profile.upiId} />
          </div>
        </div>

        {isEditing && (
          <div className="mt-10">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
