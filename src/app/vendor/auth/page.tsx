"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

<<<<<<< HEAD
// Login is handled by the unified auth page at /auth.
// This page handles vendor registration only.
=======
type Mode = "login" | "signup";
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff

export default function VendorAuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
<<<<<<< HEAD
=======
  const [mode, setMode]       = useState<Mode>("login");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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

<<<<<<< HEAD
    /* STEP 1 — send OTP for registration */
=======
    /* STEP 1 — send OTP */
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
    if (step === 1) {
      if (!form.email) return setError("Email is required");
      setLoading(true);
      try {
<<<<<<< HEAD
        await api.post("/auth/register/send-otp/", { email: form.email });
        setStep(2);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        setError(e?.response?.data?.detail || "Failed to send OTP");
=======
        const endpoint = mode === "login"
          ? "/api/auth/login/send-otp/"       // ✅ trailing slash
          : "/api/auth/register/send-otp/";
        await api.post(endpoint, { email: form.email });
        setStep(2);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to send OTP");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      } finally { setLoading(false); }
      return;
    }

    /* STEP 2 — verify OTP */
    if (step === 2) {
      if (!form.otp) return setError("OTP is required");
      setLoading(true);
      try {
<<<<<<< HEAD
        await api.post("/auth/register/verify-otp/", {
          email: form.email,
          otp: form.otp,
        });
        setStep(3);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        setError(e?.response?.data?.detail || "Invalid or expired OTP");
=======
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
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      } finally { setLoading(false); }
      return;
    }

    /* STEP 3 — complete registration */
    if (step === 3) {
      if (!form.companyName || !form.phone || !form.password)
        return setError("All fields are required");
      setLoading(true);
      try {
<<<<<<< HEAD
        const res = await api.post("/auth/register/complete/", {
=======
        const res = await api.post("/api/auth/register/complete/", {
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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
<<<<<<< HEAD
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        setError(e?.response?.data?.detail || "Registration failed");
=======
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Registration failed");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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

<<<<<<< HEAD
        <h2 style={styles.title}>Register Your Business</h2>
        <p style={styles.subtitle}>
          Already registered?{" "}
          <span style={styles.link} onClick={() => router.push("/auth")}>
            Login here
=======
        <h2 style={styles.title}>
          {mode === "login" ? "Welcome Back!" : "Register Your Business"}
        </h2>
        <p style={styles.subtitle}>
          {mode === "login" ? "New vendor? " : "Already registered? "}
          <span style={styles.link} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setStep(1); setError(""); }}>
            {mode === "login" ? "Create account" : "Login"}
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
<<<<<<< HEAD
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="Business email"
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
                placeholder="Enter OTP"
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
                name="companyName"
                placeholder="Company / Business name"
                value={form.companyName}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                name="phone"
                placeholder="Phone number (10 digits)"
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
=======
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
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} disabled={loading}>
<<<<<<< HEAD
            {loading
              ? "Please wait..."
              : step === 1 ? "Send OTP →"
              : step === 2 ? "Verify →"
              : "Create Account"}
=======
            {loading ? "Please wait..."
              : step < (mode === "login" ? 2 : 3) ? "Next"
              : mode === "login" ? "Login" : "Create Account"}
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
<<<<<<< HEAD
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
    background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 25px 45px rgba(0,0,0,0.45)",
    color: "#fff",
  },
  logo:     { fontSize: 34, fontWeight: "bold", marginBottom: 18 },
  badge:    { background: "#f59e0b", padding: "0 10px", borderRadius: 4, marginRight: 6 },
  title:    { marginBottom: 6 },
  subtitle: { color: "#e5e7eb", marginBottom: 28 },
  link:     { fontWeight: "bold", cursor: "pointer", color: "#fbbf24" },
  hint:     { color: "#fbbf24", fontSize: 13, marginBottom: 10 },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    background: "#f59e0b",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    marginTop: 12,
    cursor: "pointer",
    fontSize: 16,
  },
  back:  { background: "none", border: "none", color: "#fbbf24", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12 },
  error: { color: "#fca5a5", marginBottom: 10, fontSize: 14 },
};
=======
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
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
