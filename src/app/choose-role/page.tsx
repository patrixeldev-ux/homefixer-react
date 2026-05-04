"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChooseRoleContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const mode        = searchParams.get("mode") === "login" ? "login" : "register";

  const isLogin = mode === "login";

  const roles = [
    {
      key:     "customer",
      label:   "Customer",
      desc:    "Book verified professionals for any home service, instantly.",
      icon:    "🏠",
      color:   "blue",
      loginPath:    "/auth",
      registerPath: "/auth",
    },
    {
      key:     "vendor",
      label:   "Vendor",
      desc:    "List your store, supply materials, and grow your business.",
      icon:    "🏪",
      color:   "amber",
      loginPath:    "/vendor/auth",
      registerPath: "/vendor/auth",
    },
    {
      key:     "service-man",
      label:   "Serviceman",
      desc:    "Accept jobs, earn money, and build your reputation.",
      icon:    "🔧",
      color:   "green",
      loginPath:    "/service-man/auth",
      registerPath: "/service-man/auth",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; btn: string; ring: string }> = {
    blue:  { bg: "bg-blue-50",  icon: "text-blue-600",  btn: "bg-blue-600 hover:bg-blue-700",  ring: "ring-blue-200" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", btn: "bg-amber-600 hover:bg-amber-700",ring: "ring-amber-200" },
    green: { bg: "bg-green-50", icon: "text-green-600", btn: "bg-green-600 hover:bg-green-700",ring: "ring-green-200" },
  };

  const handleSelect = (role: typeof roles[0]) => {
    router.push(isLogin ? role.loginPath : role.registerPath);
  };

  const toggleMode = () => {
    router.push(isLogin ? "/choose-role?mode=register" : "/choose-role?mode=login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 flex flex-col items-center justify-center px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        {/* Mode toggle pill */}
        <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1 mb-8 shadow-sm">
          <button
            onClick={() => router.push("/choose-role?mode=login")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              isLogin
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => router.push("/choose-role?mode=register")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              !isLogin
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          {isLogin ? "Welcome back" : "Join HomeFixer"}
        </h1>
        <p className="text-gray-500 text-lg">
          {isLogin
            ? "Select your role to continue to your dashboard"
            : "Choose how you'd like to use HomeFixer"
          }
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
        {roles.map((role) => {
          const c = colorMap[role.color];
          return (
            <button
              key={role.key}
              onClick={() => handleSelect(role)}
              className={`group relative bg-white rounded-2xl border border-gray-100 shadow-sm p-7 text-left
                transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:ring-4 ${c.ring}
                focus:outline-none`}
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${c.btn.split(" ")[0]}`} />

              {/* Icon */}
              <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform duration-300 group-hover:scale-110`}>
                {role.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{role.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{role.desc}</p>

              <div className={`w-full ${c.btn} text-white py-2.5 rounded-xl text-sm font-bold text-center transition-colors`}>
                {isLogin ? "Login" : "Register"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Toggle CTA */}
      <p className="text-gray-500 text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={toggleMode}
          className="text-sky-600 font-semibold hover:underline"
        >
          {isLogin ? "Register here" : "Login here"}
        </button>
      </p>
    </div>
  );
}

export default function ChooseRole() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChooseRoleContent />
    </Suspense>
  );
}