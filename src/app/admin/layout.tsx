"use client";

import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/sidebar";
import AdminNavbar from "./components/AdminNavbar";
import { usePathname } from "next/navigation";

// Pages that should render full-screen with no chrome at all
const FULL_SCREEN_PATHS = ["/auth"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isFullScreen = FULL_SCREEN_PATHS.some((p) => pathname === p);

  if (isFullScreen) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#f7f8fc]">

        {/* ── Sidebar ── */}
        <Sidebar />

        {/* ── Main column: navbar + scrollable content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <AdminNavbar />
            {children}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}