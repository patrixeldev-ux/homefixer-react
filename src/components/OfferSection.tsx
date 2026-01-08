export default function OfferSection() {
  return (
    <section className="relative -mt-24 mx-6 md:mx-28 rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)]">

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFC107] via-[#FFD54F] to-[#FFECB3]" />

      {/* Decorative shapes */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 bg-[#1E88E5]/30 rounded-full blur-3xl" />

      <div className="relative p-12 md:p-16 text-[#212121]">
        <span className="inline-block bg-[#1E88E5] text-white px-5 py-1 rounded-full text-sm font-semibold mb-4">
          🔥 LIMITED TIME OFFER
        </span>

        <h2 className="text-4xl md:text-5xl font-extrabold">
          Flat 30% OFF
        </h2>

        <p className="mt-4 text-lg max-w-xl">
          New customers get exclusive discounts on their first home service booking.
        </p>

        <button className="mt-8 px-9 py-3 bg-[#1E88E5] text-white font-semibold rounded-full shadow-xl hover:scale-105 transition">
          Unlock Discount
        </button>
      </div>
    </section>
  );
}
