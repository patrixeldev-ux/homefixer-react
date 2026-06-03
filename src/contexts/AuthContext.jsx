import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create the authentication context
const AuthContext = createContext(null);

// Safe helper to decode Google JWT token natively without external library
const decodeGoogleJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("google_user");
    const accessToken = localStorage.getItem("accessToken");
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("google_user");
      }
    }
  }, []);

  /**
   * Sends the Google credential token to the backend, updates local authentication states,
   * and redirects the user based on their assigned role.
   *
   * @param {string} credentialToken Google credential token received from login
   * @param {function} navigate Optional React Router navigate function for SPA transitions
   */
  const loginWithGoogle = async (credentialToken, navigate) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Decode JWT for client-side representation
      const decodedUser = decodeGoogleJwt(credentialToken);
      if (!decodedUser) {
        throw new Error("Unable to decode Google credential token.");
      }

      // Extract requested fields: email, name, picture, and sub (Google user id)
      const frontendUserData = {
        email: decodedUser.email,
        name: decodedUser.name,
        picture: decodedUser.picture,
        sub: decodedUser.sub,
      };

      // 2. Fetch backend base URL configuration (Next.js/Vite environment variables compatibility)
      const rawApiBaseURL =
        (import.meta.env && import.meta.env.VITE_API_URL) ||
        (process.env && process.env.NEXT_PUBLIC_API_URL) ||
        "";

      // Dynamically normalize URL to handle presence or absence of /api suffix
      let cleanBaseURL = rawApiBaseURL.trim();
      if (cleanBaseURL.endsWith("/")) {
        cleanBaseURL = cleanBaseURL.slice(0, -1);
      }

      let requestURL;
      if (cleanBaseURL.endsWith("/api")) {
        requestURL = `${cleanBaseURL}/google-login/`;
      } else {
        requestURL = `${cleanBaseURL}/api/google-login/`;
      }

      // Print the full request URL before the API call
      console.log("[GoogleLogin] Full request URL:", requestURL);
      console.log("[GoogleLogin] Payload:", { token: credentialToken });

      // 3. Send token to backend API endpoint
      const response = await axios.post(
        requestURL,
        { token: credentialToken },
        { headers: { "Content-Type": "application/json" } }
      );

      // Extract tokens and role information from the backend response
      const { tokens, role } = response.data || {};
      const normalizedRole = role ? role.toLowerCase() : "";

      // 4. Save authentication credentials and user profile to localStorage
      if (tokens?.access) {
        localStorage.setItem("accessToken", tokens.access);
      } else if (response.data?.accessToken) {
        // Alternative fallback response shape
        localStorage.setItem("accessToken", response.data.accessToken);
      }

      if (tokens?.refresh) {
        localStorage.setItem("refreshToken", tokens.refresh);
      }

      localStorage.setItem("role", normalizedRole.toUpperCase());
      localStorage.setItem("google_user", JSON.stringify(frontendUserData));

      // 5. Update application React state
      setUser(frontendUserData);

      // 6. Navigate user based on backend role payload
      if (normalizedRole === "customer") {
        if (navigate) navigate("/customer/dashboard");
        else window.location.href = "/customer/dashboard";
      } else if (normalizedRole === "service-man" || normalizedRole === "serviceman") {
        if (navigate) navigate("/service-man/dashboard");
        else window.location.href = "/service-man/dashboard";
      } else {
        // Fallback navigation if role is unspecified
        if (navigate) navigate("/customer/dashboard");
        else window.location.href = "/customer/dashboard";
      }
    } catch (err) {
      console.error("Google Login API Failure:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "An unexpected error occurred during Google authentication.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the user and clear all related authentication details from local storage and React state.
   *
   * @param {function} navigate Optional React Router navigate function for redirects
   */
  const logout = (navigate) => {
    setLoading(true);
    try {
      setUser(null);
      setError(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("google_user");

      if (navigate) navigate("/auth");
      else window.location.href = "/auth";
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume authentication contexts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
