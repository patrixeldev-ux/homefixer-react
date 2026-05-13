const reasons = [
  {
    title: "Verified Professionals",
    desc: "Background-checked experts trained to deliver dependable service with care.",
  },
  {
    title: "Quick And Easy Booking",
    desc: "Book in minutes with a polished experience designed to feel effortless.",
  },
  {
    title: "Transparent Pricing",
    desc: "See clear pricing upfront with no last-minute surprises or hidden fees.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-b from-white via-slate-50 to-blue-50 py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1E88E5]">
          Why HomeFixer
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Premium service with peace of mind
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          We bring together quality professionals, fast booking and transparent
          service standards to make every visit feel reliable and stress-free.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className="rounded-[30px] border border-white bg-white/90 p-8 text-left shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(37,99,235,0.14)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E88E5] to-indigo-600 text-lg font-semibold text-white shadow-lg">
                0{index + 1}
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                {reason.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {reason.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
