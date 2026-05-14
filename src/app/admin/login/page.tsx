"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

// Login is handled by the unified auth page at /auth.
// This page handles admin registration only.

export default function AdminAuthPage() {
  const router = useRouter();

  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    name: "",
    phone: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* STEP 1 — send OTP for registration */
    if (step === 1) {
      if (!form.email) return setError("Email is required");
      setLoading(true);
      try {
        await api.post("/auth/register/send-otp", { email: form.email });
        setStep(2);
      } catch {
        setError("Failed to send OTP");
      } finally {
        setLoading(false);
      }
      return;
    }

    /* STEP 2 — verify OTP */
    if (step === 2) {
      if (!form.otp) return setError("OTP is required");
      setLoading(true);
      try {
        await api.post("/auth/register/verify-otp", {
          email: form.email,
          otp: form.otp,
        });
        setStep(3);
      } catch {
        setError("Invalid OTP");
      } finally {
        setLoading(false);
      }
      return;
    }

    /* STEP 3 — complete registration */
    if (step === 3) {
      if (!form.name || !form.phone || !form.password)
        return setError("All fields required");
      setLoading(true);
      try {
        await api.post("/auth/register/complete", {
          email: form.email,
          name: form.name,
          phone: form.phone,
          password: form.password,
          role: "admin",
        });
        router.push("/admin/dashboard");
      } catch {
        setError("Signup failed");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.glassCard}>
        {/* LOGO */}
        <div style={styles.logo}>
          <span style={styles.dIcon}>Home</span>Fixer
        </div>

        <h2 style={styles.title}>Create Admin Account</h2>

        <p style={styles.subtitle}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => router.push("/auth")}>
            Login here
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <input
              style={styles.input}
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              autoFocus
            />
          )}

          {step === 2 && (
            <>
              <p style={{ color: "#93c5fd", fontSize: 13, marginBottom: 10 }}>
                OTP sent to {form.email}
              </p>
              <input
                style={styles.input}
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
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
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />
              <div style={{ position: "relative" }}>
                <input
                  style={styles.input}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <span
                  style={styles.eye}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁️
                </span>
              </div>
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} disabled={loading}>
            {loading
              ? "Please wait..."
              : step === 1
              ? "Send OTP →"
              : step === 2
              ? "Verify →"
              : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* ---------------- STYLES ---------------- */
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage:
      "url('https://t3.ftcdn.net/jpg/06/65/51/18/360_F_665511841_0F5zKLnFoWoGMgswEVu77hfpcy3vGjlW.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  glassCard: {
    width: 420,
    minHeight: 560,
    padding: 40,
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    color: "#fff",
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dIcon: {
    background: "#4facfe",
    padding: "0 8px",
    borderRadius: 4,
    marginRight: 6,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    color: "#e5e7eb",
    marginBottom: 28,
  },
  link: {
    fontWeight: "bold",
    cursor: "pointer",
    color: "#93c5fd",
  },
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
  eye: {
    position: "absolute",
    right: 14,
    top: 14,
    cursor: "pointer",
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    background: "#3b82f6",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
    cursor: "pointer",
  },
  back: {
    background: "none",
    border: "none",
    color: "#93c5fd",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    marginBottom: 12,
  },
  error: {
    color: "#fca5a5",
    marginBottom: 10,
  },
};
