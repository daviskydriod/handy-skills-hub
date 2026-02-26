// File: src/components/layout/DashboardLayout.tsx

import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, GraduationCap, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.jpeg";

/* ─── Light theme tokens ──────────────────────────────────── */
const NAVY  = "#0b1f3a";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

interface SidebarItem {
  label: string;
  to:    string;
  icon:  ReactNode;
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
  const [open, setOpen] = useState(false);
  const location        = useLocation();
  const navigate        = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.name ?? userName;
  const role        = user?.role ?? "user";
  const initial     = displayName.charAt(0).toUpperCase();

  const handleLogout = () => { logout(); navigate("/"); };

  /* active if exact match OR starts with route + "/" */
  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  /* active label for topbar */
  const activeLabel = items.find((i) => isActive(i.to))?.label ?? title;

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── mobile overlay ───────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ══ SIDEBAR ════════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col shrink-0
          transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
        style={{ background: NAVY }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <img src={logo} alt="HandyGidi"
              className="w-8 h-8 rounded-lg object-contain"
              style={{ border: "2px solid rgba(234,179,8,0.4)" }} />
            <div>
              <p className="font-extrabold text-sm text-white leading-none">HandyGidi</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: GOLD }}>
                Training Centre
              </p>
            </div>
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen(false)}>
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {/* ── User card ── */}
        <div className="px-4 py-4 mx-3 mt-4 rounded-xl shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{ background: `${GOLD}22`, color: GOLD }}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            Menu
          </p>
          {items.map((item) => {
            const active = isActive(item.to);
            return (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group"
                style={{
                  background: active ? `linear-gradient(135deg,${GOLD},${GOLD2})` : "transparent",
                  color:      active ? NAVY : "rgba(255,255,255,0.55)",
                }}>
                <span className="shrink-0 transition-colors"
                  style={{ color: active ? NAVY : "rgba(255,255,255,0.4)" }}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={13} style={{ color: NAVY }} />}
              </Link>
            );
          })}
        </nav>

        {/* ── Logout ── */}
        <div className="px-3 pb-5 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold mt-3 transition-all hover:bg-red-500/15 group"
            style={{ color: "rgba(255,100,100,0.85)" }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top bar ── */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white"
          style={{ borderBottom: "1px solid #e8edf2", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100"
              onClick={() => setOpen(true)}>
              <Menu size={18} style={{ color: NAVY }} />
            </button>
            <div>
              <h1 className="font-bold text-base leading-tight" style={{ color: NAVY }}>
                {activeLabel}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Welcome back, <span className="font-semibold text-slate-500">{displayName.split(" ")[0]}</span>
              </p>
            </div>
          </div>

          {/* Right: avatar only — name/role already in sidebar */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold leading-none" style={{ color: NAVY }}>{displayName}</p>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">{role}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 cursor-default"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
              {initial}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
