// src/api/enrollments.ts
// Enrollment calls matching flat PHP backend:
//   POST /api/enrollments      → enroll.php
//   GET  /api/enrollments/my   → my.php
//   PUT  /api/progress         → progress.php

import client from "./client";
import type { Course } from "./courses";

export interface EnrolledCourse extends Course {
  progress: number;   // 0–100
  completed: boolean;
  enrolled_at: string;
}

/**
 * Enroll the current student in a course.
 * Only needed for FREE courses — paid courses are enrolled automatically
 * when an admin approves a payment in payments.php.
 */
export async function enrollInCourse(course_id: number): Promise<void> {
  await client.post("/enrollments", { course_id });
}

/**
 * Get all courses the current student is enrolled in.
 *
 * ✅ FIX: Added response shape guard.
 *   If the PHP backend ever returns { data: [...] } or a bare array instead
 *   of { courses: [...] }, the original would silently return undefined,
 *   causing `.map()` calls in the dashboard to throw "Cannot read properties
 *   of undefined". Now we normalise all shapes to a safe array.
 */
export async function getMyEnrollments(): Promise<EnrolledCourse[]> {
  const res = await client.get("/enrollments/my");
  const data = res.data as any;

  const raw: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.courses)
    ? data.courses
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return raw as EnrolledCourse[];
}

/**
 * Update lesson progress for the current student.
 *
 * @param course_id  The course being studied
 * @param progress   0–100 (percentage of lessons completed)
 * @param completed  Pass true to mark the course fully complete
 *
 * ✅ NOTE: client.ts interceptor tunnels PUT → POST + _method=PUT + header
 *   automatically, so this works on shared hosting that blocks raw PUT.
 *   progress.php in index.php also accepts POST for the same reason.
 */
export async function updateProgress(
  course_id: number,
  progress: number,
  completed = false
): Promise<void> {
  // Clamp progress to valid range before sending
  const safePct = Math.max(0, Math.min(100, Math.round(progress)));
  await client.put("/progress", { course_id, progress: safePct, completed });
}
