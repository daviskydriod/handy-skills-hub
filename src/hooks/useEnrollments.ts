// File: frontend/src/hooks/useEnrollments.ts
// Fetches the authenticated student's enrolled courses from the PHP API.

import { useState, useEffect, useCallback } from 'react';
import { getMyEnrollments } from '../api/enrollments';
import type { EnrolledCourse } from '../types';

interface UseEnrollments {
  courses: EnrolledCourse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEnrollments(): UseEnrollments {
  const [courses,   setCourses]   = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getMyEnrollments()
      .then((data) => { if (!cancelled) setCourses(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error ?? 'Failed to load enrollments'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { courses, isLoading, error, refetch };
}
