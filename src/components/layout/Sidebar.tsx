// ── Desktop Sidebar ────────────────────────────────────────────────────
// Shared by Admin, Instructor, Student (desktop only).
// Logo is intentionally REMOVED — it lives in the TopBar header.

import { LogOut } from "lucide-react";
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
  user?: { name?: string; [key: string]: any };
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

  return (
    <aside
      className="sidebar-wrap"
      style={{
        width: W, background: "#fff", borderRight: "1px solid #e8edf2",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", zIndex: 40,
      }}
    >
      {/* Nav items — no logo section */}
      <nav style={{
        flex: 1, padding: "16px 8px",
        display: "flex", flexDirection: "column", gap: 3, overflowY: "auto",
      }}>
        {navItems.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            title={isOpen ? undefined : label}
            className="side-nib"
            style={{
              justifyContent: isOpen ? "flex-start" : "center",
              gap: isOpen ? 10 : 0,
              background: activeTab === key
                ? `linear-gradient(135deg,${GOLD},${GOLD2})`
                : "transparent",
              color: activeTab === key ? NAVY : "#64748b",
              position: "relative",
            }}
          >
            <Icon size={16} />
            {isOpen && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
            {isOpen && badge != null && badge > 0 && (
              <span style={{
                background: "#ef4444", color: "#fff", fontSize: 9,
                fontWeight: 800, padding: "1px 6px", borderRadius: 99,
              }}>{badge}</span>
            )}
            {!isOpen && badge != null && badge > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 6, width: 8, height: 8,
                borderRadius: "50%", background: "#ef4444",
              }} />
            )}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        borderTop: "1px solid #f1f5f9",
        padding: isOpen ? "12px 14px" : "12px 0",
        display: "flex", alignItems: "center",
        gap: isOpen ? 10 : 0,
        justifyContent: isOpen ? "flex-start" : "center",
      }}>
        <Avatar name={user?.name} size={32} />
        {isOpen && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: NAVY,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.name}
            </p>
            <button
              onClick={onLogout}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 600, color: "#94a3b8",
                fontFamily: "inherit", padding: 0,
              }}
            >
              <LogOut size={11} /> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
