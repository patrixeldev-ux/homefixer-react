import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // ✅ Guard: localStorage only exists in browser
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Guard: window only exists in browser
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath === "/auth" ||
        currentPath === "/service-man" ||
        currentPath === "/vendor" ||
        currentPath === "/customer-auth" ||
        currentPath.startsWith("/service-man/auth") ||
        currentPath.startsWith("/vendor/auth");
        currentPath.startsWith("/customer-auth");

      if (!isAuthPage) {
        const role = localStorage.getItem("role");
        localStorage.clear();
        if (role === "SERVICEMAN") window.location.href = "/service-man";
        else if (role === "VENDOR") window.location.href = "/vendor";
        else window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;