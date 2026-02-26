// File: src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

interface Props {
  children: React.ReactNode;
  roles?: User['role'][];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // While validating stored token, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect to login, preserve intended path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role — redirect to their correct dashboard
  if (roles && user && !roles.includes(user.role)) {
    if (user.role === 'admin')      return <Navigate to="/dashboard/admin"      replace />;
    if (user.role === 'instructor') return <Navigate to="/dashboard/instructor" replace />;
    return <Navigate to="/dashboard/student" replace />;
  }

  return <>{children}</>;
}
