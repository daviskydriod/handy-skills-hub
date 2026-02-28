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

/**
 * All reviews + aggregate stats for a course (public, no auth required).
 * GET /reviews?course_id={id}
 */
export async function getCourseReviews(
  courseId: number
): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  const { data } = await client.get("/reviews", {
    params: { course_id: courseId },
  });

  // ✅ FIX: Guard against null/missing fields so ReviewModal never crashes
  //   on .length or .map() of undefined when the API returns an unexpected shape.
  return {
    reviews: Array.isArray(data?.reviews) ? data.reviews : [],
    stats: {
      total:        data?.stats?.total        ?? 0,
      avg:          data?.stats?.avg          ?? 0,
      distribution: data?.stats?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
  };
}

/**
 * Current student's own review for a course.
 * GET /reviews?course_id={id}&action=my
 */
export async function getMyReview(courseId: number): Promise<Review | null> {
  const { data } = await client.get("/reviews", {
    params: { course_id: courseId, action: "my" },
  });
  return data?.review ?? null;
}

/**
 * Submit or update a review.
 * POST /reviews  —  body: { course_id, rating, comment }
 * Backend enforces: student must be enrolled AND course must be completed.
 */
export async function submitReview(
  courseId: number,
  rating: number,
  comment: string
): Promise<void> {
  await client.post("/reviews", { course_id: courseId, rating, comment });
}

/**
 * Delete own review.
 *
 * ✅ FIX: Original sent { _method: "DELETE" } in the JSON body:
 *     client.post("/reviews", { _method: "DELETE", course_id: courseId })
 *
 *   index.php only reads _method from:
 *     1. $_GET  (query string)       ← what we use now ✅
 *     2. HTTP_X_HTTP_METHOD_OVERRIDE header
 *   It never reads _method from the JSON body.
 *
 *   With the old code, every delete hit the POST /reviews handler and tried
 *   to create a review with { _method: "DELETE", course_id } as the body —
 *   which either 400'd (no rating) or silently did nothing.
 *
 *   Fix: pass _method and course_id in the query string so index.php
 *   resolves it to DELETE before routing to reviews.php.
 */
export async function deleteReview(courseId: number): Promise<void> {
  await client.post(
    `/reviews?_method=DELETE&course_id=${courseId}`,
    {} // empty body — all params are in the query string
  );
}
