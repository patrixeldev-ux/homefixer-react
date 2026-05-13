"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

<<<<<<< HEAD
// Login is handled by the unified auth page at /auth.
// This page handles admin registration only.
=======
type Mode = "login" | "signup";
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff

export default function AdminAuthPage() {
  const router = useRouter();

<<<<<<< HEAD
  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
=======
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    name: "",
    phone: "",
    password: "",
<<<<<<< HEAD
=======
    role: "admin",
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

<<<<<<< HEAD
    /* STEP 1 — send OTP for registration */
=======
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
    if (step === 1) {
      if (!form.email) return setError("Email is required");
      setLoading(true);
      try {
<<<<<<< HEAD
        await api.post("/auth/register/send-otp", { email: form.email });
        setStep(2);
      } catch {
        setError("Failed to send OTP");
=======
        const endpoint =
          mode === "login"
            ? "/api/auth/login/send-otp"
            : "/api/auth/register/send-otp";
        const res = await api.post(endpoint, { email: form.email });
        if (res.data.success) setStep(2);
      } catch {
        setError("Network error");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      } finally {
        setLoading(false);
      }
      return;
    }

<<<<<<< HEAD
    /* STEP 2 — verify OTP */
=======
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
    if (step === 2) {
      if (!form.otp) return setError("OTP is required");
      setLoading(true);
      try {
<<<<<<< HEAD
        await api.post("/auth/register/verify-otp", {
          email: form.email,
          otp: form.otp,
        });
        setStep(3);
=======
        const endpoint =
          mode === "login"
            ? "/api/auth/login/verify"
            : "/api/auth/register/verify-otp";
        const res = await api.post(endpoint, {
          email: form.email,
          otp: form.otp,
        });
        if (res.data.success) {
          if (mode === "login") {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            router.push("/admin/dashboard");
          } else setStep(3);
        }
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
      } catch {
        setError("Invalid OTP");
      } finally {
        setLoading(false);
      }
      return;
    }

<<<<<<< HEAD
    /* STEP 3 — complete registration */
=======
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
    if (step === 3) {
      if (!form.name || !form.phone || !form.password)
        return setError("All fields required");
      setLoading(true);
      try {
<<<<<<< HEAD
        await api.post("/auth/register/complete", {
=======
        const res = await api.post("/api/auth/register/complete", {
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
          email: form.email,
          name: form.name,
          phone: form.phone,
          password: form.password,
          role: "admin",
        });
<<<<<<< HEAD
        router.push("/admin/dashboard");
=======
        if (res.data.success) router.push("/admin/dashboard");
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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

<<<<<<< HEAD
        <h2 style={styles.title}>Create Admin Account</h2>

        <p style={styles.subtitle}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => router.push("/auth")}>
            Login here
=======
        <h2 style={styles.title}>
          {mode === "login" ? "Welcome Back!" : "Create Account"}
        </h2>

        <p style={styles.subtitle}>
          {mode === "login" ? "Don't have an account? " : "Already have one? "}
          <span
            style={styles.link}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setStep(1);
              setError("");
            }}
          >
            {mode === "login" ? "Sign Up" : "Login"}
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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
<<<<<<< HEAD
              autoFocus
=======
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
            />
          )}

          {step === 2 && (
<<<<<<< HEAD
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
=======
            <input
              style={styles.input}
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
            />
          )}

          {step === 3 && mode === "signup" && (
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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
<<<<<<< HEAD
              : step === 1
              ? "Send OTP →"
              : step === 2
              ? "Verify →"
=======
              : step < (mode === "login" ? 2 : 3)
              ? "Next"
              : mode === "login"
              ? "Sign In"
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
              : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* ---------------- STYLES ---------------- */
const styles: { [key: string]: React.CSSProperties } = {
<<<<<<< HEAD
=======
  /* 🌄 FULL SCREEN BACKGROUND IMAGE */
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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
<<<<<<< HEAD
  glassCard: {
    width: 420,
    minHeight: 560,
=======

  /* 🧊 GLASS FORM */
  glassCard: {
    width: 420,
    minHeight: 620,
>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
    padding: 40,
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    color: "#fff",
  },
<<<<<<< HEAD
=======

>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
<<<<<<< HEAD
=======

>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  dIcon: {
    background: "#4facfe",
    padding: "0 8px",
    borderRadius: 4,
    marginRight: 6,
  },
<<<<<<< HEAD
  title: {
    marginBottom: 6,
  },
=======

  title: {
    marginBottom: 6,
  },

>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  subtitle: {
    color: "#e5e7eb",
    marginBottom: 28,
  },
<<<<<<< HEAD
  link: {
    fontWeight: "bold",
    cursor: "pointer",
    color: "#93c5fd",
  },
=======

  link: {
    fontWeight: "bold",
    cursor: "pointer",
  },

>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    outline: "none",
<<<<<<< HEAD
    boxSizing: "border-box" as const,
  },
=======
  },

>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  eye: {
    position: "absolute",
    right: 14,
    top: 14,
    cursor: "pointer",
  },
<<<<<<< HEAD
=======

>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
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
<<<<<<< HEAD
  back: {
    background: "none",
    border: "none",
    color: "#93c5fd",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    marginBottom: 12,
  },
=======

>>>>>>> 0a0f896ee012e76cbc8d5fdbe69fc242601ec1ff
  error: {
    color: "#fca5a5",
    marginBottom: 10,
  },
};
