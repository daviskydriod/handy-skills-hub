// ── DashboardLayout ─────────────────────────────────────────────────────
// Master layout wrapper.
// Desktop: Sidebar (collapsed/open) + TopBar + main content
// Mobile:  MobileHeader (Student-approved) + content + MobileBottomNav
//
// Handles:
//  - isMobile detection + resize listener
//  - sidebar open/close toggle
//  - hamburger menu open/close
//  - global styles injection

import { useState, useEffect, type ReactNode } from "react";
import { globalStyles } from "../../theme/styles";
import { Sidebar, type NavItem } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";

const isMobileWidth = () => window.innerWidth <= 768;

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Header title on desktop */
  pageTitle: string;
  /** Short label on mobile header subtitle (e.g. "Good day 👋") */
  mobileSubtitle: string;
  /** Bold text on mobile header */
  mobileTitleText: string;
  user?: { name?: string; email?: string; [key: string]: any };
  onLogout: () => void;
  onRefresh: () => void;
  /** Optional alert chips shown in desktop header */
  alertChips?: {
    label: string; bg: string; color: string; border: string;
    icon: any; onClick: () => void;
  }[];
  /** Show badge dot on mobile hamburger */
  hasMobileBadge?: boolean;
  /** Sidebar width when open (default 240) */
  sidebarWidth?: number;
}

export function DashboardLayout({
  children, navItems, activeTab, onTabChange,
  pageTitle, mobileSubtitle, mobileTitleText,
  user, onLogout, onRefresh, alertChips,
  hasMobileBadge, sidebarWidth = 240,
}: DashboardLayoutProps) {
  const [mobile,      setMobile]      = useState(isMobileWidth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen,    setMenuOpen]    = useState(false);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      minHeight: "100vh", background: "#f4f7fb",
      display: "flex", flexDirection: "column",
    }}>
      <style>{globalStyles}</style>

      {/* ══ DESKTOP ══ */}
      {!mobile ? (
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={onTabChange}
            user={user}
            onLogout={onLogout}
            isOpen={sidebarOpen}
            openWidth={sidebarWidth}
          />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <TopBar
              title={pageTitle}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(o => !o)}
              onRefresh={onRefresh}
              alertChips={alertChips}
            />
            <main style={{
              flex: 1, padding: "24px 20px",
              maxWidth: 1100, width: "100%", margin: "0 auto",
            }}>
              {children}
            </main>
          </div>
        </div>
      ) : (
        /* ══ MOBILE ══ */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: 70 }}>
          <MobileHeader
            user={user}
            subtitle={mobileSubtitle}
            title={mobileTitleText}
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onRefresh={onRefresh}
            onLogout={onLogout}
            showMenu={menuOpen}
            onToggleMenu={() => setMenuOpen(o => !o)}
            hasBadge={hasMobileBadge}
          />
          <main style={{ flex: 1, padding: "16px 16px 8px" }}>
            {children}
          </main>
          <MobileBottomNav
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>
      )}
    </div>
  );
}

// Export the isMobile helper so pages can use it
export const useMobile = () => {
  const [mobile, setMobile] = useState(isMobileWidth);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
};
