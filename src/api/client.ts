// src/api/courses.ts
import client from "./client";

// ── Types ─────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
export interface CoursePart {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}
export interface CourseContent {
  parts: CoursePart[];
}

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
  content?: CourseContent;
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CoursesFilter {
  category?: string;
  search?: string;
  sort?: "default" | "rating" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
  admin?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────
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
  return {
    ...c,
    id:            Number(c.id),
    price:         Number(c.price   ?? 0),
    rating:        Number(c.rating  ?? 0),
    lessons:       Number(c.lessons ?? 0),
    enrolled:      Number(c.enrolled ?? 0),
    instructor_id: Number(c.instructor_id ?? 0),
    is_published:  Number(c.is_published) === 1,
    sponsored:     Number(c.sponsored) === 1,
    content:       parseCourseContent(c.content),
  };
}

// ── API calls ─────────────────────────────────────────────────────────

/** List / search courses */
export async function getCourses(
  filter: CoursesFilter = {}
): Promise<CoursesResponse> {
  const params: Record<string, any> = {};
  if (filter.category) params.category = filter.category;
  if (filter.search)   params.search   = filter.search;
  if (filter.page)     params.page     = filter.page;
  if (filter.limit)    params.limit    = filter.limit;
  if (filter.sort && filter.sort !== "default") params.sort = filter.sort;
  if (filter.admin)    params.admin    = 1;

  const res  = await client.get("/courses", { params });
  const data = res.data ?? {};

  const raw: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data.courses)
    ? data.courses
    : Array.isArray(data.data)
    ? data.data
    : [];

  return {
    courses:     raw.map(hydrateCourse),
    total:       Number(data.total       ?? raw.length),
    page:        Number(data.page        ?? 1),
    limit:       Number(data.limit       ?? raw.length),
    total_pages: Number(data.total_pages ?? 1),
  };
}

/** Get a single course by ID */
export async function getCourse(id: number): Promise<Course> {
  const res  = await client.get(`/courses/${id}`);
  const data = res.data ?? {};
  const raw  = data.course ?? data;
  return hydrateCourse(raw);
}

/**
 * Create course (multipart/form-data with optional thumbnail).
 */
export async function createCourse(
  formData: FormData
): Promise<{ id: number }> {
  const res = await client.post("/courses", formData, {
    timeout: 120_000,
  });
  return res.data;
}

/**
 * Update course metadata — JSON only (no new thumbnail).
 */
export async function updateCourse(
  id: number,
  data: Record<string, any>
): Promise<void> {
  const payload = { ...data };
  if (payload.content && typeof payload.content !== "string") {
    payload.content = JSON.stringify(payload.content);
  }
  await client.put(`/courses/${id}`, payload);
}

/**
 * Update course WITH a new thumbnail (multipart).
 */
export async function updateCourseWithFile(
  id: number,
  formData: FormData
): Promise<void> {
  formData.append("_method", "PUT");
  await client.post(`/courses/${id}`, formData, {
    headers: {
      "X-HTTP-Method-Override": "PUT",
    },
    params: { _method: "PUT" },
    timeout: 120_000,
  });
}

/**
 * Delete a course.
 * ✅ FIX: Bypass the client interceptor entirely — send POST directly
 * with _method=DELETE in body + query string + header (triple safety).
 * This avoids the interceptor sending an empty body which Apache
 * misinterprets and returns 405.
 */
export async function deleteCourse(id: number): Promise<void> {
  await client.post(
    `/courses/${id}`,
    { _method: "DELETE" },
    {
      params:  { _method: "DELETE" },
      headers: { "X-HTTP-Method-Override": "DELETE" },
    }
  );
}
