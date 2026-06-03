import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";

/**
 * Reusable Google Login Button and Profile Component.
 * Integrates Google authentication and shows the authenticated user's card
 * with email, name, profile image, and a logout option.
 */
export default function GoogleLoginButton() {
  const { user, loading, error, loginWithGoogle, logout } = useAuth();

  // Attempt to use react-router-dom if it is available in the environment
  let navigate = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routerDom = require("react-router-dom");
    if (routerDom && routerDom.useNavigate) {
      navigate = routerDom.useNavigate();
    }
  } catch (e) {
    // Fallback if not inside a React Router context or package is missing
  }

  const handleSuccess = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      try {
        await loginWithGoogle(credentialResponse.credential, navigate);
      } catch (err) {
        console.error("Authentication failed:", err);
      }
    }
  };

  const handleError = () => {
    console.error("Google OAuth initialization or interaction failed.");
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {/* ─── ERROR STATE ─── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-4 mb-4 text-sm animate-fade-in">
          <svg
            className="w-5 h-5 flex-shrink-0 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ─── LOADING STATE ─── */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-sm text-slate-300 font-medium tracking-wide">
            Authenticating with Google...
          </p>
        </div>
      )}

      {/* ─── AUTHENTICATED STATE ─── */}
      {!loading && user && (
        <div className="group relative overflow-hidden bg-slate-950/65 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all duration-300 hover:shadow-blue-500/5">
          {/* Top glow indicator */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          {/* User profile image */}
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-blue-500/80 shadow-lg shadow-blue-500/10 transition-transform duration-300 group-hover:scale-105">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || "User Avatar"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>

          {/* User Name & Email */}
          <h3 className="mt-4 text-xl font-bold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
            {user.name}
          </h3>
          <p className="mt-1 text-sm text-slate-400 font-mono select-all">
            {user.email}
          </p>

          {/* Roles indicator */}
          <div className="mt-4 inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Signed In via Google
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => logout(navigate)}
            className="mt-6 w-full py-3 px-5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 active:scale-[0.98] rounded-2xl shadow-lg shadow-red-950/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* ─── UNAUTHENTICATED STATE ─── */}
      {!loading && !user && (
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-950/40 backdrop-blur-lg border border-white/5 rounded-3xl shadow-xl transition-all duration-300">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white">Social Access</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
              Access your customer or service dashboard securely using Google Login
            </p>
          </div>

          {/* Official Google login render button */}
          <div className="w-full flex justify-center GoogleButtonWrapper hover:scale-[1.01] transition-transform duration-200">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_blue"
              shape="pill"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>
        </div>
      )}
    </div>
  );
}
