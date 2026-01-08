export default function WhyChooseUs() {
  return (
    <section className="py-28 bg-gradient-to-b from-white to-blue-100 text-center">
      <h2 className="text-4xl font-bold">
        Why Choose HomeFixer?
      </h2>

      <div className="mt-16 grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {[
          ["Verified Professionals", "Background-checked & skilled experts"],
          ["Quick & Easy Booking", "Book services in under 60 seconds"],
          ["Transparent Pricing", "No hidden charges, ever"],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="bg-white rounded-[28px] p-10 shadow-[0_25px_70px_rgba(0,0,0,0.15)]"
          >
            <h3 className="text-xl font-semibold text-[#1E88E5]">
              {title}
            </h3>
            <p className="mt-4 text-gray-600">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
    