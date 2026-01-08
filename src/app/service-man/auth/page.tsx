"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

type Mode = "login" | "signup";

export default function ServiceManPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    otp: "",
    fullName: "",
    phone: "",
    address: "",
    skills: "",
    yearsExperience: "",
    availability: "",
    bio: "",
    password: "", // ✅ USER WILL SET PASSWORD
    role: "serviceman",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* ---------- STEP 1: SEND OTP ---------- */
    if (step === 1) {
      if (!form.email) return setError("Email is required");

      setLoading(true);
      try {
        const endpoint =
          mode === "login"
            ? "/api/auth/login/send-otp"
            : "/api/auth/register/send-otp";

        await api.post(endpoint, { email: form.email });
        setStep(2);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("User not found. Please sign up.");
        } else if (err.response?.status === 422 && mode === "signup") {
          setError("Email already registered. Please login.");
          setMode("login");
          setStep(1);
        } else {
          setError("Network error");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    /* ---------- STEP 2: VERIFY OTP ---------- */
    if (step === 2) {
      if (!form.otp) return setError("OTP is required");

      setLoading(true);
      try {
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
            router.push("/service-man/dashboard");
          } else {
            setStep(3);
          }
        }
      } catch (err: any) {
        setError("Invalid or expired OTP");
      } finally {
        setLoading(false);
      }
      return;
    }

    /* ---------- STEP 3: COMPLETE SIGNUP ---------- */
    if (step === 3) {
      if (!form.fullName || !form.phone || !form.password) {
        return setError("Name, phone and password are required");
      }

      setLoading(true);
      try {
        const res = await api.post("/api/auth/register/complete", {
          email: form.email,
          name: form.fullName,
          phone: form.phone,
          password: form.password, // ✅ USER PASSWORD
          role: "serviceman",
        });

        if (res.data.success) {
          router.push("/service-man/dashboard");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    }
  }

  const renderStep = () => {
    if (step === 1)
      return (
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />
      );

    if (step === 2)
      return (
        <input
          name="otp"
          placeholder="Enter OTP"
          value={form.otp}
          onChange={handleChange}
          style={styles.input}
        />
      );

    if (step === 3 && mode === "signup")
      return (
        <>
          <input
            name="fullName"
            placeholder="Full name"
            value={form.fullName}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
        </>
      );
  };

  if (!mounted) return null;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login"
            ? `Service Man Login - Step ${step}`
            : `Service Man Signup - Step ${step}`}
        </h2>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button style={styles.primaryBtn} disabled={loading}>
            {loading ? "Please wait..." : "Next"}
          </button>
        </form>

        <p style={styles.text}>
          {mode === "login" ? "No account? " : "Already have account? "}
          <span
            style={styles.link}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setStep(1);
              setError("");
            }}
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </span>
        </p>
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
    background: "#F5F7FA",
  },
  card: {
    width: 360,
    padding: 28,
    background: "#fff",
    borderRadius: 18,
  },
  title: {
    textAlign: "center" as const,
    marginBottom: 20,
    color: "#1E88E5",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
    border: "1px solid #ccc",
  },
  primaryBtn: {
    width: "100%",
    padding: 12,
    background: "#1E88E5",
    color: "#fff",
    border: "none",
    borderRadius: 14,
  },
  text: {
    marginTop: 14,
    textAlign: "center" as const,
  },
  link: {
    color: "#1E88E5",
    cursor: "pointer",
  },
};
