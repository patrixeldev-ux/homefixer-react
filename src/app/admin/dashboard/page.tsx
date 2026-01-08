"use client";

import { useRouter } from "next/navigation";
import api from "../../../lib/api";

export default function DashboardPage() {
  const router = useRouter();

  // ---------- LOGOUT ----------
  const handleLogout = async () => {
    try { await api.post("/api/logout"); } catch {}
    finally { localStorage.clear(); router.push("/admin"); }
  };

  // ---------- ACTIONS ----------
  const handleApprove = (name: string) => alert(`Approved ${name}`);
  const handleReject = (name: string) => alert(`Rejected ${name}`);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Add Product": router.push("/admin/leads"); break;
      case "Inventory": router.push("/admin/vendors"); break;
      case "Reports": router.push("/admin/settings"); break;
      case "Service Men": router.push("/admin/service-man"); break;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 font-poppins space-y-8">

      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[20px] shadow-neu">
        <h1 className="text-2xl font-semibold text-[#212121]">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="cursor-pointer text-xl text-[#1A73E8] hover:text-[#1558b0] transition">🔔</span>
          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-200"
          />
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-[20px] bg-[#1A73E8] text-white font-medium hover:bg-[#1558b0] transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ---------- PENDING REQUESTS ---------- */}
      <section>
        <h2 className="text-lg font-semibold text-[#212121] mb-4">Pending Requests</h2>
        {["Amit Kumar", "Lokesh Keshav"].map((name, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-[20px] shadow-neu flex justify-between items-center mb-4 hover:shadow-neu-lg transition"
          >
            <div className="flex items-center gap-4">
              <img src={`https://i.pravatar.cc/40?img=${i + 1}`} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-semibold text-[#212121]">{name}</p>
                <p className="text-sm text-gray-400">Service Man</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(name)}
                className="px-4 py-2 bg-[#FFC107] bg-opacity-20 text-white rounded-[20px] font-medium hover:bg-opacity-30 transition"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(name)}
                className="px-4 py-2 bg-[#1A73E8] bg-opacity-20 text-white rounded-[20px] font-medium hover:bg-opacity-30 transition"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ---------- OVERVIEW CARDS ---------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Sales" value="₹5,600" color="#1A73E8" />
        <StatCard title="Pending Orders" value="6" color="#1A73E8" />
        <StatCard title="Top Product" value="—" color="#1A73E8" />
        <StatCard title="Alerts" value="Low Stock" color="#FFC107" />
      </section>

      {/* ---------- WEEKLY TRENDS ---------- */}
      <section className="bg-white p-6 rounded-[20px] shadow-neu hover:shadow-neu-lg transition">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-[#212121]">Weekly Trends</h3>
          <span className="text-sm text-gray-400">Last 7 days</span>
        </div>
        <div className="h-48 flex items-center justify-center text-gray-300 border border-dashed border-gray-200 rounded-[16px]">
          Donut chart placeholder
        </div>
      </section>

      {/* ---------- QUICK ACTIONS ---------- */}
      <section>
        <h3 className="font-semibold text-[#212121] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction icon="➕" label="Add Product" onClick={() => handleQuickAction("Add Product")} />
          <QuickAction icon="📦" label="Inventory" onClick={() => handleQuickAction("Inventory")} />
          <QuickAction icon="📊" label="Reports" onClick={() => handleQuickAction("Reports")} />
          <QuickAction icon="🧑‍🔧" label="Service Men" onClick={() => handleQuickAction("Service Men")} />
        </div>
      </section>

    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div
      className="p-6 rounded-[20px] shadow-neu flex flex-col justify-between"
      style={{
        backgroundColor: color,
        color: "#fff",
      }}
    >
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold mt-2">{value}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-[20px] shadow-neu flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 hover:shadow-neu-lg transition-transform"
    >
      <span className="text-2xl text-[#1A73E8]">{icon}</span>
      <span className="text-sm font-medium text-[#212121]">{label}</span>
    </div>
  );
}
