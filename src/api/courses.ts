// File: src/api/courses.ts
// Course calls matching flat PHP backend:
//   GET    /api/courses          → courses-list.php
//   GET    /api/courses/{id}     → show.php
//   POST   /api/courses          → create.php      (multipart/form-data)
//   PUT    /api/courses/{id}     → update.php      (JSON)
//   POST   /api/courses/{id}?_method=PUT → update.php (multipart with file)
//   DELETE /api/courses/{id}     → delete.php

import client from "./client";

// ── Lesson inside a Module ───────────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}

// ── Module inside a Part ─────────────────────────────────────────────
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

// ── Part (top-level content block) ──────────────────────────────────
export interface CoursePart {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}

// ── Parsed course content ────────────────────────────────────────────
export interface CourseContent {
  parts: CoursePart[];
}

// ── Main Course model ────────────────────────────────────────────────
export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  category_id?: number;
  price: number;
  rating: number;
  lessons: number;
  enrolled: number;
  instructor: string;
  instructor_id: number;
  image: string | null;
  thumbnail: string | null;
  is_published: boolean;
  sponsored: boolean;
  duration?: string;
  created_at?: string;
  updated_at?: string;
  /** Parsed from the `content` JSON column — Parts → Modules → Lessons */
  content?: CourseContent;
}

// ── List response ────────────────────────────────────────────────────
export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ── Filter params ────────────────────────────────────────────────────
export interface CoursesFilter {
  category?: string;
  search?: string;
  sort?: "default" | "rating" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

// ── Helper: safely parse content JSON from the API ───────────────────
function parseCourseContent(raw: unknown): CourseContent | undefined {
  if (!raw) return undefined;
  if (typeof raw === "object") return raw as CourseContent;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as CourseContent;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function hydrateCourse(c: any): Course {
  return { ...c, content: parseCourseContent(c.content) };
}

// ── API calls ────────────────────────────────────────────────────────

/** List courses (with optional filters) */
export async function getCourses(
  filter: CoursesFilter = {}
): Promise<CoursesResponse> {
  // Build clean params — strip anything falsy or "default"
  // so the backend never receives sort=default, category=, search=, etc.
  const params: Record<string, any> = {};

  if (filter.category) params.category = filter.category;
  if (filter.search)   params.search   = filter.search;
  if (filter.page)     params.page     = filter.page;
  if (filter.limit)    params.limit    = filter.limit;

  // ✅ Only send sort when it's a real, backend-accepted value
  if (filter.sort && filter.sort !== "default") {
    params.sort = filter.sort;
  }

  const res = await client.get<CoursesResponse>("/courses", { params });
  return {
    ...res.data,
    courses: res.data.courses.map(hydrateCourse),
  };
}

/** Get a single course by ID (includes full content) */
export async function getCourse(id: number): Promise<Course> {
  const res = await client.get<{ course: any }>(`/courses/${id}`);
  return hydrateCourse(res.data.course);
}

/**
 * Create a new course.
 * Append `content` as a JSON string in the FormData before calling.
 * e.g. fd.append("content", JSON.stringify({ parts: [...] }))
 */
export async function createCourse(formData: FormData): Promise<{ id: number }> {
  const res = await client.post<{ id: number }>("/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Update course without a new thumbnail (JSON body).
 * Pass `content` as a plain object — it will be JSON-stringified here.
 */
export async function updateCourse(
  id: number,
  data: Record<string, any>
): Promise<void> {
  const payload = { ...data };
  // Ensure content is always sent as a JSON string
  if (payload.content && typeof payload.content !== "string") {
    payload.content = JSON.stringify(payload.content);
  }
  await client.put(`/courses/${id}`, payload);
}

/**
 * Update course WITH a new thumbnail (multipart).
 * PHP flat backend uses POST + ?_method=PUT for multipart updates.
 * Make sure `content` JSON string is already appended to formData.
 */
export async function updateCourseWithFile(
  id: number,
  formData: FormData
): Promise<void> {
  await client.post(`/courses/${id}?_method=PUT`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** Delete a course */
export async function deleteCourse(id: number): Promise<void> {
  await client.delete(`/courses/${id}`);
}
