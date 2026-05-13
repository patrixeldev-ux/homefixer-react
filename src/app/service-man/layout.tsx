"use client";

import ProtectedRoute from "../admin/components/ProtectedRoute";
import ServicemanSidebar from "./components/sidebar";
import DashboardTopbar from "../../components/DashboardTopbar";
import { usePathname } from "next/navigation";

export default function ServiceManLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-screen pages — no chrome at all
  const isFullScreen =
    pathname.startsWith("/service-man/tracking") ||
    pathname === "/service-man/auth";

  if (isFullScreen) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <ServicemanSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopbar
            roleLabel="Serviceman"
            accentClass="bg-green-600"
            logoutEndpoint="/auth/logout/"
            logoutRedirect="/service-man/auth"
          />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
