// src/api/client.ts
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_URL ??
  "https://api.handygiditrainingcentre.com/api";

const client = axios.create({
  baseURL: BASE,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

// ── Interceptor 1: attach Bearer token ───────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("hg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor 2: tunnel PUT / PATCH / DELETE through POST ──────────
client.interceptors.request.use((config) => {
  const method = (config.method ?? "").toUpperCase();
  if (method !== "DELETE" && method !== "PUT" && method !== "PATCH")
    return config;

  if (
    config.data instanceof FormData ||
    String(config.headers["Content-Type"] ?? "").includes("multipart")
  ) {
    return config;
  }

  let body: Record<string, any> = {};
  if (config.data) {
    try {
      body = typeof config.data === "string"
        ? JSON.parse(config.data)
        : { ...config.data };
    } catch {
      body = {};
    }
  }
  body._method = method;
  config.method = "post";
  config.data = JSON.stringify(body);
  config.headers["Content-Type"] = "application/json";
  config.headers["X-HTTP-Method-Override"] = method;
  config.params = { ...(config.params ?? {}), _method: method };
  return config;
});

// ── Interceptor 3: global error handling ─────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNABORTED")
      err.message = "Request timed out. Please try again.";
    const status = err.response?.status;
    const url = err.config?.url ?? "";
    const isAuthMe =
      url.includes("/auth/me") ||
      url === "/me" ||
      url.endsWith("/auth/me");
    if (status === 401 && isAuthMe) {
      localStorage.removeItem("hg_token");
      localStorage.removeItem("hg_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
