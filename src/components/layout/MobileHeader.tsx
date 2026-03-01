// ── MobileHeader ───────────────────────────────────────────────────────
// Student-approved mobile header style — used by ALL dashboards on mobile.
// Shows: Avatar | Page subtitle + title | Refresh | Hamburger dropdown

import { RefreshCw, Menu, LogOut, X } from "lucide-react";
import { NAVY, GOLD, GOLD2 } from "../../theme";
import { Avatar } from "../shared/UIAtoms";
import type { NavItem } from "./Sidebar";

interface MobileHeaderProps {
  user?: { name?: string; email?: string; [key: string]: any };
  /** Short subtitle above the title (e.g. "Good day 👋") */
  subtitle: string;
  /** Bold title line */
  title: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  showMenu: boolean;
  onToggleMenu: () => void;
  /** Optional badge dot on hamburger */
  hasBadge?: boolean;
}

export function MobileHeader({
  user, subtitle, title,
  navItems, activeTab, onTabChange,
  onRefresh, onLogout,
  showMenu, onToggleMenu, hasBadge,
}: MobileHeaderProps) {
  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid #f1f5f9",
      position: "sticky", top: 0, zIndex: 30,
      padding: "14px 16px 12px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      {/* Avatar */}
      <Avatar name={user?.name} size={36} />

      {/* Title block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{subtitle}</p>
        <p style={{
          fontFamily: "'Sora',sans-serif", fontWeight: 800,
          fontSize: 15, color: NAVY, lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {title}
        </p>
      </div>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        style={{
          background: "#f1f5f9", border: "none", borderRadius: "50%",
          width: 36, height: 36, display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", color: "#64748b",
        }}
      >
        <RefreshCw size={14} />
      </button>

      {/* Hamburger */}
      <div style={{ position: "relative" }}>
        <button
          onClick={onToggleMenu}
          style={{
            background: showMenu ? GOLD + "20" : "#f1f5f9",
            border: "none", borderRadius: "50%",
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: showMenu ? GOLD2 : "#64748b",
            position: "relative", transition: "all .2s",
          }}
        >
          <Menu size={18} />
          {hasBadge && (
            <span style={{
              position: "absolute", top: 5, right: 5,
              width: 8, height: 8, borderRadius: "50%",
              background: "#f97316", border: "2px solid #fff",
            }} />
          )}
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              onClick={onToggleMenu}
              style={{ position: "fixed", inset: 0, zIndex: 90 }}
            />
            {/* Dropdown */}
            <div
              className="menu-dropdown"
              style={{
                position: "absolute", top: 44, right: 0, zIndex: 100,
                background: "#fff", borderRadius: 16, border: "1px solid #e8edf2",
                boxShadow: "0 8px 32px rgba(0,0,0,.13)",
                minWidth: 210, padding: 8,
              }}
            >
              {/* User info */}
              <div style={{
                padding: "10px 12px 12px", borderBottom: "1px solid #f1f5f9",
                marginBottom: 6, display: "flex", alignItems: "center", gap: 10,
              }}>
                <Avatar name={user?.name} size={34} />
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontWeight: 700, fontSize: 13, color: NAVY,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {user?.name}
                  </p>
                  <p style={{
                    fontSize: 11, color: "#94a3b8", marginTop: 1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Nav links */}
              {navItems.map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  onClick={() => { onTabChange(key); onToggleMenu(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", border: "none", borderRadius: 10,
                    cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                    fontWeight: 600, transition: "all .15s",
                    background: activeTab === key ? GOLD + "15" : "transparent",
                    color: activeTab === key ? GOLD2 : "#475569",
                  }}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                  {badge != null && badge > 0 && (
                    <span style={{
                      background: "#f97316", color: "#fff",
                      fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99,
                    }}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}

              {/* Sign out */}
              <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 6, paddingTop: 6 }}>
                <button
                  onClick={onLogout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", border: "none", borderRadius: 10,
                    cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                    fontWeight: 700, background: "transparent", color: "#ef4444",
                    transition: "all .15s",
                  }}
                >
                  <LogOut size={15} style={{ flexShrink: 0 }} />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
