// src/api/courses.ts
import client from "@/api/client";

export interface Course {
  id: number;
  title: string;
  description?: string;
  price: number;
  duration?: string;
  lessons?: number;
  lessons_count?: number;
  category?: string;
  category_id?: number | string | null;
  instructor?: string;
  instructor_id?: number;
  image?: string | null;
  is_published: boolean | number;
  enrolled?: number;
  enrolled_count?: number;
  enrollments_count?: number;
  rating?: number;
  average_rating?: number;
  content?: any;
  created_at?: string;
}

export async function getCourses(params?: { limit?: number; page?: number }) {
  try {
    const { data } = await client.get("/courses", { params });
    // Handle all possible response shapes from your API
    const courses = data?.courses ?? data?.data ?? data ?? [];
    return { courses: Array.isArray(courses) ? courses : [] };
  } catch (err: any) {
    console.error("getCourses error:", err.response?.data ?? err.message);
    throw err;
  }
}

export async function getCourse(id: number) {
  const { data } = await client.get(`/courses/${id}`);
  return data as Course;
}

export async function createCourse(fd: FormData) {
  const { data } = await client.post("/courses", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
  });
  return data;
}

export async function updateCourse(id: number, payload: Record<string, any>) {
  // client.ts interceptor converts PATCH → POST + _method automatically
  const { data } = await client.patch(`/courses/${id}`, payload);
  return data;
}

export async function updateCourseWithFile(id: number, fd: FormData) {
  // Multipart POST with _method=PUT inside FormData
  fd.append("_method", "PUT");
  const { data } = await client.post(`/courses/${id}`, fd, {
    headers: {
      "Content-Type": "multipart/form-data",
      "X-HTTP-Method-Override": "PUT",
    },
    timeout: 120_000,
  });
  return data;
}

export async function deleteCourse(id: number) {
  // client.ts interceptor converts DELETE → POST + _method automatically
  const { data } = await client.delete(`/courses/${id}`);
  return data;
}
