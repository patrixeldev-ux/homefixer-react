export default function OfferSection() {
  return (
    <section className="relative -mt-16 px-6 pb-10 md:px-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-amber-100 bg-gradient-to-r from-[#FFC107] via-[#FFD54F] to-[#FFECB3] shadow-[0_30px_80px_rgba(245,158,11,0.22)]">
        <div className="absolute" />
        <div className="relative overflow-hidden px-8 py-12 md:px-14 md:py-16">
          <div className="absolute -left-14 top-0 h-56 w-56 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-[#1E88E5]/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full bg-[#1E88E5] px-5 py-1.5 text-sm font-semibold tracking-wide text-white shadow-lg">
              LIMITED TIME OFFER
            </span>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Flat 30% Off On Your First Booking
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-800">
              New customers get an exclusive welcome discount on trusted home
              services, from urgent repairs to scheduled maintenance.
            </p>

            <button className="mt-8 rounded-full bg-gradient-to-r from-[#1E88E5] to-indigo-600 px-9 py-3.5 text-base font-semibold text-white shadow-[0_18px_35px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_22px_44px_rgba(79,70,229,0.4)]">
              Unlock Discount
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
