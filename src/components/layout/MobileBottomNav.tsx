// ── MobileBottomNav ─────────────────────────────────────────────────────
// Student-approved bottom nav style — used by ALL dashboards on mobile.

import { GOLD, GOLD2 } from "../../theme";
import type { NavItem } from "./Sidebar";

interface MobileBottomNavProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function MobileBottomNav({ navItems, activeTab, onTabChange }: MobileBottomNavProps) {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ key, label, icon: Icon, badge }) => (
        <button
          key={key}
          className="bnav-item"
          onClick={() => onTabChange(key)}
        >
          <div style={{ position: "relative" }}>
            <div style={{
              width: 44, height: 28, borderRadius: 99,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: activeTab === key ? GOLD + "20" : "transparent",
              transition: "all .2s",
            }}>
              <Icon
                size={20}
                style={{
                  color: activeTab === key ? GOLD2 : "#94a3b8",
                  transition: "color .2s",
                }}
              />
            </div>
            {badge != null && badge > 0 && (
              <span style={{
                position: "absolute", top: -3, right: -3,
                width: 16, height: 16, borderRadius: "50%",
                background: "#f97316", color: "#fff",
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {badge}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: activeTab === key ? 700 : 500,
            color: activeTab === key ? GOLD2 : "#94a3b8",
            marginTop: 3, transition: "color .2s",
          }}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
