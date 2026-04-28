"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

type Mode = "login" | "signup";

export default function ServiceManAuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode]       = useState<Mode>("login");
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({ email: "", otp: "", fullName: "", phone: "", password: "" });

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!form.email) return setError("Email is required");
      setLoading(true);
      try {
        await api.post(mode === "login" ? "/api/auth/login/send-otp/" : "/api/auth/register/send-otp/", { email: form.email });
        setStep(2);
      } catch (err: any) { setError(err?.response?.data?.detail || "Failed to send OTP"); }
      finally { setLoading(false); }
      return;
    }

    if (step === 2) {
      if (!form.otp) return setError("OTP is required");
      setLoading(true);
      try {
        const res = await api.post(
          mode === "login" ? "/api/auth/login/verify-otp/" : "/api/auth/register/verify-otp/",
          { email: form.email, otp: form.otp }
        );
        if (mode === "login") {
          if (res.data.tokens) {
            localStorage.setItem("accessToken", res.data.tokens.access);
            localStorage.setItem("refreshToken", res.data.tokens.refresh);
            localStorage.setItem("role", "SERVICEMAN");
            router.push("/service-man/dashboard");
          }
        } else { setStep(3); }
      } catch (err: any) { setError(err?.response?.data?.detail || "Invalid or expired OTP"); }
      finally { setLoading(false); }
      return;
    }

    if (step === 3) {
      if (!form.fullName || !form.phone || !form.password) return setError("All fields required");
      setLoading(true);
      try {
        const res = await api.post("/api/auth/register/complete/", {
          email: form.email, name: form.fullName,
          phone: form.phone, password: form.password, role: "SERVICEMAN",
        });
        if (res.data.tokens) {
          localStorage.setItem("accessToken", res.data.tokens.access);
          localStorage.setItem("refreshToken", res.data.tokens.refresh);
          localStorage.setItem("role", "SERVICEMAN");
          router.push("/service-man/dashboard");
        }
      } catch (err: any) { setError(err?.response?.data?.detail || "Registration failed"); }
      finally { setLoading(false); }
    }
  }

  if (!mounted) return null;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.badge}>S</span>erviceMan
        </div>

        <h2 style={styles.title}>
          {mode === "login" ? "Welcome Back!" : "Join as ServiceMan"}
        </h2>
        <p style={styles.subtitle}>
          {mode === "login" ? "New here? " : "Already have account? "}
          <span style={styles.link} onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setStep(1); setError(""); }}>
            {mode === "login" ? "Create account" : "Login"}
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* ✅ No step indicator lines — just the relevant input */}
          {step === 1 && (
            <input style={styles.input} name="email" type="email"
              placeholder="Enter email address" value={form.email} onChange={handleChange} autoFocus />
          )}

          {step === 2 && (
            <>
              <p style={styles.hint}>OTP sent to {form.email}</p>
              <input style={styles.input} name="otp" placeholder="Enter 6-digit OTP"
                value={form.otp} onChange={handleChange} maxLength={6} autoFocus />
              <button type="button" style={styles.back}
                onClick={() => { setStep(1); setForm(f => ({ ...f, otp: "" })); }}>
                ← Change email
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <input style={styles.input} name="fullName" placeholder="Full name"
                value={form.fullName} onChange={handleChange} />
              <input style={styles.input} name="phone" type="tel" placeholder="Phone number"
                value={form.phone} onChange={handleChange} />
              <input style={styles.input} type="password" name="password" placeholder="Create password"
                value={form.password} onChange={handleChange} />
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Please wait..." :
              step === 1 ? "Send OTP →" :
              step === 2 ? (mode === "login" ? "Login →" : "Verify →") :
              "Create Account →"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh", display: "flex",
    justifyContent: "center", alignItems: "center",
    backgroundImage: "url('https://t3.ftcdn.net/jpg/06/65/51/18/360_F_665511841_0F5zKLnFoWoGMgswEVu77hfpcy3vGjlW.jpg')",
    backgroundSize: "cover", backgroundPosition: "center",
  },
  card: {
    width: 420,
    minHeight: 600,
    padding: 40,
    borderRadius: 18,
    background: "rgba(5, 46, 22, 0.75)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
},
  logo:  { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
  badge: { background: "#22c55e", padding: "0 9px", borderRadius: 5, marginRight: 6 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { color: "#bbf7d0", marginBottom: 28, fontSize: 14 },
  link:  { fontWeight: "bold", cursor: "pointer", color: "#86efac" },
  hint:  { color: "#86efac", fontSize: 13, marginBottom: 10 },
  input: {
    width: "100%", padding: 13, marginBottom: 14, borderRadius: 10,
    border: "1px solid rgba(74,222,128,0.3)",
    background: "rgba(255,255,255,0.08)", color: "#fff",
    outline: "none", fontSize: 14, boxSizing: "border-box",
  },
  btn: {
    width: "100%", padding: 14, borderRadius: 10,
    background: "#16a34a", border: "none",
    color: "#fff", fontWeight: "bold", marginTop: 8,
    cursor: "pointer", fontSize: 15,
  },
  back:  { background: "none", border: "none", color: "#86efac", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12 },
  error: { color: "#fca5a5", marginBottom: 10, fontSize: 13 },
};