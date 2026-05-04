"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

type Mode = "login" | "signup";

export default function VendorAuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode]       = useState<Mode>("login");
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    email: "", otp: "", companyName: "", phone: "", password: "",
  });

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* STEP 1 — send OTP */
    if (step === 1) {
      if (!form.email) return setError("Email is required");
      setLoading(true);
      try {
        const endpoint = mode === "login"
          ? "/api/auth/login/send-otp/"       // ✅ trailing slash
          : "/api/auth/register/send-otp/";
        await api.post(endpoint, { email: form.email });
        setStep(2);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to send OTP");
      } finally { setLoading(false); }
      return;
    }

    /* STEP 2 — verify OTP */
    if (step === 2) {
      if (!form.otp) return setError("OTP is required");
      setLoading(true);
      try {
        const endpoint = mode === "login"
          ? "/api/auth/login/verify-otp/"     // ✅ correct endpoint
          : "/api/auth/register/verify-otp/";
        const res = await api.post(endpoint, { email: form.email, otp: form.otp });

        if (mode === "login") {
          // ✅ same token fix as serviceman
          if (res.data.tokens) {
            localStorage.setItem("accessToken", res.data.tokens.access);
            localStorage.setItem("refreshToken", res.data.tokens.refresh);
            localStorage.setItem("role", "VENDOR");
            router.push("/vendor/dashboard");
          } else {
            setError("Login failed. Please try again.");
          }
        } else {
          setStep(3);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Invalid or expired OTP");
      } finally { setLoading(false); }
      return;
    }

    /* STEP 3 — complete registration */
    if (step === 3) {
      if (!form.companyName || !form.phone || !form.password)
        return setError("All fields are required");
      setLoading(true);
      try {
        const res = await api.post("/api/auth/register/complete/", {
          email:    form.email,
          name:     form.companyName,
          phone:    form.phone,
          password: form.password,
          role:     "VENDOR",
        });
        if (res.data.tokens) {
          localStorage.setItem("accessToken", res.data.tokens.access);
          localStorage.setItem("refreshToken", res.data.tokens.refresh);
          localStorage.setItem("role", "VENDOR");
          router.push("/vendor/dashboard");
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Registration failed");
      } finally { setLoading(false); }
    }
  }

  if (!mounted) return null;

  return (
    <main style={styles.page}>
      <div style={styles.glassCard}>
        <div style={styles.logo}>
          <span style={styles.badge}>V</span>endor
        </div>

        <h2 style={styles.title}>
          {mode === "login" ? "Welcome Back!" : "Register Your Business"}
        </h2>
        <p style={styles.subtitle}>
          {mode === "login" ? "New vendor? " : "Already registered? "}
          <span style={styles.link} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setStep(1); setError(""); }}>
            {mode === "login" ? "Create account" : "Login"}
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <input style={styles.input} name="email" placeholder="Business email"
              value={form.email} onChange={handleChange} />
          )}
          {step === 2 && (
            <input style={styles.input} name="otp" placeholder="Enter OTP"
              value={form.otp} onChange={handleChange} />
          )}
          {step === 3 && mode === "signup" && (
            <>
              <input style={styles.input} name="companyName" placeholder="Company / Business name"
                value={form.companyName} onChange={handleChange} />
              <input style={styles.input} name="phone" placeholder="Phone number (10 digits)"
                value={form.phone} onChange={handleChange} />
              <input style={styles.input} type="password" name="password" placeholder="Create password"
                value={form.password} onChange={handleChange} />
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} disabled={loading}>
            {loading ? "Please wait..."
              : step < (mode === "login" ? 2 : 3) ? "Next"
              : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
    backgroundImage: "url('https://t3.ftcdn.net/jpg/06/65/51/18/360_F_665511841_0F5zKLnFoWoGMgswEVu77hfpcy3vGjlW.jpg')",
    backgroundSize: "cover", backgroundPosition: "center", paddingTop: 72 },
  glassCard: { width: 430, minHeight: 560, padding: 40, borderRadius: 18,
    background: "rgba(15,23,42,0.55)", backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 25px 45px rgba(0,0,0,0.45)", color: "#fff" },
  logo: { fontSize: 34, fontWeight: "bold", marginBottom: 18 },
  badge: { background: "#f59e0b", padding: "0 10px", borderRadius: 4, marginRight: 6 },
  title: { marginBottom: 6 },
  subtitle: { color: "#e5e7eb", marginBottom: 28 },
  link: { fontWeight: "bold", cursor: "pointer", color: "#fbbf24" },
  input: { width: "100%", padding: 14, marginBottom: 16, borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)",
    color: "#fff", outline: "none", boxSizing: "border-box" as const },
  button: { width: "100%", padding: 14, borderRadius: 10, background: "#f59e0b",
    border: "none", color: "#fff", fontWeight: "bold", marginTop: 12, cursor: "pointer", fontSize: 16 },
  error: { color: "#fca5a5", marginBottom: 10, fontSize: 14 },
};