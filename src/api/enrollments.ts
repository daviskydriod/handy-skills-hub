// File: src/api/enrollments.ts
// Enrollment calls matching flat PHP backend:
//   POST /api/enrollments      → enroll.php
//   GET  /api/enrollments/my   → my.php

import client from "./client";
import type { Course } from "./courses";

export interface EnrolledCourse extends Course {
  progress: number; completed: boolean; enrolled_at: string;
}

export async function enrollInCourse(course_id: number): Promise<void> {
  await client.post("/enrollments", { course_id });
}

export async function getMyEnrollments(): Promise<EnrolledCourse[]> {
  const res = await client.get<{ courses: EnrolledCourse[] }>("/enrollments/my");
  return res.data.courses;
}
