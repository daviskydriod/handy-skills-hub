// ── TopBar / Desktop Header ─────────────────────────────────────────────
// Admin-style header with:
//   • Hamburger / collapse toggle for sidebar
//   • HandyGidi LOGO (only appears here — NOT in sidebar)
//   • Page title
//   • Optional alert chips (pending courses, pending payments, etc.)
//   • Refresh button
//   • Bell icon

import { Bell, RefreshCw, ChevronLeft, Menu } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { NAVY, GOLD, GOLD2 } from "../../theme";

interface AlertChip {
  label: string;
  bg: string;
  color: string;
  border: string;
  icon: any;
  onClick: () => void;
}

interface TopBarProps {
  title: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRefresh: () => void;
  alertChips?: AlertChip[];
}

export function TopBar({
  title, sidebarOpen, onToggleSidebar, onRefresh, alertChips = [],
}: TopBarProps) {
  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid #e8edf2",
      position: "sticky", top: 0, zIndex: 30, height: 56,
      display: "flex", alignItems: "center", padding: "0 20px", gap: 14,
    }}>
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: 6, borderRadius: 8, color: "#64748b", display: "flex",
        }}
      >
        {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
      </button>

      {/* Logo — lives ONLY in header, not in sidebar */}
      <img
        src={logo}
        alt="HandyGidi"
        style={{
          width: 32, height: 32, borderRadius: 9, objectFit: "cover",
          border: `2px solid ${GOLD}55`, flexShrink: 0,
        }}
      />

      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontFamily: "'Sora',sans-serif", fontWeight: 800,
          fontSize: 15, color: NAVY,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {title}
        </h1>
      </div>

      {/* Alert chips */}
      {alertChips.map(chip => (
        <button
          key={chip.label}
          onClick={chip.onClick}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", background: chip.bg,
            border: `1px solid ${chip.border}`, borderRadius: 99,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <chip.icon size={11} style={{ color: chip.color }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: chip.color }}>{chip.label}</span>
        </button>
      ))}

      {/* Refresh */}
      <button
        onClick={onRefresh}
        style={{
          display: "flex", alignItems: "center", gap: 5, padding: "6px 13px",
          border: "1px solid #e2e8f0", borderRadius: 99, background: "#fff",
          cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b",
          fontFamily: "inherit",
        }}
      >
        <RefreshCw size={11} /> Refresh
      </button>

      {/* Bell */}
      <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#64748b" }}>
        <Bell size={17} />
      </button>
    </header>
  );
}
