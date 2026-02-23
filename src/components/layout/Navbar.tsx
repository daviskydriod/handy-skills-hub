import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpeg";
import { BUSINESS_INFO } from "@/data/mockData";

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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(11,31,58,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(234,179,8,0.12)",
      }}
    >
      {/* ── top bar (desktop) ── */}
      <div
        className="hidden md:block border-b text-center py-1.5 text-xs font-medium"
        style={{
          borderColor: "rgba(234,179,8,0.1)",
          background: "rgba(0,0,0,0.2)",
          color: "#94a3b8",
        }}
      >
        <span className="mr-6">
          📞{" "}
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="hover:underline transition-colors"
            style={{ color: GOLD }}
          >
            {BUSINESS_INFO.phone}
          </a>
        </span>
        <span>
          ✉️{" "}
          <a
            href={`mailto:${BUSINESS_INFO.email}`}
            className="hover:underline transition-colors"
            style={{ color: GOLD }}
          >
            {BUSINESS_INFO.email}
          </a>
        </span>
      </div>

      {/* ── main nav row ── */}
      <div className="container flex h-16 items-center justify-between">

        {/* logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={logo}
            alt="HandyGidi Training Centre"
            className="w-10 h-10 rounded-xl object-contain"
            style={{ border: `2px solid rgba(234,179,8,0.3)` }}
          />
          <div className="hidden sm:block">
            <span
              className="font-heading font-extrabold text-lg leading-tight block"
              style={{ color: "#fff" }}
            >
              HandyGidi
            </span>
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: GOLD, opacity: 0.8 }}
            >
              Training Centre
            </span>
          </div>
        </Link>

        {/* desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={{
                color: isActive(l.to) ? GOLD : "rgba(255,255,255,0.7)",
              }}
            >
              {/* active underline */}
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

        {/* desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-2">
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
        </div>

        {/* mobile hamburger */}
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

      {/* ── mobile drawer ── */}
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
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(234,179,8,0.15)", color: GOLD }}
                    >
                      Active
                    </span>
                  )}
                </Link>
              ))}

              {/* divider */}
              <div
                className="my-2 border-t"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />

              {/* mobile auth buttons */}
              <div className="flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full text-sm font-bold border transition-all"
                  style={{
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full text-sm font-extrabold transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                    color: "#060d1c",
                  }}
                >
                  Register Free
                </Link>
              </div>

              {/* mobile contact */}
              <div
                className="mt-3 rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(234,179,8,0.1)" }}
              >
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="text-xs font-medium flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <Phone size={11} style={{ color: GOLD }} />
                  {BUSINESS_INFO.phone}
                </a>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-xs font-medium flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
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
