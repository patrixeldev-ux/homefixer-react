"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import VendorSidebar from "./components/sidebar";
import DashboardTopbar from "../../components/DashboardTopbar";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const isAuthPage = pathname === "/vendor/auth" || pathname === "/vendor";

  useEffect(() => {
    if (isAuthPage) { setReady(true); return; }
    const token = localStorage.getItem("accessToken");
    const role  = localStorage.getItem("role");
    if (!token || role !== "VENDOR") {
      localStorage.clear();
      router.replace("/vendor/auth");
      return;
    }
    setReady(true);
  }, [pathname]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <VendorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar
          roleLabel="Vendor"
          accentClass="bg-amber-500"
          logoutEndpoint="/api/auth/logout/"
          logoutRedirect="/vendor/auth"
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
