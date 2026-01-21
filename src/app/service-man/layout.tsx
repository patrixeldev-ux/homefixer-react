"use client";

import ProtectedRoute from "../admin/components/ProtectedRoute";
import Sidebar from "./components/sidebar";
import { usePathname } from "next/navigation";

export default function ServiceManLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar - only show if not on login page */}
        {pathname !== "/service-man/auth" && <Sidebar />}

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
