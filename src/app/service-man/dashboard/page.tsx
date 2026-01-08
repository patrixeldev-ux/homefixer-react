"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api"; // 

export default function ServiceManDashboard() {
  const router = useRouter();

  /* ---------- AUTH GUARD ---------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/service-man");
  }, []);

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch (error) {
      // even if API fails, logout locally
    } finally {
      localStorage.clear();
      router.push("/service-man");
    }
  };

  return (
    <main style={styles.page}>
      {/* ---------- LOGOUT BUTTON ---------- */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        Logout
      </button>

      {/* ---------- COMING SOON CARD ---------- */}
      <div style={styles.card}>
        <div style={styles.icon}>🚧</div>

        <h1 style={styles.title}>Coming Soon</h1>

        <p style={styles.text}>
          Service Man dashboard is currently under development.
          <br />
          We’ll be launching it very soon.
        </p>

        <span style={styles.badge}>Work in Progress</span>
      </div>
    </main>
  );
}

/* -------- STYLES -------- */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1E88E5, #42A5F5)",
    padding: 20,
    position: "relative" as const,
  },
  logoutBtn: {
    position: "absolute" as const,
    top: 20,
    right: 20,
    padding: "8px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.9)",
    color: "#E53935",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  card: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    padding: "50px 40px",
    textAlign: "center" as const,
    maxWidth: 420,
    width: "100%",
    boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#1E88E5",
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: "#555",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  badge: {
    display: "inline-block",
    padding: "8px 18px",
    borderRadius: 20,
    background: "#E3F2FD",
    color: "#1E88E5",
    fontSize: 13,
    fontWeight: 600,
  },
};
