export default function LeadsPage() {
  const leads = [
    { name: "Rahul", phone: "9876543210", service: "Plumber" },
    { name: "Neha", phone: "9123456789", service: "AC Repair" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Leads</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Service</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={i}>
              <td className="p-2 border">{lead.name}</td>
              <td className="p-2 border">{lead.phone}</td>
              <td className="p-2 border">{lead.service}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
