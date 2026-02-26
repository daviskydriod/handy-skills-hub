// File: src/components/layout/Navbar.tsx

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, Phone, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpeg";
import { BUSINESS_INFO } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

const navLinks = [
  { label: "Home",    to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "About",   to: "/about" },
  { label: "Contact", to: "/contact" },
];

const getDashboardPath = (role?: string) => {
  if (role === "admin")      return "/dashboard/admin";
  if (role === "instructor") return "/dashboard/instructor";
  return "/dashboard/student";
};

export default function Navbar() {
  const [open,        setOpen]        = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setOpen(false);
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(11,31,58,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(234,179,8,0.12)",
      }}
    >
      {/* ── main nav row ── */}
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

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={{ color: isActive(l.to) ? GOLD : "rgba(255,255,255,0.7)" }}
            >
              {isActive(l.to) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg,${GOLD},${GOLD2})` }}
                />
              )}
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA — changes based on auth state */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && user ? (
            /* ── Logged-in user menu ── */
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(234,179,8,0.25)" }}
              >
                {/* Avatar */}
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

              {/* Dropdown */}
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
                    {/* User info */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] capitalize mt-0.5" style={{ color: GOLD }}>{user.role}</p>
                    </div>
                    {/* Dashboard link */}
                    <Link
                      to={getDashboardPath(user.role)}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      <LayoutDashboard size={14} style={{ color: GOLD }} />
                      My Dashboard
                    </Link>
                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all hover:bg-red-500/10 border-t"
                      style={{ color: "#f87171", borderColor: "rgba(255,255,255,0.07)" }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Guest buttons ── */
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold rounded-full transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 text-sm font-extrabold rounded-full transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                  color: "#060d1c",
                  boxShadow: "0 4px 18px rgba(234,179,8,0.3)",
                }}
              >
                Register Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open
            ? <X size={18} style={{ color: "#fff" }} />
            : <Menu size={18} style={{ color: "#fff" }} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
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

              {/* Nav links */}
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    color: isActive(l.to) ? GOLD : "rgba(255,255,255,0.75)",
                    background: isActive(l.to) ? "rgba(234,179,8,0.08)" : "transparent",
                    borderLeft: isActive(l.to) ? `3px solid ${GOLD}` : "3px solid transparent",
                  }}
                >
                  {l.label}
                  {isActive(l.to) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(234,179,8,0.15)", color: GOLD }}>
                      Active
                    </span>
                  )}
                </Link>
              ))}

              <div className="my-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

              {isAuthenticated && user ? (
                /* ── Mobile logged-in ── */
                <>
                  {/* User info */}
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
                  {/* Dashboard */}
                  <Link
                    to={getDashboardPath(user.role)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ color: "rgba(255,255,255,0.8)", background: "rgba(234,179,8,0.06)" }}
                  >
                    <LayoutDashboard size={15} style={{ color: GOLD }} />
                    My Dashboard
                  </Link>
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all w-full mt-1"
                    style={{ color: "#f87171", background: "rgba(239,68,68,0.06)" }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </>
              ) : (
                /* ── Mobile guest buttons ── */
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-sm font-bold border transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-sm font-extrabold transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}
                  >
                    Register Free
                  </Link>
                </div>
              )}

              {/* Mobile contact */}
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
