const services = [
  { name: "Electrician", icon: "⚡" },
  { name: "Plumber", icon: "🚿" },
  { name: "Cleaning", icon: "🧼" },
  { name: "Appliance Repair", icon: "🔧" },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="py-32 bg-[#F8F9FA] text-center"
    >
      <h2 className="text-4xl font-bold">
        Our Services
      </h2>

      <p className="mt-4 text-gray-600">
        Everything your home needs — handled by experts
      </p>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto px-6">
        {services.map((service) => (
          <div
            key={service.name}
            className="group bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-3 hover:shadow-[0_30px_80px_rgba(30,136,229,0.3)] transition-all"
          >
            <div className="text-5xl mb-5 group-hover:scale-110 transition">
              {service.icon}
            </div>
            <h3 className="font-semibold text-xl">
              {service.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
