// File: src/api/auth.ts
// Auth calls matching flat PHP backend:
//   POST /api/auth/register  → register.php
//   POST /api/auth/login     → login.php
//   GET  /api/auth/me        → me.php
//   POST /api/auth/forgot-password → forgot-password.php

import client from "./client";

export interface AuthUser {
  id: number; name: string; email: string;
  role: "student" | "instructor" | "admin"; avatar?: string | null;
}
export interface AuthResponse { token: string; user: AuthUser; }

export async function register(
  name: string, email: string, password: string,
  role: "student" | "instructor" = "student"
): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/register", { name, email, password, role });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/login", { email, password });
  return res.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await client.get<{ user: AuthUser }>("/auth/me");
  return res.data.user;
}

export async function forgotPassword(email: string): Promise<string> {
  const res = await client.post<{ message: string }>("/auth/forgot-password", { email });
  return res.data.message;
}
