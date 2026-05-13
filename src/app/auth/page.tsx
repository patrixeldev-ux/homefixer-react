"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

// ─── Role → dashboard mapping ─────────────────────────────────────────────────
const ROLE_REDIRECT: Record<string, string> = {
  CUSTOMER:   "/customer/dashboard",
  SERVICEMAN: "/service-man/dashboard",
  VENDOR:     "/vendor/dashboard",
  ADMIN:      "/admin/dashboard",
};

// ─── Role badge config ────────────────────────────────────────────────────────
const ROLE_BADGE: Record<string, { label: string; color: string; icon: string }> = {
  CUSTOMER:   { label: "Customer",   color: "#3b82f6", icon: "🏠" },
  SERVICEMAN: { label: "Serviceman", color: "#22c55e", icon: "🔧" },
  VENDOR:     { label: "Vendor",     color: "#f59e0b", icon: "🏪" },
  ADMIN:      { label: "Admin",      color: "#8b5cf6", icon: "⚙️" },
};

// ─── OTP digit input ──────────────────────────────────────────────────────────
function OTPInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits
        .map((d, i) => (i === idx ? "" : d))
        .join("")
        .trimEnd();
      onChange(next.padEnd(idx, "").slice(0, idx) + "");
      const newVal = [...digits];
      newVal[idx] = "";
      onChange(newVal.join("").replace(/\s/g, ""));
      if (idx > 0) refs.current[idx - 1]?.focus();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const newVal = [...digits];
    newVal[idx] = char;
    const joined = newVal.join("").replace(/\s/g, "");
    onChange(joined);
    if (char && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div style={styles.otpRow}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKey(e, idx)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            ...styles.otpBox,
            borderColor: digits[idx]
              ? "rgba(99,179,237,0.8)"
              : "rgba(255,255,255,0.15)",
            background: digits[idx]
              ? "rgba(59,130,246,0.18)"
              : "rgba(255,255,255,0.06)",
            color: "#fff",
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated background particles ───────────────────────────────────────────
function Particles() {
  return (
    <div style={styles.particlesWrap} aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.particle,
            width:  `${6 + (i % 5) * 4}px`,
            height: `${6 + (i % 5) * 4}px`,
            left:   `${(i * 17 + 8) % 96}%`,
            top:    `${(i * 13 + 5) % 90}%`,
            animationDuration: `${8 + (i % 6) * 3}s`,
            animationDelay:    `${(i * 0.7) % 5}s`,
            opacity:           0.04 + (i % 4) * 0.015,
          }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UnifiedAuthPage() {
  const router  = useRouter();
  const [mounted, setMounted] = useState(false);

  // Step 1 = email, Step 2 = OTP
  const [step,    setStep]    = useState<1 | 2>(1);
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(30);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((v) => {
        if (v <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@"))
      return setError("Enter a valid email address");

    setLoading(true);
    try {
      await api.post("/auth/login/send-otp/", { email });
      setStep(2);
      startCooldown();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      setError(
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to send OTP. Check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP → detect role → redirect ─────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length < 6) return setError("Enter the complete 6-digit OTP");

    setLoading(true);
    try {
      const res = await api.post("/auth/login/verify-otp/", { email, otp });

      const tokens = res.data?.tokens;
      if (!tokens?.access) throw new Error("Invalid response from server");

      localStorage.setItem("accessToken",  tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);

      // Detect role from multiple possible response shapes
      const rawRole: string =
        res.data?.role ||
        res.data?.user?.role ||
        res.data?.user_type ||
        (() => {
          try {
            const payload = JSON.parse(atob(tokens.access.split(".")[1]));
            return payload.role || payload.user_type || "";
          } catch { return ""; }
        })();

      const role = String(rawRole).toUpperCase();
      localStorage.setItem("role", role);
      setDetectedRole(role);

      // Brief role flash, then redirect
      await new Promise((r) => setTimeout(r, 600));

      const redirect = ROLE_REDIRECT[role] || "/customer/dashboard";
      router.push(redirect);

    } catch (err: unknown) {
      const e = err as {
        message?: string;
        response?: { data?: { detail?: string; message?: string } };
      };
      setError(
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setOtp("");
    setLoading(true);
    try {
      await api.post("/auth/login/send-otp/", { email });
      startCooldown();
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const roleBadge = detectedRole ? ROLE_BADGE[detectedRole] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-18px) rotate(3deg); }
          66%       { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
          70%  { box-shadow: 0 0 0 14px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%       { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        .auth-input:focus {
          outline: none;
          border-color: rgba(99,179,237,0.7) !important;
          background: rgba(59,130,246,0.1) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.3); }
        .auth-input { transition: all 0.2s ease; }

        .send-btn {
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }
        .send-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(59,130,246,0.45);
        }
        .send-btn:not(:disabled):active { transform: translateY(0); }

        .back-link:hover { color: #93c5fd !important; }

        .register-link:hover { color: #bfdbfe !important; }
      `}</style>

      <main style={styles.page}>
        <Particles />

        {/* Decorative blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.blob3} />

        {/* Grid overlay */}
        <div style={styles.gridOverlay} />

        {/* Card */}
        <div style={styles.card}>

          {/* Top glow bar */}
          <div style={styles.topGlow} />

          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>🏠</div>
            <span style={styles.logoText}>
              Home<span style={styles.logoAccent}>Fixer</span>
            </span>
          </div>

          {/* ── Role flash (brief visible confirmation) ── */}
          {detectedRole && roleBadge && (
            <div style={{
              ...styles.roleBadge,
              borderColor: `${roleBadge.color}55`,
              background:  `${roleBadge.color}18`,
            }}>
              <span>{roleBadge.icon}</span>
              <span style={{ color: roleBadge.color, fontWeight: 700 }}>
                {roleBadge.label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                detected · redirecting…
              </span>
            </div>
          )}

          {/* ── STEP 1: EMAIL ── */}
          {step === 1 && (
            <div style={styles.stepWrap}>
              <div style={styles.headingRow}>
                <h1 style={styles.heading}>Welcome back</h1>
                <p style={styles.subheading}>
                  Sign in with your email — works for all roles
                </p>
              </div>

              {/* Role pills (cosmetic, shows all supported roles) */}
              <div style={styles.rolePills}>
                {Object.entries(ROLE_BADGE).map(([, cfg]) => (
                  <span key={cfg.label} style={{
                    ...styles.pill,
                    borderColor: `${cfg.color}40`,
                    color: cfg.color,
                  }}>
                    {cfg.icon} {cfg.label}
                  </span>
                ))}
              </div>

              <form onSubmit={handleSendOtp} style={styles.form}>
                <label style={styles.label}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  className="auth-input"
                  style={styles.input}
                  autoFocus
                  autoComplete="email"
                />

                {error && <ErrorBox msg={error} />}

                <button
                  type="submit"
                  disabled={loading}
                  className="send-btn"
                  style={styles.btn}
                >
                  {loading ? (
                    <Spinner />
                  ) : (
                    <>Send OTP <span style={{ marginLeft: 6 }}>→</span></>
                  )}
                </button>
              </form>

              <p style={styles.registerHint}>
                Don't have an account?{" "}
                <span
                  className="register-link"
                  style={styles.registerLink}
                  onClick={() => router.push("/choose-role?mode=register")}
                >
                  Register here
                </span>
              </p>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <div style={styles.stepWrap}>
              <div style={styles.headingRow}>
                <div style={styles.otpIconWrap}>
                  <span style={styles.otpIcon}>✉️</span>
                </div>
                <h1 style={styles.heading}>Check your inbox</h1>
                <p style={styles.subheading}>
                  We sent a 6-digit code to
                </p>
                <p style={styles.emailDisplay}>{email}</p>
              </div>

              <form onSubmit={handleVerifyOtp} style={styles.form}>
                <label style={styles.label}>Enter OTP</label>
                <OTPInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />

                {error && <ErrorBox msg={error} />}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="send-btn"
                  style={{
                    ...styles.btn,
                    opacity: otp.length < 6 && !loading ? 0.5 : 1,
                    animation: otp.length === 6 && !loading ? "pulse-ring 1.5s ease-out 1" : "none",
                  }}
                >
                  {loading ? (
                    detectedRole ? (
                      <>
                        <Spinner />
                        <span style={{ marginLeft: 8 }}>Redirecting…</span>
                      </>
                    ) : (
                      <Spinner />
                    )
                  ) : (
                    <>Verify & Sign In <span style={{ marginLeft: 6 }}>→</span></>
                  )}
                </button>
              </form>

              {/* Resend + back row */}
              <div style={styles.otpFooter}>
                <button
                  onClick={() => { setStep(1); setOtp(""); setError(""); }}
                  className="back-link"
                  style={styles.backLink}
                >
                  ← Change email
                </button>

                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    ...styles.resendBtn,
                    opacity: resendCooldown > 0 ? 0.5 : 1,
                    cursor:  resendCooldown > 0 ? "default" : "pointer",
                  }}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p style={styles.footer}>
            Secure · Encrypted · No passwords stored
          </p>
        </div>
      </main>
    </>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 18, height: 18,
      border: "2.5px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin-slow 0.7s linear infinite",
    }} />
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={styles.errorBox}>
      <span style={{ fontSize: 14 }}>⚠️</span>
      <span>{msg}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #060d1f 0%, #0b1735 40%, #0f1f4a 70%, #071124 100%)",
    fontFamily: "'Sora', sans-serif",
    padding: "24px 16px",
  },

  // ── Background decorations ──
  particlesWrap: {
    position: "absolute", inset: 0, pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    borderRadius: "50%",
    background: "radial-gradient(circle, #60a5fa, transparent)",
    animation: "float linear infinite",
  },
  blob1: {
    position: "absolute", width: 520, height: 520,
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
    top: "-160px", left: "-180px",
    animation: "blob 14s ease-in-out infinite",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute", width: 400, height: 400,
    borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
    background: "radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)",
    bottom: "-100px", right: "-120px",
    animation: "blob 18s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  blob3: {
    position: "absolute", width: 280, height: 280,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.07), transparent 70%)",
    top: "55%", left: "60%",
    animation: "blob 22s ease-in-out infinite",
    pointerEvents: "none",
  },
  gridOverlay: {
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage:
      "linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), " +
      "linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
  },

  // ── Card ──
  card: {
    position: "relative",
    width: "100%", maxWidth: 440,
    borderRadius: 24,
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow:
      "0 32px 80px rgba(0,0,0,0.55), " +
      "inset 0 1px 0 rgba(255,255,255,0.10)",
    padding: "40px 36px 32px",
    color: "#fff",
    zIndex: 10,
  },
  topGlow: {
    position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
    background: "linear-gradient(90deg, transparent, rgba(99,179,237,0.7), transparent)",
    borderRadius: "50%",
  },

  // ── Logo ──
  logoRow: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 28,
  },
  logoIcon: {
    width: 38, height: 38,
    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
  },
  logoText: {
    fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px",
    color: "#fff",
  },
  logoAccent: { color: "#60a5fa" },

  // ── Role badge (post-login flash) ──
  roleBadge: {
    display: "flex", alignItems: "center", gap: 8,
    border: "1px solid",
    borderRadius: 10, padding: "8px 12px",
    marginBottom: 20, fontSize: 13, fontWeight: 500,
    animation: "fadeSlideUp 0.3s ease",
  },

  // ── Step wrapper ──
  stepWrap: { animation: "fadeSlideUp 0.35s ease" },

  // ── Heading ──
  headingRow: { marginBottom: 24 },
  heading: {
    fontSize: 26, fontWeight: 800, margin: 0, marginBottom: 6,
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #fff 30%, #93c5fd)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subheading: {
    fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0,
  },

  // ── Role pills ──
  rolePills: {
    display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 24,
  },
  pill: {
    fontSize: 11, fontWeight: 600,
    padding: "4px 10px", borderRadius: 20,
    border: "1px solid",
    background: "rgba(255,255,255,0.04)",
    letterSpacing: "0.3px",
  },

  // ── Form ──
  form: { display: "flex", flexDirection: "column" as const, gap: 0 },
  label: {
    fontSize: 12, fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.8px", textTransform: "uppercase" as const,
    marginBottom: 8, display: "block",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 15,
    fontFamily: "'Sora', sans-serif",
    marginBottom: 16,
    boxSizing: "border-box" as const,
  },

  // ── OTP ──
  otpIconWrap: {
    fontSize: 36, marginBottom: 12, display: "block",
    animation: "float 4s ease-in-out infinite",
  },
  otpIcon: { display: "block" },
  emailDisplay: {
    fontSize: 14, fontWeight: 600,
    color: "#60a5fa", marginTop: 2, margin: 0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  otpRow: {
    display: "flex", gap: 8, justifyContent: "space-between",
    marginBottom: 16,
  },
  otpBox: {
    width: 48, height: 56,
    textAlign: "center" as const,
    fontSize: 22, fontWeight: 700,
    borderRadius: 10,
    border: "1.5px solid",
    outline: "none",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.15s ease",
    caretColor: "#60a5fa",
  },

  // ── Button ──
  btn: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontSize: 15, fontWeight: 700,
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 4,
    fontFamily: "'Sora', sans-serif",
    letterSpacing: "0.2px",
    marginTop: 4,
  },

  // ── Error ──
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10, padding: "10px 14px",
    color: "#fca5a5", fontSize: 13,
    marginBottom: 12,
    animation: "fadeSlideUp 0.25s ease",
  },

  // ── OTP footer ──
  otpFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 16,
  },
  backLink: {
    background: "none", border: "none",
    color: "rgba(255,255,255,0.4)",
    fontSize: 13, cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    transition: "color 0.15s",
    padding: 0,
  },
  resendBtn: {
    background: "none", border: "none",
    color: "#60a5fa",
    fontSize: 13, fontWeight: 600,
    fontFamily: "'Sora', sans-serif",
    padding: 0, transition: "opacity 0.2s",
  },

  // ── Register hint ──
  registerHint: {
    textAlign: "center" as const,
    color: "rgba(255,255,255,0.35)",
    fontSize: 13, marginTop: 20,
  },
  registerLink: {
    color: "#60a5fa", fontWeight: 600,
    cursor: "pointer",
    transition: "color 0.15s",
  },

  // ── Footer ──
  footer: {
    textAlign: "center" as const,
    color: "rgba(255,255,255,0.18)",
    fontSize: 11, marginTop: 28, letterSpacing: "0.5px",
  },
};
