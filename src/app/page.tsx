import Link from "next/link";
import HeroSection from "../components/HeroSection";
import OfferSection from "../components/OfferSection";
import ServicesSection from "../components/ServicesSection";
import WhyChooseUs from "../components/WhyChooseUs";

export default function Home() {
  return (
    <>
      <HeroSection />
      <OfferSection />
      <ServicesSection />
      <WhyChooseUs />
  
      {/* NEW SECTION — Explore More */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Explore More
          </h2>
          <p className="text-gray-600 mb-10">
            Learn more about HomeFixer, get in touch, or share your experience with us.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* About */}
            <Link href="/about">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  About Us
                </h3>
                <p className="text-sm text-gray-500">
                  Learn what HomeFixer is and how we simplify home services.
                </p>
              </div>
            </Link>

            {/* Contact */}
            <Link href="/contact">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Contact Us
                </h3>
                <p className="text-sm text-gray-500">
                  Have questions or issues? Reach out to our support team.
                </p>
              </div>
            </Link>

            {/* Feedback */}
            <Link href="/feedback">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Feedback
                </h3>
                <p className="text-sm text-gray-500">
                  Share your experience and help us improve our platform.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </>
  );
}