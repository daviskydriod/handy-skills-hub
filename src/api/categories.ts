// File: src/api/categories.ts
// Categories call matching flat PHP backend:
//   GET /api/categories → categories.php

import client from "./client";

export interface Category {
  id: number; name: string; icon: string; course_count: number;
}

export async function getCategories(): Promise<Category[]> {
  const res = await client.get<{ categories: Category[] }>("/categories");
  return res.data.categories;
}
