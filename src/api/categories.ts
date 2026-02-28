// src/api/categories.ts
// Categories call matching flat PHP backend:
//   GET /api/categories → categories.php

import client from "./client";

export interface Category {
  id: number;
  name: string;
  icon: string;
  course_count: number;
}

/**
 * Fetch all course categories.
 *
 * ✅ FIX: Added response shape guard.
 *   If the backend returns { data: [...] } or a bare array instead of
 *   { categories: [...] }, the original would crash with
 *   "Cannot read properties of undefined (reading 'map')".
 *   Now we normalise all shapes to a safe empty array as fallback.
 */
export async function getCategories(): Promise<Category[]> {
  const res = await client.get("/categories");
  const data = res.data as any;

  const raw: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.categories)
    ? data.categories
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return raw as Category[];
}
