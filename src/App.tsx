import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import HandyGidiChat from './components/global/HandyGidiChat';


// Pages — public
import Index        from "./pages/Index";
import Courses      from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import About        from "./pages/About";
import Blog         from "./pages/Blog";
import Contact      from "./pages/Contact";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import NotFound     from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin    from "./pages/AdminLogin";

// Pages — course player (full-screen, no DashboardLayout)
import StudentCoursePlayer from "./pages/StudentCoursePlayer";

// Pages — dashboards
import StudentDashboard    from "./pages/dashboard/StudentDashboard";
import InstructorDashboard from "./pages/dashboard/InstructorDashboard";
import AdminDashboard      from "./pages/dashboard/AdminDashboard";

// Pages — student sub-pages
import Certificates    from "./pages/dashboard/Certificates";
import Profile         from "./pages/dashboard/Profile";
import StudentSettings from "./pages/dashboard/StudentSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HandyGidiChat />
        <AuthProvider>
          <Routes>

            {/* ── Public ─────────────────────────────────────────── */}
            <Route path="/"            element={<Index />} />
            <Route path="/courses"     element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/about"       element={<About />} />
            <Route path="/blog"        element={<Blog />} />
            <Route path="/contact"     element={<Contact />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/login"    element={<AdminLogin />} />

            {/* ── Course Player ───────────────────────────────────
                Full-screen dark UI — NO DashboardLayout wrapper.
                StudentCoursePlayer has its own header and sidebar. */}
            <Route path="/learn/:id" element={
              <ProtectedRoute>
                <StudentCoursePlayer />
              </ProtectedRoute>
            } />

            {/* ── Student ─────────────────────────────────────────
                StudentDashboard has its own built-in sidebar now.
                Remove DashboardLayout to avoid double sidebars.    */}
            <Route path="/dashboard/student" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/my-courses" element={
              <ProtectedRoute>
                <StudentDashboard defaultTab="my-courses" />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/explore" element={
              <ProtectedRoute>
                <StudentDashboard defaultTab="explore" />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/payments" element={
              <ProtectedRoute>
                <StudentDashboard defaultTab="payments" />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/certificates" element={
              <ProtectedRoute>
                <DashboardLayout><Certificates /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <DashboardLayout><Profile /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <DashboardLayout><StudentSettings /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* ── Instructor ──────────────────────────────────────
                InstructorDashboard also has its own sidebar,
                so remove DashboardLayout here too.               */}
            <Route path="/dashboard/instructor" element={
              <ProtectedRoute>
                <InstructorDashboard />
              </ProtectedRoute>
            } />

            {/* ── Admin ──────────────────────────────────────────── */}
            <Route path="/dashboard/admin" element={
              <ProtectedRoute>
                <DashboardLayout><AdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
