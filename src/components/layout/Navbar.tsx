// File: src/components/layout/Navbar.tsx

import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, GraduationCap, Phone, LogOut, LayoutDashboard,
  ChevronDown, Monitor, Brain, Share2, Pen, Globe, Home,
  Briefcase, Megaphone, Code, FileText, Mail, TrendingUp, Heart, Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpeg";
import { BUSINESS_INFO } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

const courses = [
  { label: "Computer Appreciation",                icon: Monitor,    to: "/courses/30" },
  { label: "AI & Data Analysis",                   icon: Brain,      to: "/courses/31" },
  { label: "Social Media Management",              icon: Share2,     to: "/courses/32" },
  { label: "Graphic Design",                       icon: Pen,        to: "/courses/33" },
  { label: "Web Design",                           icon: Globe,      to: "/courses/34" },
  { label: "Interior Design",                      icon: Home,       to: "/courses/35" },
  { label: "Leadership & Management",              icon: Briefcase,  to: "/courses/36" },
  { label: "Digital Marketing",                    icon: Megaphone,  to: "/courses/37" },
  { label: "Basic Programming (Python)",           icon: Code,       to: "/courses/38" },
  { label: "Office Productivity",                  icon: FileText,   to: "/courses/39" },
  { label: "Internet & Email Mastery",             icon: Mail,       to: "/courses/40" },
  { label: "Business Development Skills",          icon: TrendingUp, to: "/courses/41" },
  { label: "Women in Business Empowerment",        icon: Heart,      to: "/courses/42" },
  { label: "Girl Child Digital Skills Program",    icon: Star,       to: "/courses/43" },
];

const navLinks = [
  { label: "Home",    to: "/" },
  { label: "About",   to: "/about" },
  { label: "Contact", to: "/contact" },
];

const getDashboardPath = (role?: string) => {
  if (role === "admin")      return "/dashboard/admin";
  if (role === "instructor") return "/dashboard/instructor";
  return "/dashboard/student";
};

export default function Navbar() {
  const [open,              setOpen]              = useState(false);
  const [userMenuOpen,      setUserMenuOpen]      = useState(false);
  const [coursesOpen,       setCoursesOpen]       = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const coursesRef = useRef<HTMLDivElement>(null);

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const isCoursesActive = location.pathname.startsWith("/courses");

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (coursesRef.current && !coursesRef.current.contains(e.target as Node)) {
        setCoursesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(11,31,58,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(234,179,8,0.12)",
      }}
    >
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={logo}
            alt="HandyGidi Training Centre"
            className="w-10 h-10 rounded-xl object-contain"
            style={{ border: `2px solid rgba(234,179,8,0.3)` }}
          />
          <div className="hidden sm:block">
            <span className="font-heading font-extrabold text-lg leading-tight block" style={{ color: "#fff" }}>
              HandyGidi
            </span>
            <span className="text-[10px] font-semibold leading-none" style={{ color: GOLD, opacity: 0.8 }}>
              Training Centre
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">

          <Link
            to="/"
            className="relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
            style={{ color: isActive("/") ? GOLD : "rgba(255,255,255,0.7)" }}
          >
            {isActive("/") && (
              <motion.span layoutId="nav-underline"
                className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                style={{ background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
            )}
            Home
          </Link>

          {/* Courses dropdown */}
          <div className="relative" ref={coursesRef}>
            <button
              onClick={() => setCoursesOpen(!coursesOpen)}
              onMouseEnter={() => setCoursesOpen(true)}
              className="relative flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={{ color: isCoursesActive ? GOLD : "rgba(255,255,255,0.7)" }}
            >
              {isCoursesActive && (
                <motion.span layoutId="nav-underline"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
              )}
              Courses
              <ChevronDown size={13}
                className={`transition-transform duration-200 ${coursesOpen ? "rotate-180" : ""}`}
                style={{ color: isCoursesActive ? GOLD : "rgba(255,255,255,0.5)" }} />
            </button>

            <AnimatePresence>
              {coursesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  onMouseLeave={() => setCoursesOpen(false)}
                  className="absolute left-1/2 -translate-x-1/2 mt-1 rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    width: "680px",
                    background: NAVY2,
                    border: "1px solid rgba(234,179,8,0.18)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="px-5 py-4 border-b flex items-center justify-between"
                    style={{ borderColor: "rgba(234,179,8,0.12)", background: "rgba(0,0,0,0.2)" }}>
                    <div>
                      <p className="text-sm font-extrabold text-white">Our Courses</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {courses.length} programs available · Enroll anytime
                      </p>
                    </div>
                    <Link to="/courses" onClick={() => setCoursesOpen(false)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                      View All
                    </Link>
                  </div>

                  <div className="p-4 grid grid-cols-2 gap-1">
                    {courses.map((course) => {
                      const Icon = course.icon;
                      const active = location.pathname === course.to;
                      return (
                        <Link key={course.to} to={course.to} onClick={() => setCoursesOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                          style={{ background: active ? "rgba(234,179,8,0.1)" : "transparent" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                          onMouseLeave={e => (e.currentTarget.style.background = active ? "rgba(234,179,8,0.1)" : "transparent")}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: "rgba(234,179,8,0.12)" }}>
                            <Icon size={13} style={{ color: GOLD }} />
                          </div>
                          <span className="text-xs font-semibold leading-snug"
                            style={{ color: active ? GOLD : "rgba(255,255,255,0.78)" }}>
                            {course.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="px-5 py-3 border-t flex items-center gap-3"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}>
                    <GraduationCap size={14} style={{ color: GOLD }} />
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Can't decide?{" "}
                      <Link to="/contact" onClick={() => setCoursesOpen(false)}
                        className="underline" style={{ color: GOLD }}>Talk to our advisors</Link>
                      {" "}for guidance.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.filter(l => l.to !== "/").map((l) => (
            <Link key={l.to} to={l.to}
              className="relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={{ color: isActive(l.to) ? GOLD : "rgba(255,255,255,0.7)" }}
            >
              {isActive(l.to) && (
                <motion.span layoutId="nav-underline"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
              )}
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(234,179,8,0.25)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold max-w-[120px] truncate" style={{ color: "#fff" }}>
                  {user.name?.split(" ")[0]}
                </span>
                <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.5)" }}
                  className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden shadow-xl"
                    style={{ background: NAVY2, border: "1px solid rgba(234,179,8,0.15)" }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] capitalize mt-0.5" style={{ color: GOLD }}>{user.role}</p>
                    </div>
                    <Link to={getDashboardPath(user.role)} onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.8)" }}>
                      <LayoutDashboard size={14} style={{ color: GOLD }} />
                      My Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all hover:bg-red-500/10 border-t"
                      style={{ color: "#f87171", borderColor: "rgba(255,255,255,0.07)" }}>
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login"
                className="px-4 py-2 text-sm font-semibold rounded-full transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.75)" }}>
                Login
              </Link>
              <Link to="/register"
                className="px-5 py-2 text-sm font-extrabold rounded-full transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                  color: "#060d1c",
                  boxShadow: "0 4px 18px rgba(234,179,8,0.3)",
                }}>
                Register Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          onClick={() => setOpen(!open)} aria-label="Toggle menu"
        >
          {open ? <X size={18} style={{ color: "#fff" }} /> : <Menu size={18} style={{ color: "#fff" }} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: "1px solid rgba(234,179,8,0.12)", background: NAVY }}
          >
            <div className="container py-5 flex flex-col gap-1">

              <Link to="/" onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  color: isActive("/") ? GOLD : "rgba(255,255,255,0.75)",
                  background: isActive("/") ? "rgba(234,179,8,0.08)" : "transparent",
                  borderLeft: isActive("/") ? `3px solid ${GOLD}` : "3px solid transparent",
                }}>
                Home
                {isActive("/") && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(234,179,8,0.15)", color: GOLD }}>Active</span>
                )}
              </Link>

              {/* Mobile courses accordion */}
              <div>
                <button onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    color: isCoursesActive ? GOLD : "rgba(255,255,255,0.75)",
                    background: isCoursesActive ? "rgba(234,179,8,0.08)" : "transparent",
                    borderLeft: isCoursesActive ? `3px solid ${GOLD}` : "3px solid transparent",
                  }}>
                  <span>Courses</span>
                  <ChevronDown size={14}
                    className={`transition-transform duration-200 ${mobileCoursesOpen ? "rotate-180" : ""}`}
                    style={{ color: isCoursesActive ? GOLD : "rgba(255,255,255,0.4)" }} />
                </button>

                <AnimatePresence>
                  {mobileCoursesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden ml-3 mt-1"
                    >
                      <div className="rounded-xl overflow-hidden"
                        style={{ border: "1px solid rgba(234,179,8,0.12)", background: "rgba(255,255,255,0.03)" }}>
                        <Link to="/courses"
                          onClick={() => { setOpen(false); setMobileCoursesOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2.5 border-b text-xs font-bold"
                          style={{ color: GOLD, borderColor: "rgba(234,179,8,0.12)" }}>
                          <GraduationCap size={12} />
                          Browse All Courses →
                        </Link>
                        {courses.map((course) => {
                          const Icon = course.icon;
                          const active = location.pathname === course.to;
                          return (
                            <Link key={course.to} to={course.to}
                              onClick={() => { setOpen(false); setMobileCoursesOpen(false); }}
                              className="flex items-center gap-2.5 px-3 py-2.5 border-b last:border-0 transition-all"
                              style={{
                                borderColor: "rgba(255,255,255,0.04)",
                                color: active ? GOLD : "rgba(255,255,255,0.7)",
                                background: active ? "rgba(234,179,8,0.07)" : "transparent",
                              }}>
                              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                style={{ background: "rgba(234,179,8,0.1)" }}>
                                <Icon size={11} style={{ color: GOLD }} />
                              </div>
                              <span className="text-xs font-semibold">{course.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.filter(l => l.to !== "/").map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    color: isActive(l.to) ? GOLD : "rgba(255,255,255,0.75)",
                    background: isActive(l.to) ? "rgba(234,179,8,0.08)" : "transparent",
                    borderLeft: isActive(l.to) ? `3px solid ${GOLD}` : "3px solid transparent",
                  }}>
                  {l.label}
                  {isActive(l.to) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(234,179,8,0.15)", color: GOLD }}>Active</span>
                  )}
                </Link>
              ))}

              <div className="my-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-[11px] capitalize" style={{ color: GOLD }}>{user.role}</p>
                    </div>
                  </div>
                  <Link to={getDashboardPath(user.role)} onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ color: "rgba(255,255,255,0.8)", background: "rgba(234,179,8,0.06)" }}>
                    <LayoutDashboard size={15} style={{ color: GOLD }} />
                    My Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all w-full mt-1"
                    style={{ color: "#f87171", background: "rgba(239,68,68,0.06)" }}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-sm font-bold border transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}>
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-sm font-extrabold transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                    Register Free
                  </Link>
                </div>
              )}

              <div className="mt-3 rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(234,179,8,0.1)" }}>
                <a href={`tel:${BUSINESS_INFO.phone}`}
                  className="text-xs font-medium flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Phone size={11} style={{ color: GOLD }} />
                  {BUSINESS_INFO.phone}
                </a>
                <a href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-xs font-medium flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.6)" }}>
                  <GraduationCap size={11} style={{ color: GOLD }} />
                  {BUSINESS_INFO.email}
                </a>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
