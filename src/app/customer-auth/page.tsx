"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";

// Login is handled by the unified auth page at /auth.
// This page handles customer registration only.

export default function CustomerAuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    email: "", otp: "", fullName: "", phone: "", password: "",
  });

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* STEP 1 — send OTP for registration */
    if (step === 1) {
      if (!form.email) return setError("Email is required");
      setLoading(true);
      try {
        await api.post("/auth/register/send-otp/", { email: form.email });
        setStep(2);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        setError(e?.response?.data?.detail || "Failed to send OTP");
      } finally { setLoading(false); }
      return;
    }

    /* STEP 2 — verify OTP */
    if (step === 2) {
      if (!form.otp) return setError("OTP is required");
      setLoading(true);
      try {
        await api.post("/auth/register/verify-otp/", {
          email: form.email,
          otp: form.otp,
        });
        setStep(3);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        setError(e?.response?.data?.detail || "Invalid or expired OTP");
      } finally { setLoading(false); }
      return;
    }

    /* STEP 3 — complete registration */
    if (step === 3) {
      if (!form.fullName || !form.phone || !form.password)
        return setError("All fields are required");
      setLoading(true);
      try {
        const res = await api.post("/auth/register/complete/", {
          email:    form.email,
          name:     form.fullName,
          phone:    form.phone,
          password: form.password,
          role:     "CUSTOMER",
        });
        if (res.data.tokens) {
          localStorage.setItem("accessToken", res.data.tokens.access);
          localStorage.setItem("refreshToken", res.data.tokens.refresh);
          localStorage.setItem("role", "CUSTOMER");
          router.push("/customer/dashboard");
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        setError(e?.response?.data?.detail || "Registration failed");
      } finally { setLoading(false); }
    }
  }

  
  if (!mounted) return null;

  return (
    <main style={styles.page}>
      <div style={styles.glassCard}>
        <div style={styles.logo}>
          <span style={styles.badge}>C</span>ustomer
        </div>

        <h2 style={styles.title}>Create Your Account</h2>
        <p style={styles.subtitle}>
          Already registered?{" "}
          <span style={styles.link} onClick={() => router.push("/auth")}>
            Login here
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="Your email address"
              value={form.email}
              onChange={handleChange}
              autoFocus
            />
          )}

          {step === 2 && (
            <>
              <p style={styles.hint}>OTP sent to {form.email}</p>
              <input
                style={styles.input}
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={handleChange}
                maxLength={6}
                autoFocus
              />
              <button
                type="button"
                style={styles.back}
                onClick={() => { setStep(1); setForm(f => ({ ...f, otp: "" })); setError(""); }}
              >
                ← Change email
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <input
                style={styles.input}
                name="fullName"
                placeholder="Full name"
                value={form.fullName}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                name="phone"
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
              />
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading
              ? "Please wait..."
              : step === 1 ? "Send OTP →"
              : step === 2 ? "Verify →"
              : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: "url('https://t3.ftcdn.net/jpg/06/65/51/18/360_F_665511841_0F5zKLnFoWoGMgswEVu77hfpcy3vGjlW.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    paddingTop: 72,
  },
  glassCard: {
    width: 430,
    minHeight: 560,
    padding: 40,
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 25px 45px rgba(0,0,0,0.45)",
    color: "#fff",
  },
  logo:     { fontSize: 34, fontWeight: "bold", marginBottom: 18 },
  badge:    { background: "#3b82f6", padding: "0 10px", borderRadius: 4, marginRight: 6 },
  title:    { marginBottom: 6 },
  subtitle: { color: "#e5e7eb", marginBottom: 28 },
  link:     { fontWeight: "bold", cursor: "pointer", color: "#93c5fd" },
  hint:     { color: "#93c5fd", fontSize: 13, marginBottom: 10 },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    background: "#3b82f6",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    marginTop: 12,
    cursor: "pointer",
    fontSize: 16,
  },
  back:  { background: "none", border: "none", color: "#93c5fd", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12 },
  error: { color: "#fca5a5", marginBottom: 10, fontSize: 14 },
};
