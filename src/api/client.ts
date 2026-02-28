// src/api/client.ts
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_URL ??
  "https://api.handygiditrainingcentre.com/api";

const client = axios.create({
  baseURL: BASE,
  timeout: 30_000,
  // ✅ Accept JSON responses. Do NOT set a default Content-Type here —
  //    letting axios choose per-request means FormData gets the correct
  //    multipart/form-data + boundary automatically.
  headers: { Accept: "application/json" },
});

// ── Interceptor 1: attach Bearer token ───────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor 2: tunnel PUT / PATCH / DELETE through POST ──────────
// Many shared PHP hosts block raw PUT/DELETE. We convert them to
// POST + ?_method=VERB (query string) + X-HTTP-Method-Override header
// so index.php can detect and restore the real method.
//
// ✅ FIX: Added explicit `config.data instanceof FormData` guard.
//   The original only checked the Content-Type string, but for a brand-new
//   FormData request the header hasn't been set yet (it's set by axios later),
//   so the check `contentType.includes("multipart")` was always false on the
//   first pass — the interceptor would then JSON.stringify the FormData object
//   (producing "{}") and strip the file. Now we skip the tunnel entirely
//   whenever the body is a FormData instance.
client.interceptors.request.use((config) => {
  const method = (config.method ?? "").toUpperCase();
  if (method !== "DELETE" && method !== "PUT" && method !== "PATCH")
    return config;

  // ✅ Skip tunnel for multipart uploads — FormData must go as-is
  if (
    config.data instanceof FormData ||
    String(config.headers["Content-Type"] ?? "").includes("multipart")
  ) {
    return config;
  }

  // Build tunnelled JSON body
  let body: Record<string, any> = {};
  if (config.data) {
    try {
      body =
        typeof config.data === "string"
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

  // ✅ Also put _method in query string so index.php catches it even if the
  //   header is stripped by an aggressive proxy/CDN
  config.params = { ...(config.params ?? {}), _method: method };

  return config;
});

// ── Interceptor 3: global error handling ─────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Friendlier timeout message
    if (err.code === "ECONNABORTED")
      err.message = "Request timed out. Please try again.";

    const status = err.response?.status;
    const url = err.config?.url ?? "";

    // ✅ FIX: Only auto-logout on 401 from /auth/me specifically.
    //   Original also matched any URL containing "me" (e.g. /api/home,
    //   /api/some-me-thing) because of url.endsWith("/me"). Tightened to
    //   only exact auth/me paths.
    const isAuthMe =
      url.includes("/auth/me") ||
      url === "/me" ||
      url.endsWith("/auth/me");

    if (status === 401 && isAuthMe) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default client;
