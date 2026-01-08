"use client";

type BookingStatus =
  | "Pending"
  | "Accepted"
  | "On the way"
  | "Completed"
  | "Cancelled";

interface Booking {
  id: number;
  service: string;
  icon: string;
  date: string;
  time: string;
  address: string;
  status: BookingStatus;
}

const bookings: Booking[] = [
  {
    id: 1,
    service: "Carpenter",
    icon: "🪚",
    date: "07 Jan 2026",
    time: "10:00 AM – 12:00 PM",
    address: "Vadodara, Gujarat",
    status: "Pending",
  },
  {
    id: 2,
    service: "Plumber",
    icon: "🔧",
    date: "05 Jan 2026",
    time: "02:00 PM – 04:00 PM",
    address: "Ahmedabad, Gujarat",
    status: "On the way",
  },
  {
    id: 3,
    service: "Electrician",
    icon: "⚡",
    date: "02 Jan 2026",
    time: "11:00 AM – 01:00 PM",
    address: "Surat, Gujarat",
    status: "Completed",
  },
];

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          My Bookings
        </h1>
        <p className="text-slate-500 mt-1">
          Track your services in real time
        </p>
      </div>

      {/* Booking Cards */}
      <div className="space-y-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="relative rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all"
          >
            {/* Top Gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl" />

            <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left */}
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 flex items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  {b.icon}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {b.service}
                  </h2>

                  <div className="mt-2 space-y-1 text-sm text-slate-500">
                    <p>📅 {b.date}</p>
                    <p>⏰ {b.time}</p>
                    <p>📍 {b.address}</p>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-start lg:items-end gap-4">
                <StatusPill status={b.status} />
                <ProgressBar status={b.status} />

                <button className="text-sm font-semibold text-blue-600 hover:underline">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- STATUS BADGE ---------- */

function StatusPill({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-blue-100 text-blue-700",
    "On the way": "bg-indigo-100 text-indigo-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ---------- PROGRESS BAR ---------- */

function ProgressBar({ status }: { status: BookingStatus }) {
  const progress: Record<BookingStatus, number> = {
    Pending: 25,
    Accepted: 50,
    "On the way": 75,
    Completed: 100,
    Cancelled: 100,
  };

  return (
    <div className="w-48">
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
          style={{ width: `${progress[status]}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">Service progress</p>
    </div>
  );
}
