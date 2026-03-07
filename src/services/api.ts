import axios, { type AxiosError } from "axios";
import { useUserStore } from "@/stores/userStore";

/**
 * Axios instance pre-configured for the Loomora backend.
 * - Attaches JWT automatically on every request (Zustand > localStorage fallback).
 * - Auto-logouts the user + redirects to /auth on HTTP 401.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ── Request interceptor: attach bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  // Prefer the in-memory Zustand token; fall back to localStorage for cases
  // where the store has not been hydrated yet (e.g. first load).
  const token =
    useUserStore.getState().jwtToken ??
    (typeof window !== "undefined"
      ? localStorage.getItem("jwt_token")
      : null);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
