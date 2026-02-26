// File: src/api/client.ts
// Axios instance — points to flat PHP backend at api subdomain.
// Set VITE_API_URL=https://api.handygiditrainingcentre.com in Vercel env vars.

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.handygiditrainingcentre.com";

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("hg_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hg_token");
      localStorage.removeItem("hg_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
