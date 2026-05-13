"use client";

import { useRouter } from "next/navigation";

export default function ChooseRole() {
  const router = useRouter();

  const roles = [
    {
      key:          "customer",
      label:        "Customer",
      desc:         "Book verified professionals for any home service, instantly.",
      icon:         "🏠",
      color:        "blue",
      registerPath: "/auth",
    },
    {
      key:          "vendor",
      label:        "Vendor",
      desc:         "List your store, supply materials, and grow your business.",
      icon:         "🏪",
      color:        "amber",
      registerPath: "/vendor/auth",
    },
    {
      key:          "service-man",
      label:        "Serviceman",
      desc:         "Accept jobs, earn money, and build your reputation.",
      icon:         "🔧",
      color:        "green",
      registerPath: "/service-man/auth",
    },
  ];

  const colorMap: Record<string, { bg: string; btn: string; ring: string }> = {
    blue:  { bg: "bg-blue-50",  btn: "bg-blue-600 hover:bg-blue-700",  ring: "ring-blue-200" },
    amber: { bg: "bg-amber-50", btn: "bg-amber-600 hover:bg-amber-700", ring: "ring-amber-200" },
    green: { bg: "bg-green-50", btn: "bg-green-600 hover:bg-green-700", ring: "ring-green-200" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 flex flex-col items-center justify-center px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Join HomeFixer
        </h1>
        <p className="text-black text-lg">
          Choose how you&apos;d like to use HomeFixer
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
        {roles.map((role) => {
          const c = colorMap[role.color];
          return (
            <button
              key={role.key}
              onClick={() => router.push(role.registerPath)}
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
                Register
              </div>
            </button>
          );
        })}
      </div>

      {/* Login CTA */}
      <p className="text-black text-sm">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/auth")}
          className="text-sky-400 font-semibold hover:underline"
        >
          Login here
        </button>
      </p>
    </div>
  );
}
