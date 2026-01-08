// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://homefixer.patrixel.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* 🔑 ADD THIS INTERCEPTOR */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Exclude auth routes from adding Authorization header
    const isAuthRoute = config.url?.startsWith('/api/auth/login') || config.url?.startsWith('/api/auth/register');

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
