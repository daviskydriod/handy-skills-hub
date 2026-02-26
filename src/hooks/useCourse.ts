// File: frontend/src/hooks/useCourse.ts
// Fetches a single course by ID from the PHP API.
// Mirrors the pattern used in useCourses.ts.

import { useState, useEffect, useCallback } from 'react';
import { getCourse } from '../api/courses';
import type { Course } from '../api/courses';   // ✅ import from api, not types

interface UseCourse {
  course:    Course | null;
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

export function useCourse(id: string | undefined): UseCourse {
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

    getCourse(numericId)          // ✅ API expects number, not string
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error ?? 'Failed to load course');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { course, isLoading, error, refetch };
}
