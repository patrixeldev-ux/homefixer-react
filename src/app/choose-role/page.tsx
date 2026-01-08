"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChooseRole() {
  const router = useRouter();

  const handleRoleSelect = (role: string) => {
    if (role === "customer") router.push("/customer/auth");
    if (role === "vendor") router.push("/vendor/auth");
    if (role === "service-man") router.push("/service-man/auth");
    if (role === "admin") router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-gray-600">
            Select how you'd like to use HomeFixer
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center mb-14">
          
          {/* Customer */}
          <div
            onClick={() => handleRoleSelect("customer")}
            className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5m-15-4h12m-12 3h12m-12 3h12M15 1.5v3m0 2v3" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Customer</h3>
            <p className="text-gray-600 mb-6">
              Browse and book services from verified vendors. Get your home fixed by professionals.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Continue as Customer
            </button>
          </div>

          {/* Vendor */}
          <div
            onClick={() => handleRoleSelect("vendor")}
            className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
              <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Vendor</h3>
            <p className="text-gray-600 mb-6">
              Post your services and connect with customers. Grow your business and manage bookings.
            </p>
            <button className="w-full bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition">
              Continue as Vendor
            </button>
          </div>

          {/* Service Man */}
          <div
            onClick={() => handleRoleSelect("service-man")}
            className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5m-15-4h12m-12 3h12m-12 3h12M15 1.5v3m0 2v3" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Service Man</h3>
            <p className="text-gray-600 mb-6">
              Accept service requests and complete jobs. Build your reputation and earn money.
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Continue as Service Man
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/" className="text-blue-600 font-semibold hover:underline">
              Go Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
