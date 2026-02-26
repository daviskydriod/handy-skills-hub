
// File: src/api/courses.ts
// Course calls matching flat PHP backend:
//   GET    /api/courses          → courses-list.php
//   GET    /api/courses/{id}     → show.php
//   POST   /api/courses          → create.php      (multipart)
//   PUT    /api/courses/{id}     → update.php      (JSON)
//   DELETE /api/courses/{id}     → delete.php

import client from "./client";

export interface Course {
  id: number; title: string; description: string; category: string;
  category_id?: number; price: number; rating: number; lessons: number;
  enrolled: number; instructor: string; instructor_id: number;
  image: string | null; is_published: boolean; sponsored: boolean;
  duration?: string; created_at?: string;
}

export interface CoursesResponse {
  courses: Course[]; total: number; page: number;
  limit: number; total_pages: number;
}

export interface CoursesFilter {
  category?: string; search?: string;
  sort?: "default" | "rating" | "price-asc" | "price-desc";
  page?: number; limit?: number;
}

export async function getCourses(filter: CoursesFilter = {}): Promise<CoursesResponse> {
  const res = await client.get<CoursesResponse>("/courses", { params: filter });
  return res.data;
}

export async function getCourse(id: number): Promise<Course> {
  const res = await client.get<{ course: Course }>(`/courses/${id}`);
  return res.data.course;
}

export async function createCourse(formData: FormData): Promise<{ id: number }> {
  const res = await client.post<{ id: number }>("/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateCourse(id: number, data: Record<string, any>): Promise<void> {
  await client.put(`/courses/${id}`, data);
}

export async function updateCourseWithFile(id: number, formData: FormData): Promise<void> {
  // PHP flat backend: POST with ?_method=PUT for multipart updates
  await client.post(`/courses/${id}?_method=PUT`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteCourse(id: number): Promise<void> {
  await client.delete(`/courses/${id}`);
}
