"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

type Mode = "login" | "signup";

export default function CustomerAuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    otp: "",
    name: "",
    phone: "",
    password: "",
    role: "customer",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* ---------------- STEP 1: SEND OTP ---------------- */
    if (step === 1) {
      if (!form.email) {
        setError("Email is required");
        return;
      }

      setLoading(true);
      try {
        const endpoint =
          mode === "login"
            ? "/api/auth/login/send-otp"
            : "/api/auth/register/send-otp";

        const res = await api.post(endpoint, { email: form.email });

        if (res.data.success) {
          setStep(2);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("User not found. Please sign up.");
        } else if (err.response?.status === 422) {
          const msg = err.response.data.message;
          if (mode === "signup") {
            setError("Email already registered. Please login.");
            setMode("login");
            setStep(1);
          } else {
            setError(msg);
          }
        } else {
          setError("Network error");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    /* ---------------- STEP 2: VERIFY OTP ---------------- */
    if (step === 2) {
      if (!form.otp) {
        setError("OTP is required");
        return;
      }

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
            router.push("/customer/booking");
          } else {
            setStep(3);
          }
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Invalid or expired OTP"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    /* ---------------- STEP 3: COMPLETE REGISTRATION ---------------- */
    if (step === 3) {
      if (!form.name || !form.phone || !form.password) {
        setError("All fields are required");
        return;
      }

      setLoading(true);
      try {
        const res = await api.post("/api/auth/register/complete", {
          email: form.email,
          name: form.name,
          phone: form.phone,
          password: form.password,
          role: form.role,
        });

        if (res.data.success) {
          router.push("/customer/booking");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    }
  }

  const renderFields = () => {
    if (step === 1)
      return (
        <input
          name="email"
          type="email"
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
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
        </>
      );
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login" ? "Login" : "Register"} – Step {step}
        </h2>

        <form onSubmit={handleSubmit}>
          {renderFields()}
          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.btn} disabled={loading}>
            {loading ? "Please wait..." : step < 3 ? "Next" : "Register"}
          </button>
        </form>

        <p style={styles.text}>
          {mode === "login" ? "No account? " : "Already have an account? "}
          <span
            style={styles.link}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setStep(1);
              setError("");
            }}
          >
            {mode === "login" ? "Sign up" : "Login"}
          </span>
        </p>
      </div>
    </main>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
  },
  card: {
    width: 360,
    padding: 28,
    background: "#fff",
    borderRadius: 16,
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
    borderRadius: 10,
    border: "1px solid #ccc",
  },
  btn: {
    width: "100%",
    padding: 12,
    background: "#1E88E5",
    color: "#fff",
    border: "none",
    borderRadius: 12,
  },
  error: {
    color: "red",
    marginBottom: 10,
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
