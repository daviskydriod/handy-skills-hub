// src/api/reviews.ts
// Drop this file alongside your other API files (payments.ts, courses.ts, etc.)

import axios from "axios";

const API = import.meta.env.VITE_API_URL ?? "/api"; // adjust to your base URL

export interface Review {
  id: number;
  student_id: number;
  student_name: string;
  course_id: number;
  rating: number;         // 1–5
  comment: string | null;
  created_at: string;
}

export interface ReviewStats {
  total: number;
  avg: number;
  distribution: Record<number, number>; // { 5: 3, 4: 1, ... }
}

/** Fetch all reviews + aggregate stats for a course (public) */
export async function getCourseReviews(courseId: number): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  const { data } = await axios.get(`${API}/reviews.php`, { params: { course_id: courseId } });
  return data;
}

/** Fetch the current student's own review for a course */
export async function getMyReview(courseId: number): Promise<Review | null> {
  const { data } = await axios.get(`${API}/reviews.php`, { params: { course_id: courseId, action: "my" } });
  return data.review;
}

/** Submit or update a review */
export async function submitReview(courseId: number, rating: number, comment: string): Promise<void> {
  await axios.post(`${API}/reviews.php`, { course_id: courseId, rating, comment });
}

/** Delete the current student's review */
export async function deleteReview(courseId: number): Promise<void> {
  await axios.delete(`${API}/reviews.php`, { params: { course_id: courseId } });
}
