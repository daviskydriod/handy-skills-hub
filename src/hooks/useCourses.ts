// File: src/hooks/useCourses.ts
// Handles both single course fetch and courses list fetch.

import { useState, useEffect, useCallback } from 'react';
import { getCourse, getCourses } from '../api/courses';
import type { Course, CoursesFilter } from '../api/courses';

/* ═══════════════════ SINGLE COURSE ════════════════════════ */
interface UseCourseResult {
  course:    Course | null;
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

export function useCourse(id: string | undefined): UseCourseResult {
  const [course,    setCourse]    = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    if (!id) return;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      setError('Invalid course ID');
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getCourse(numericId)
      .then((data)  => { if (!cancelled) setCourse(data); })
      .catch((err)  => { if (!cancelled) setError(err.response?.data?.error ?? 'Failed to load course'); })
      .finally(()   => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { course, isLoading, error, refetch };
}

/* ═══════════════════ COURSES LIST ═════════════════════════ */
interface UseCoursesResult {
  courses:    Course[];
  total:      number;
  totalPages: number;
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
}

export function useCourses(filter: CoursesFilter = {}): UseCoursesResult {
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [tick,       setTick]       = useState(0);

  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getCourses(filter)
      .then((data) => {
        if (!cancelled) {
          setCourses(data.courses);
          setTotal(data.total);
          setTotalPages(data.total_pages);
        }
      })
      .catch((err)  => { if (!cancelled) setError(err.response?.data?.error ?? 'Failed to load courses'); })
      .finally(()   => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { courses, total, totalPages, isLoading, error, refetch };
}
