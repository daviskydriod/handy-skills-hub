// src/api/auth.ts
// Auth calls matching flat PHP backend:
//   POST /api/auth/register         → register.php
//   POST /api/auth/login            → login.php
//   GET  /api/auth/me               → me.php
//   POST /api/auth/forgot-password  → forgot-password.php
//   POST /api/auth/reset-password   → reset-password.php

import client from "./client";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: "student" | "instructor" = "student"
): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
    role,
  });

  // ✅ FIX: Guard against unexpected response shapes.
  //   If the PHP backend returns { token, user } or just { token } with user
  //   data at the top level, normalise it so AuthContext never gets undefined.
  const data = res.data as any;
  return {
    token: data.token,
    user: data.user ?? {
      id:    data.id,
      name:  data.name,
      email: data.email,
      role:  data.role,
    },
  };
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  // ✅ FIX: Same shape guard as register — some PHP login handlers return
  //   the user fields at the top level rather than nested under "user".
  const data = res.data as any;
  return {
    token: data.token,
    user: data.user ?? {
      id:    data.id,
      name:  data.name,
      email: data.email,
      role:  data.role,
    },
  };
}

export async function getMe(): Promise<AuthUser> {
  const res = await client.get<{ user: AuthUser } | AuthUser>("/auth/me");

  // ✅ FIX: Handle both { user: {...} } and the user object returned directly.
  //   If the backend ever returns the user at the root level instead of nested,
  //   the old code would return undefined (res.data.user) silently, causing
  //   AuthContext to show the user as logged-out even with a valid token.
  const data = res.data as any;
  return data.user ?? data;
}

export async function forgotPassword(email: string): Promise<string> {
  const res = await client.post<{ message: string }>(
    "/auth/forgot-password",
    { email }
  );
  // ✅ FIX: Guard — return empty string instead of crashing if message missing
  return res.data.message ?? "";
}

export async function resetPassword(
  token: string,
  password: string
): Promise<string> {
  const res = await client.post<{ message: string }>(
    "/auth/reset-password",
    { token, password }
  );
  return res.data.message ?? "";
}
