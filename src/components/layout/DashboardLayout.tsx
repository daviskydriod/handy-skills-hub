import { useState, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";

interface SidebarItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  items: SidebarItem[];
  title: string;
  userName?: string;
}

export default function DashboardLayout({ children, items, title, userName = "User" }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 gradient-primary text-primary-foreground transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-heading font-bold text-xs">HG</span>
            </div>
            <span className="font-heading font-bold text-sm">{title}</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? "bg-primary-foreground/10 text-accent"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <LogOut size={18} /> Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu size={22} /></button>
          <div className="ml-auto text-sm text-muted-foreground">Welcome, <span className="font-semibold text-foreground">{userName}</span></div>
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
