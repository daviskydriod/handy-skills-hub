// src/api/client.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "https://api.handygiditrainingcentre.com/api";

const client = axios.create({
  baseURL: BASE,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.request.use((config) => {
  const method = (config.method ?? "").toUpperCase();
  if (method !== "DELETE" && method !== "PUT" && method !== "PATCH") return config;
  const contentType = String(config.headers["Content-Type"] ?? "");
  if (contentType.includes("multipart")) return config;

  let body: Record<string, any> = {};
  if (config.data) {
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : { ...config.data }; }
    catch { body = {}; }
  }
  body._method   = method;
  config.method  = "post";
  config.data    = JSON.stringify(body);
  config.headers["Content-Type"]           = "application/json";
  config.headers["X-HTTP-Method-Override"] = method;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNABORTED") err.message = "Request timed out. Please try again.";

    const status = err.response?.status;
    const url    = err.config?.url ?? "";
    const isMe   = url.includes("auth/me") || url.endsWith("/me");

    // Only logout if /auth/me returns 401 (bad/expired token)
    if (status === 401 && isMe) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default client;
