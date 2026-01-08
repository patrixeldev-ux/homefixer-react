export default function UsersPage() {
  const customers = [
    { name: "Amit Patel", phone: "9876543210", status: "Active" },
    { name: "Neha Joshi", phone: "9123456789", status: "Blocked" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-xl font-semibold">Customers</h1>
        <p className="text-sm text-gray-500">
          Only registered customers are shown here
        </p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c, i) => (
              <tr key={i} className="border-t">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-4 text-center">
                  <button className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${
        status === "Active"
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-600"
      }`}
    >
      {status}
    </span>
  );
}
