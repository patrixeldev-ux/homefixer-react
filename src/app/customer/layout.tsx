"use client";

import Sidebar from "./components/sidebar";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

function getStoredRole() {
  const explicitRole = localStorage.getItem("role");
  if (explicitRole) {
    return explicitRole.toUpperCase();
  }

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser) as { role?: string };
      if (user.role) {
        return user.role.toUpperCase();
      }
    } catch {
      // Ignore malformed local storage user payloads.
    }
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as {
        role?: string;
        user_type?: string;
      };
      const inferredRole = payload.role || payload.user_type;
      if (inferredRole) {
        return inferredRole.toUpperCase();
      }
    } catch {
      // Ignore unreadable tokens and let backend validation handle them.
    }
  }

  return null;
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const token = isClient ? localStorage.getItem("accessToken") : null;
  const role = isClient ? getStoredRole() : null;
  const isAuthorized = Boolean(token) && (!role || role === "CUSTOMER");

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!token || (role && role !== "CUSTOMER")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      router.push("/auth");
    }
  }, [isClient, role, router, token]);

  if (!isClient) {
    return <div className="p-10">Loading...</div>;
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
