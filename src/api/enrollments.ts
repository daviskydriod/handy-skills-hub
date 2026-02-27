// File: src/api/enrollments.ts
// Enrollment calls matching flat PHP backend:
//   POST /api/enrollments      → enroll.php
//   GET  /api/enrollments/my   → my.php
//   PUT  /api/progress         → progress.php

import client from "./client";
import type { Course } from "./courses";

export interface EnrolledCourse extends Course {
  progress: number;
  completed: boolean;
  enrolled_at: string;
}

export async function enrollInCourse(course_id: number): Promise<void> {
  await client.post("/enrollments", { course_id });
}

export async function getMyEnrollments(): Promise<EnrolledCourse[]> {
  const res = await client.get<{ courses: EnrolledCourse[] }>("/enrollments/my");
  return res.data.courses;
}

/**
 * Update lesson progress for the current student.
 * progress = 0–100 (percentage of lessons completed)
 * completed = true forces completed_at to be set
 */
export async function updateProgress(
  course_id: number,
  progress: number,
  completed = false
): Promise<void> {
  await client.put("/progress", { course_id, progress, completed });
}
