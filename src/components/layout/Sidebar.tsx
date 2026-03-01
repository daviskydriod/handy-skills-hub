// ── Desktop Sidebar ────────────────────────────────────────────────────
// Shared by Admin, Instructor, Student (desktop only).
//
// Structure:
//   ┌─────────────────────────┐
//   │  HEADER  (56px — aligns │  ← app brand, matches TopBar height
//   │  with TopBar)           │
//   ├─────────────────────────┤
//   │  USER CARD              │  ← avatar + name + role pill
//   ├─────────────────────────┤
//   │  NAV SECTION LABEL      │  ← "NAVIGATION" label
//   │  nav items…             │
//   ├─────────────────────────┤
//   │  FOOTER (sign out)      │
//   └─────────────────────────┘

import { LogOut } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { NAVY, GOLD, GOLD2 } from "../../theme";
import { Avatar } from "../shared/UIAtoms";

export interface NavItem {
  key: string;
  label: string;
  icon: any;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  user?: { name?: string; role?: string; email?: string; [key: string]: any };
  onLogout: () => void;
  isOpen: boolean;
  /** Width when open (default 240) */
  openWidth?: number;
}

const COLLAPSED_W = 64;

export function Sidebar({
  navItems, activeTab, onTabChange, user, onLogout,
  isOpen, openWidth = 240,
}: SidebarProps) {
  const W = isOpen ? openWidth : COLLAPSED_W;

  // Derive a display role label
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Member";

  return (
    <aside
      className="sidebar-wrap"
      style={{
        width: W,
        background: NAVY,
        borderRight: "none",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 40,
        boxShadow: "2px 0 16px rgba(11,31,58,0.18)",
      }}
    >

      {/* ── HEADER — matches TopBar height (56px) ─────────────────── */}
      <div style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: isOpen ? "flex-start" : "center",
        padding: isOpen ? "0 16px" : "0",
        gap: 10,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* Logo image */}
        <img
          src={logo}
          alt="HandyGidi"
          style={{
            width: 32, height: 32,
            borderRadius: 9,
            objectFit: "cover",
            flexShrink: 0,
            border: `2px solid ${GOLD}55`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.25)`,
          }}
        />

        {/* App name — only when open */}
        {isOpen && (
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: 13, fontWeight: 800, color: "#fff",
              letterSpacing: "-0.02em", lineHeight: 1.1,
              fontFamily: "'Sora', 'DM Sans', sans-serif",
            }}>
              HandyGidi
            </p>
            <p style={{
              fontSize: 9, fontWeight: 600, color: GOLD,
              letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1,
              marginTop: 2,
            }}>
              Training Centre
            </p>
          </div>
        )}
      </div>

      {/* ── USER PROFILE CARD ──────────────────────────────────────── */}
      {isOpen ? (
        <div style={{
          margin: "14px 12px 0",
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.09)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          <Avatar
            name={user?.name}
            size={36}
            grad={`linear-gradient(135deg, ${GOLD2}, ${GOLD})`}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 13, fontWeight: 700, color: "#fff",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}>
              {user?.name ?? "User"}
            </p>
            {/* Role pill */}
            <span style={{
              display: "inline-block",
              marginTop: 4,
              fontSize: 9, fontWeight: 700,
              padding: "2px 8px", borderRadius: 99,
              background: `${GOLD}22`,
              color: GOLD,
              border: `1px solid ${GOLD}44`,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              {roleLabel}
            </span>
          </div>
        </div>
      ) : (
        // Collapsed: just center the avatar with extra top gap
        <div style={{
          display: "flex", justifyContent: "center",
          paddingTop: 14, paddingBottom: 4, flexShrink: 0,
        }}>
          <Avatar
            name={user?.name}
            size={32}
            grad={`linear-gradient(135deg, ${GOLD2}, ${GOLD})`}
          />
        </div>
      )}

      {/* ── NAV SECTION ────────────────────────────────────────────── */}
      <nav style={{
        flex: 1,
        padding: isOpen ? "16px 10px 8px" : "14px 8px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
      }}>
        {/* Section label */}
        {isOpen && (
          <p style={{
            fontSize: 9, fontWeight: 700,
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0 10px 8px",
          }}>
            Navigation
          </p>
        )}

        {navItems.map(({ key, label, icon: Icon, badge }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              title={isOpen ? undefined : label}
              className="side-nib"
              style={{
                justifyContent: isOpen ? "flex-start" : "center",
                gap: isOpen ? 10 : 0,
                background: isActive
                  ? `linear-gradient(135deg, ${GOLD}, ${GOLD2})`
                  : "transparent",
                color: isActive ? NAVY : "rgba(255,255,255,0.60)",
                position: "relative",
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? `0 2px 10px ${GOLD}40` : "none",
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {isOpen && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
              {isOpen && badge != null && badge > 0 && (
                <span style={{
                  background: "#ef4444", color: "#fff", fontSize: 9,
                  fontWeight: 800, padding: "1px 7px", borderRadius: 99,
                  flexShrink: 0,
                }}>{badge}</span>
              )}
              {!isOpen && badge != null && badge > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6, width: 7, height: 7,
                  borderRadius: "50%", background: "#ef4444",
                  border: `1.5px solid ${NAVY}`,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── FOOTER — sign out ──────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: isOpen ? "12px 10px" : "12px 8px",
      }}>
        <button
          onClick={onLogout}
          className="side-nib"
          style={{
            justifyContent: isOpen ? "flex-start" : "center",
            gap: isOpen ? 10 : 0,
            color: "rgba(255,255,255,0.40)",
            width: "100%",
            fontWeight: 500,
          }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          {isOpen && <span>Sign out</span>}
        </button>
      </div>

    </aside>
  );
}
