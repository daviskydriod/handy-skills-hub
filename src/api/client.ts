// src/api/client.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "https://api.handygiditrainingcentre.com/api";

const client = axios.create({
  baseURL: BASE,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

// ── Attach JWT on every request ───────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Method override — ONLY for DELETE / PUT / PATCH ───────
// Converts them to POST + { _method: "..." } body field.
// GET and POST are NEVER touched by this interceptor.
client.interceptors.request.use((config) => {
  const method = (config.method ?? "").toUpperCase();

  // Only intercept these three — never GET, never POST
  if (method !== "DELETE" && method !== "PUT" && method !== "PATCH") {
    return config;
  }

  // Don't touch multipart/form-data uploads (handled separately)
  const contentType = String(config.headers["Content-Type"] ?? "");
  if (contentType.includes("multipart")) {
    return config;
  }

  // Parse any existing body
  let body: Record<string, any> = {};
  if (config.data) {
    try {
      body = typeof config.data === "string"
        ? JSON.parse(config.data)
        : config.data;
    } catch {
      body = {};
    }
  }

  // Inject _method and convert to POST
  body._method = method;
  config.method  = "post";
  config.data    = JSON.stringify(body);
  config.headers["Content-Type"]           = "application/json";
  config.headers["X-HTTP-Method-Override"] = method;

  return config;
});

// ── Global error handling ─────────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNABORTED") {
      err.message = "Request timed out. Please try again.";
    }
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
