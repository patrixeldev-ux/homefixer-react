"use client";

import CustomerSidebar from "./components/sidebar";
import DashboardTopbar from "../../components/DashboardTopbar";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

function getStoredRole() {
  const explicitRole = localStorage.getItem("role");
  if (explicitRole) return explicitRole.toUpperCase();

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser) as { role?: string };
      if (user.role) return user.role.toUpperCase();
    } catch { /* ignore */ }
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as {
        role?: string; user_type?: string;
      };
      const inferredRole = payload.role || payload.user_type;
      if (inferredRole) return inferredRole.toUpperCase();
    } catch { /* ignore */ }
  }

  return null;
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const token        = isClient ? localStorage.getItem("accessToken") : null;
  const role         = isClient ? getStoredRole() : null;
  const isAuthorized = Boolean(token) && (!role || role === "CUSTOMER");

  useEffect(() => {
    if (!isClient) return;
    if (!token || (role && role !== "CUSTOMER")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      router.push("/auth");
    }
  }, [isClient, role, router, token]);

  if (!isClient) return <div className="p-10">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar
          roleLabel="Customer"
          accentClass="bg-blue-600"
          logoutEndpoint="/api/auth/logout/"
          logoutRedirect="/auth"
          checkFinalPayment={true}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
