// File: src/components/layout/DashboardLayout.tsx

import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ─── design tokens (matches Navbar exactly) ─────────────── */
const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

interface SidebarItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children:  ReactNode;
  items:     SidebarItem[];
  title:     string;
  userName?: string;
}

export default function DashboardLayout({
  children,
  items,
  title,
  userName = "User",
}: DashboardLayoutProps) {
  const [open,    setOpen]    = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen flex" style={{ background: "#060d1c" }}>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ══ SIDEBAR ════════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
        style={{ background: NAVY, borderRight: "1px solid rgba(234,179,8,0.12)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(234,179,8,0.1)" }}
        >
          <Link to="/" className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
            >
              <GraduationCap size={18} style={{ color: "#060d1c" }} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white leading-tight truncate">{title}</p>
              <p className="text-[10px]" style={{ color: GOLD }}>HandyGidi</p>
            </div>
          </Link>
          <button
            className="lg:hidden shrink-0"
            onClick={() => setOpen(false)}
          >
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* User info */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0"
              style={{
                background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                color: "#060d1c",
              }}
            >
              {(user?.name ?? userName).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.name ?? userName}
              </p>
              <p className="text-[11px] capitalize" style={{ color: GOLD }}>
                {user?.role ?? "user"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p
            className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Navigation
          </p>
          {items.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-semibold transition-all"
                style={{
                  background: active
                    ? `linear-gradient(135deg,${GOLD}22,${GOLD2}11)`
                    : "transparent",
                  color: active ? GOLD : "rgba(255,255,255,0.6)",
                  border: active
                    ? `1px solid ${GOLD}33`
                    : "1px solid transparent",
                }}
              >
                <span style={{ color: active ? GOLD : "rgba(255,255,255,0.4)" }}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: GOLD }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="px-3 pb-5 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold mt-3 transition-all hover:bg-red-500/10"
            style={{ color: "#f87171" }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ═════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{
            background: "rgba(11,31,58,0.97)",
            borderBottom: "1px solid rgba(234,179,8,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setOpen(true)}
            >
              <Menu size={16} style={{ color: "#fff" }} />
            </button>

            {/* Page title from current route */}
            <div>
              <p className="font-bold text-white text-base leading-tight">
                {items.find((i) => isActive(i.to))?.label ?? title}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                Welcome back, {(user?.name ?? userName).split(" ")[0]}
              </p>
            </div>
          </div>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0"
            style={{
              background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
              color: "#060d1c",
            }}
          >
            {(user?.name ?? userName).charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
