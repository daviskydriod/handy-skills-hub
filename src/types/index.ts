// File: frontend/src/types/index.ts
// Shared TypeScript interfaces used across the entire frontend.
// These mirror exactly what the PHP API returns.

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  course_count: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  category_id?: number;
  price: number;
  duration: string;
  lessons: number;
  image: string | null;
  rating: number;
  enrolled: number;
  instructor: string;
  instructor_id?: number;
  sponsored: boolean;
  is_published?: boolean;
  created_at?: string;
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface EnrolledCourse extends Course {
  progress: number;
  completed: boolean;
  enrolled_at: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  progress: number;
  completed: boolean;
  enrolled_at: string;
}

// Query params for GET /api/courses
export interface CoursesFilter {
  category?: string;
  search?: string;
  sort?: 'default' | 'rating' | 'price-asc' | 'price-desc';
  page?: number;
  limit?: number;
}
