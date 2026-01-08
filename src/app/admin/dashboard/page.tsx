"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleApprove = (name: string) => {
    alert(`Approved ${name}`);
  };

  const handleReject = (name: string) => {
    alert(`Rejected ${name}`);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Add Product":
        router.push("/admin/leads");
        break;
      case "Inventory":
        router.push("/admin/vendors");
        break;
      case "Reports":
        router.push("/admin/settings");
        break;
      case "Service Men":
        router.push("/admin/service-man");
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          🔔
          <img
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop"
                className="w-8 h-8 rounded-full"
                  />

        </div>
      </div>

      {/* Pending Requests */}
      <section>
        <h2 className="font-semibold mb-3">Pending Request</h2>

        {["Amit Kumar", "Lokesh Keshav"].map((name, i) => (
          <div
            key={i}
            className="bg-white p-3 rounded-xl shadow flex justify-between items-center mb-3"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/40"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-gray-500">Service Man</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReject(name)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(name)}
                className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm cursor-pointer"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-2 gap-4">
        <StatCard title="Today's Sales" value="₹5,600" />
        <StatCard title="Pending Orders" value="6" />
        <StatCard title="Top Selling Product" value="—" />
        <StatCard title="Alert" value="Low Stock" />
      </section>

      {/* Weekly Trends */}
      <section className="bg-white p-4 rounded-xl shadow">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold">Weekly Trends</h3>
          <span className="text-sm text-gray-400">Last 7 days</span>
        </div>

        <div className="h-40 flex items-center justify-center text-gray-400">
          Donut chart here
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-4">
          <QuickAction icon="➕" label="Add Product" onClick={() => handleQuickAction("Add Product")} />
          <QuickAction icon="📦" label="Inventory" onClick={() => handleQuickAction("Inventory")} />
          <QuickAction icon="📊" label="Reports" onClick={() => handleQuickAction("Reports")} />
          <QuickAction icon="🧑‍🔧" label="Service Men" onClick={() => handleQuickAction("Service Men")} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <div
      className="bg-white p-4 rounded-xl shadow flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
