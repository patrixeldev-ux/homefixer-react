"use client";

import { useRouter } from "next/navigation";

export default function ServiceMenPage() {
  const router = useRouter();

  const serviceMen = [
    {
      name: "Rohit Sharma",
      serviceType: "Electrician",
      currentJob: "AC Wiring Repair",
      status: "IN_WORK",
    },
    {
      name: "Suresh Kumar",
      serviceType: "Plumber",
      currentJob: null,
      status: "FREE",
    },
  ];

  const handleView = (name: string) => {
    alert(`Viewing ${name}`);
  };

  const handleFire = (name: string) => {
    alert(`Fired ${name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-xl font-semibold">Service Men</h1>
        <p className="text-sm text-gray-500">
          Track service man availability and current work
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {serviceMen.map((s, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow flex justify-between items-center"
          >
            {/* Left Info */}
            <div>
              <p className="font-medium text-lg">{s.name}</p>
              <p className="text-sm text-gray-500">
                Service: {s.serviceType}
              </p>

              {s.status === "IN_WORK" ? (
                <p className="text-sm mt-1">
                  🔧 Current Work:{" "}
                  <span className="font-medium">{s.currentJob}</span>
                </p>
              ) : (
                <p className="text-sm mt-1 text-green-600">
                  🟢 Available (Free)
                </p>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <WorkStatusBadge status={s.status} />

              <button
                onClick={() => handleView(s.name)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded cursor-pointer"
              >
                View
              </button>

              <button
                onClick={() => handleFire(s.name)}
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded cursor-pointer"
              >
                Fire
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Status Badge */
function WorkStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === "IN_WORK"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {status === "IN_WORK" ? "In Work" : "Free"}
    </span>
  );
}
