export default function LeadForm() {
  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-[#F8F9FA] rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
      
      <h2 className="text-xl font-semibold text-[#212121] mb-6 text-center">
        Get Notified
      </h2>

      <form className="space-y-5">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
        />

        <select className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]">
          <option>Select Service</option>
          <option>Electrician</option>
          <option>Plumber</option>
          <option>Cleaning</option>
        </select>

        <button className="w-full bg-[#1E88E5] text-white py-3 rounded-2xl font-medium shadow-[0_8px_20px_rgba(30,136,229,0.35)] hover:opacity-90 transition">
          Notify Me
        </button>
      </form>
    </div>
  );
}
