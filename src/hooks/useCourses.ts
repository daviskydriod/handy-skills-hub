// File: frontend/src/hooks/useCourses.ts
// Fetches courses from the PHP API with filter/sort/search/pagination support.

import { useState, useEffect, useCallback } from 'react';
import { getCourses } from '../api/courses';
import type { Course, CoursesFilter } from '../types';

interface UseCourses {
  courses: Course[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCourses(filter: CoursesFilter = {}): UseCourses {
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [tick,       setTick]       = useState(0);

  // Stringify filter so useEffect detects changes in nested object
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
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error ?? 'Failed to load courses');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { courses, total, totalPages, isLoading, error, refetch };
}
