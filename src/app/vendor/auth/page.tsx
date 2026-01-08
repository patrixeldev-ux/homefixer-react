"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export default function VendorAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    otp: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    address: "",
    servicesOffered: "",
    licenseNumber: "",
    yearsInBusiness: "",
    website: "",
    bio: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    /* STEP 1: ENTER EMAIL */
    if (step === 1) {
      if (!form.email) {
        setError("Email is required");
        return;
      }
      // TODO: API → send OTP
      console.log("Send OTP to:", form.email);
      alert("OTP sent (demo)");
      setStep(2);
      return;
    }

    /* STEP 2: VERIFY OTP */
    if (step === 2) {
      if (!form.otp) {
        setError("OTP is required");
        return;
      }
      // TODO: API → verify OTP
      console.log("Verify OTP:", form.otp);
      alert("OTP verified (demo)");

      if (mode === "login") {
        router.push("/vendor/dashboard");
      } else {
        setStep(3);
      }
      return;
    }

    /* STEP 3: SIGNUP DETAILS */
    if (step === 3) {
      if (!form.companyName || !form.phone) {
        setError("Company name and phone are required");
        return;
      }
      // TODO: API → create vendor
      console.log("Vendor signup payload:", form);
      alert("Vendor account created (demo)");
      router.push("/vendor/dashboard");
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login"
            ? `Vendor Login - Step ${step}`
            : `Vendor Sign Up - Step ${step}`}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <input
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <input
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
              style={styles.input}
            />
          )}

          {/* STEP 3 (SIGNUP ONLY) */}
          {step === 3 && mode === "signup" && (
            <>
              <input name="companyName" placeholder="Company name" value={form.companyName} onChange={handleChange} style={styles.input} />
              <input name="contactPerson" placeholder="Contact person" value={form.contactPerson} onChange={handleChange} style={styles.input} />
              <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} style={styles.input} />
              <input name="address" placeholder="Business address" value={form.address} onChange={handleChange} style={styles.input} />
              <input name="servicesOffered" placeholder="Services offered" value={form.servicesOffered} onChange={handleChange} style={styles.input} />
              <input name="licenseNumber" placeholder="License number" value={form.licenseNumber} onChange={handleChange} style={styles.input} />
              <input name="yearsInBusiness" placeholder="Years in business" value={form.yearsInBusiness} onChange={handleChange} style={styles.input} />
              <input name="website" placeholder="Website (optional)" value={form.website} onChange={handleChange} style={styles.input} />
              <textarea name="bio" placeholder="Company bio" value={form.bio} onChange={handleChange} style={{ ...styles.input, minHeight: 80 }} />
            </>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" style={styles.primaryBtn}>
            {step < (mode === "login" ? 2 : 3) ? "Next" : mode === "login" ? "Login" : "Create Account"}
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F4F6F8",
  },
  card: {
    width: 380,
    padding: 28,
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center" as const,
    marginBottom: 20,
    color: "#1A73E8",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 14,
    borderRadius: 14,
    border: "1px solid #ddd",
  },
  primaryBtn: {
    width: "100%",
    padding: 12,
    background: "#1A73E8",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
  },
  text: {
    marginTop: 14,
    textAlign: "center" as const,
  },
  link: {
    color: "#1A73E8",
    cursor: "pointer",
  },
};
