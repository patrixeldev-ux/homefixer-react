const services = [
  { name: "Electrician", icon: "⚡", tone: "from-blue-500/15 to-indigo-500/15" },
  { name: "Plumber", icon: "🚿", tone: "from-cyan-500/15 to-sky-500/15" },
  { name: "Cleaning", icon: "🧼", tone: "from-amber-400/20 to-yellow-300/20" },
  { name: "Appliance Repair", icon: "🔧", tone: "from-indigo-500/15 to-blue-500/15" },
];

export default function ServicesSection() {
  return (
    <section id="services" className="bg-[#F8FAFC] py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5]">
          Popular Services
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Home care, beautifully simplified
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Everything your home needs, handled by trusted professionals with
          transparent service quality and dependable support.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="group rounded-[30px] border border-slate-200 bg-white p-8 text-left shadow-[0_22px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(30,136,229,0.16)]"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${service.tone} text-4xl shadow-inner`}
              >
                {service.icon}
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                {service.name}
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Reliable, expert-led service with premium care from booking to
                completion.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
