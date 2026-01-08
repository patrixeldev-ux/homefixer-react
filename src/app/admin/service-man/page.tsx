"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ServiceMan {
  name: string;
  serviceType: string;
  currentJob: string | null;
  status: string;
}

export default function ServiceMenPage() {
  const router = useRouter();

  const [serviceMen] = useState<ServiceMan[]>([
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
  ]);

  const [selectedMan, setSelectedMan] = useState<ServiceMan | null>(null);

  const handleView = (man: ServiceMan) => {
    setSelectedMan(man); // open modal
  };

  const handleClose = () => setSelectedMan(null);

  const handleFire = (name: string) => {
    alert(`Fired ${name}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Service Men Dashboard</h1>
        <p className="mt-2 text-gray-500">Monitor availability and current work of all service men.</p>
      </div>

      {/* Service Men Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceMen.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 relative border border-gray-100"
          >
            {/* Status Badge */}
            <WorkStatusBadge status={s.status} />

            {/* Name and Service */}
            <div className="mb-4">
              <p className="text-xl font-semibold text-gray-900">{s.name}</p>
              <p className="text-gray-500">{s.serviceType}</p>
            </div>

            {/* Current Job / Availability */}
            {s.status === "IN_WORK" ? (
              <p className="text-gray-700 mb-4">
                🔧 <span className="font-medium">Current Work:</span> {s.currentJob}
              </p>
            ) : (
              <p className="text-green-600 font-medium mb-4">🟢 Available</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleView(s)}
                className="flex-1 py-2 px-4 text-white font-semibold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                View
              </button>
              <button
                onClick={() => handleFire(s.name)}
                className="flex-1 py-2 px-4 text-white font-semibold bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-md"
              >
                Fire
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-1/2 lg:w-1/3 p-6 relative">
            <h2 className="text-2xl font-bold mb-4">{selectedMan.name}</h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Service Type:</span> {selectedMan.serviceType}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {selectedMan.status === "IN_WORK" ? "In Work" : "Free"}
              </p>
              <p>
                <span className="font-semibold">Current Job:</span>{" "}
                {selectedMan.currentJob ? selectedMan.currentJob : "No ongoing job"}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="mt-6 w-full py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Status Badge */
function WorkStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
        status === "IN_WORK"
          ? "bg-yellow-200 text-yellow-800"
          : "bg-green-200 text-green-800"
      }`}
    >
      {status === "IN_WORK" ? "In Work" : "Free"}
    </span>
  );
}
