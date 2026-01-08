import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white rounded-b-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      
     
      <h1 className="text-2xl font-semibold text-[#1E88E5] tracking-wide">
        HomeFixer
      </h1>
      <Link
        href="/choose-role"
        className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
      >
        Coming Soon
      </Link>
     
      

    </nav>
  );
}
