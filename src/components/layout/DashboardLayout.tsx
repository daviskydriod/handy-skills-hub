// File: src/components/layout/DashboardLayout.tsx
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, BookOpen, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.jpeg";

const NAVY  = "#0b1f3a";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";
const TEAL  = "#0d9488";
const BG    = "#f0f4f8";

const ROLE_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  admin:      { bg: "#fef3c715", color: "#92400e",  border: "#fde68a" },
  instructor: { bg: TEAL + "18",  color: TEAL,       border: TEAL + "30" },
  student:    { bg: "#3b82f615", color: "#3b82f6",  border: "#3b82f630" },
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.name ?? "User";
  const role        = user?.role ?? "user";
  const initial     = displayName.charAt(0).toUpperCase();
  const badge       = ROLE_BADGE[role] ?? ROLE_BADGE.student;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .nav-name{font-size:13px;font-weight:600;color:${NAVY};}
        .logout-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#94a3b8;font-family:inherit;padding:6px 10px;border-radius:8px;transition:all .15s;}
        .logout-btn:hover{background:#fee2e215;color:#ef4444;}
        @media(max-width:560px){.nav-name{display:none!important;}.logout-label{display:none!important;}}
      `}</style>

      {/* ── TOPNAV ── */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #e8edf2",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 16px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Left: Logo + Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={logo}
              alt="HandyGidi"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                objectFit: "contain",
                border: `2px solid ${GOLD}40`,
              }}
            />
            <div>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, lineHeight: 1.1 }}>
                HandyGidi
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, color: GOLD2, lineHeight: 1 }}>
                Training Centre
              </p>
            </div>
            {/* Role badge */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: 99,
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              textTransform: "capitalize",
              marginLeft: 4,
            }}>
              {role}
            </span>
          </div>

          {/* Right: Bell + User + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
              color: "#64748b",
            }}>
              <Bell size={18} />
            </button>

            {/* Avatar */}
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: NAVY,
              fontWeight: 800,
              fontSize: 13,
              flexShrink: 0,
            }}>
              {initial}
            </div>

            <span className="nav-name">{displayName}</span>

            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={13} />
              <span className="logout-label">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main>
        {children}
      </main>
    </div>
  );
}
