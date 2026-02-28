// src/api/client.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "https://api.handygiditrainingcentre.com/api";

const client = axios.create({
  baseURL: BASE,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

// ── Attach JWT ────────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Method override interceptor ───────────────────────────
// PHP shared hosting blocks DELETE/PUT at server level (405).
// This interceptor automatically converts them to POST + _method
// so every client.delete() / client.put() / client.patch() call
// works without any changes in the dashboard or other components.
client.interceptors.request.use((config) => {
  const method = (config.method ?? "").toUpperCase();
  const isMultipart = (config.headers["Content-Type"] ?? "").includes("multipart");

  if ((method === "DELETE" || method === "PUT" || method === "PATCH") && !isMultipart) {
    // Parse existing body
    let body: Record<string, any> = {};
    if (config.data) {
      try { body = typeof config.data === "string" ? JSON.parse(config.data) : config.data; }
      catch { body = {}; }
    }
    // Inject override
    body._method = method;
    config.method  = "post";
    config.data    = JSON.stringify(body);
    config.headers["Content-Type"]           = "application/json";
    config.headers["X-HTTP-Method-Override"] = method;
  }

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
