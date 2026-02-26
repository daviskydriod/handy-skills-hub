// File: frontend/src/components/ProtectedRoute.tsx
// Guards routes by auth status and optionally by user role.
// Usage in App.tsx / router:
//   <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
//   <Route path="/admin"     element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

interface Props {
  children: React.ReactNode;
  roles?: User['role'][];   // if provided, only these roles can access
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // While we validate the stored token, show a spinner
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

  // Logged in but wrong role
  if (roles && user && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === 'admin')       return <Navigate to="/admin"      replace />;
    if (user.role === 'instructor')  return <Navigate to="/instructor" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
