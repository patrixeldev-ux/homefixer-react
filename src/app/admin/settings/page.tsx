export default function SettingsPage() {
  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-lg">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>

      <label className="block mb-2 text-sm font-medium">
        Admin Name
      </label>
      <input
        type="text"
        placeholder="Admin"
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block mb-2 text-sm font-medium">
        Notification Email
      </label>
      <input
        type="email"
        placeholder="admin@homefixer.com"
        className="w-full border p-2 rounded mb-4"
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </div>
  );
}
