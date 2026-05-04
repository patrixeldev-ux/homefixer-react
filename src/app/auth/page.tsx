"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

type Mode = "login" | "signup";

type ApiError = {
  response?: {
    data?: {
      detail?: string;
      message?: string;
    } | string;
  };
};

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
    role: "CUSTOMER",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* -------- STEP 1 -------- */
    if (step === 1) {
      if (!form.email || !form.email.includes("@")) {
          return setError("Valid email is required");
          }

      setLoading(true);
      console.log("Sending:", { email: form.email });
      try {
        const endpoint =
          mode === "login"
            ? "/api/auth/login/send-otp/"
            : "/api/auth/register/send-otp/";

        await api.post(endpoint, { email: form.email });
        setStep(2);
      } catch (err: unknown) {
            const error = err as ApiError;
            console.log("ERROR:", error.response?.data);
            setError(
              (typeof error.response?.data === "object" &&
                error.response?.data &&
                "message" in error.response.data &&
                typeof error.response.data.message === "string" &&
                error.response.data.message) ||
              JSON.stringify(error.response?.data) ||
              "Something went wrong"
            );
        }
        finally {
        setLoading(false);
      }
      return;
    }

    /* -------- STEP 2 -------- */
    if (step === 2) {
      if (!form.otp) return setError("OTP is required");

      setLoading(true);
      try {
        const endpoint =
          mode === "login"
            ? "/api/auth/login/verify-otp/"
            : "/api/auth/register/verify-otp/";

        const res = await api.post(endpoint, {
          email: form.email,
          otp: form.otp,
        });

        if (res.status === 200)  {
          if (mode === "login") {
            localStorage.setItem("accessToken", res.data.tokens.access);
            localStorage.setItem("refreshToken", res.data.tokens.refresh);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem(
              "role",
              String(res.data.user?.role || "CUSTOMER").toUpperCase()
            );

            router.push("/customer/dashboard");
          } else {
            setStep(3);
          }
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        console.log("VERIFY ERROR:", error.response?.data);
        setError(
          (typeof error.response?.data === "object" &&
            error.response?.data &&
            "detail" in error.response.data &&
            typeof error.response.data.detail === "string" &&
            error.response.data.detail) ||
            "Invalid or expired OTP"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    /* -------- STEP 3 -------- */
    if (step === 3) {
      if (!form.name || !form.phone || !form.password)
        return setError("All fields are required");

      setLoading(true);
      console.log("Submitting register:", form);
      try {
        const res = await api.post("/api/auth/register/complete/", {
          email: form.email,
          name: form.name,
          phone: form.phone,
          password: form.password,
          role: "CUSTOMER",
        });

        // Backend may return { tokens: {...} } or { success: true, tokens: {...} }
        const tokens = res.data?.tokens;
        if (tokens?.access) {
          localStorage.setItem("accessToken", tokens.access);
          localStorage.setItem("refreshToken", tokens.refresh);
          localStorage.setItem("role", "CUSTOMER");
          router.push("/customer/dashboard");
        } else {
          setError("Registration failed. Please try again.");
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        console.log("REGISTER ERROR:", error.response?.data);
        setError(
          (typeof error.response?.data === "object" &&
            error.response?.data &&
            "detail" in error.response.data &&
            typeof error.response.data.detail === "string" &&
            error.response.data.detail) ||
          JSON.stringify(error.response?.data) ||
          "Registration failed"
        );
      } finally {
        setLoading(false);
      }
      return;
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.glassCard}>
        {/* LOGO */}
        <div style={styles.logo}>
          <span style={styles.dIcon}>Home</span>Fixer
        </div>

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
            />
          )}

          {step === 2 && (
            <input
              style={styles.input}
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
            />
          )}

          {step === 3 && mode === "signup" && (
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
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} disabled={loading}>
            {loading
              ? "Please wait..."
              : step < (mode === "login" ? 2 : 3)
              ? "Next"
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* ---------------- STYLES (SAME AS ADMIN) ---------------- */

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
    minHeight: 620,
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

  error: {
    color: "#fca5a5",
    marginBottom: 10,
  },
};
