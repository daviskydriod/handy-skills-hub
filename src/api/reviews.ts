// src/api/reviews.ts
import client from "@/api/client";

export interface Review {
  id: number;
  student_id: number;
  student_name: string;
  course_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewStats {
  total: number;
  avg: number;
  distribution: Record<number, number>;
}

/** All reviews + stats for a course (public) */
export async function getCourseReviews(courseId: number): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  const { data } = await client.get("/reviews", { params: { course_id: courseId } });
  return data;
}

/** Current student's own review */
export async function getMyReview(courseId: number): Promise<Review | null> {
  const { data } = await client.get("/reviews", { params: { course_id: courseId, action: "my" } });
  return data?.review ?? null;
}

/** Submit or update a review */
export async function submitReview(courseId: number, rating: number, comment: string): Promise<void> {
  await client.post("/reviews", { course_id: courseId, rating, comment });
}

/** Delete review — tunnelled as POST + _method:DELETE to avoid 405 */
export async function deleteReview(courseId: number): Promise<void> {
  await client.post("/reviews", { _method: "DELETE", course_id: courseId });
}
