"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // for redirect

type Mode = "login" | "signup";

export default function ServiceManPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState(1);
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
  });
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Step 1: Enter Email
    if (step === 1) {
      if (!form.email) {
        setError("Email is required.");
        return;
      }
      // TODO: Call API to send OTP
      console.log("Send OTP to:", form.email);
      alert("OTP sent! (demo)");
      setStep(2);
      return;
    }

    // Step 2: Enter OTP
    if (step === 2) {
      if (!form.otp) {
        setError("OTP is required.");
        return;
      }
      // TODO: Call API to verify OTP
      console.log("Verify OTP for:", form.email, form.otp);
      alert("OTP verified! (demo)");
      if (mode === "login") {
        // Redirect to dashboard
        router.push("/service-man/dashboard");
      } else {
        setStep(3); // Signup continues to user info
      }
      return;
    }

    // Step 3: Signup final info
    if (step === 3) {
      if (!form.fullName || !form.phone) {
        setError("Full name and phone are required.");
        return;
      }
      // TODO: Call API to create service man
      console.log("Signup payload:", form);
      alert("Account created! (demo)");
      router.push("/service-man/dashboard");
      return;
    }
  }

  const renderStep = () => {
    if (step === 1) {
      return (
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />
      );
    }
    if (step === 2) {
      return (
        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          value={form.otp}
          onChange={handleChange}
          style={styles.input}
        />
      );
    }
    if (step === 3 && mode === "signup") {
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
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="skills"
            placeholder="Skills (comma separated)"
            value={form.skills}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="yearsExperience"
            placeholder="Years of experience"
            value={form.yearsExperience}
            onChange={handleChange}
            style={styles.input}
          />
          <select
            name="availability"
            value={form.availability}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Select availability</option>
            <option value="full-time">Full time</option>
            <option value="part-time">Part time</option>
            <option value="weekends">Weekends</option>
          </select>
          <textarea
            name="bio"
            placeholder="Short bio / description"
            value={form.bio}
            onChange={handleChange}
            style={{ ...styles.input, minHeight: 80, resize: "vertical" as const }}
          />
        </>
      );
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login"
            ? `Service Man Login - Step ${step}`
            : `Sign Up - Step ${step}`}
        </h2>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          {error && <p style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</p>}

          <button type="submit" style={styles.primaryBtn}>
            {step < (mode === "login" ? 2 : 3) ? "Next" : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <p style={styles.text}>
          {mode === "login" ? "Don’t have an account? " : "Already have an account? "}
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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8F9FA",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    width: "360px",
    padding: "28px",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center" as const,
    marginBottom: "20px",
    color: "#1E88E5",
    fontSize: "22px",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#1E88E5",
    color: "#ffffff",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "15px",
  },
  text: {
    marginTop: "14px",
    textAlign: "center" as const,
    fontSize: "14px",
    color: "#555",
  },
  link: {
    color: "#1E88E5",
    cursor: "pointer",
    fontWeight: 500,
  },
};
