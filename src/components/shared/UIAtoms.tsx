// ── Shared UI Atoms ────────────────────────────────────────────────────
// Used by ALL dashboards (Student, Instructor, Admin)

import { BookOpen } from "lucide-react";
import { NAVY, GOLD, GOLD2 } from "../../theme";

// ── Avatar ─────────────────────────────────────────────────────────────
export const Avatar = ({
  name, size = 34,
  grad = `linear-gradient(135deg,${NAVY},${GOLD2})`,
}: { name?: string; size?: number; grad?: string }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", background: grad,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 800, fontSize: Math.round(size * .38), flexShrink: 0,
  }}>
    {(name ?? "?").charAt(0).toUpperCase()}
  </div>
);

// ── CourseThumb ────────────────────────────────────────────────────────
// Default mode: fixed square thumbnail (use size prop)
// Banner mode:  fills parent container edge-to-edge (pass banner prop)
//               Parent must have position:relative + overflow:hidden + a height set
export const CourseThumb = ({
  image, title, size = 44, banner = false,
}: { image?: string | null; title?: string; size?: number; banner?: boolean }) => {
  const cols = [NAVY, "#0891b2", "#7c3aed", "#db2777", "#d97706", "#16a34a"];
  const col  = cols[(title?.charCodeAt(0) ?? 0) % cols.length];

  // ── BANNER mode — fills the parent container completely ──────────────
  if (banner) {
    return image ? (
      <img
        src={image}
        alt={title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />
    ) : (
      // Fallback: gradient banner with centered icon when no image
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(135deg, ${col}22, ${col}44)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}>
        <BookOpen size={28} style={{ color: col, opacity: 0.7 }} />
        <span style={{
          fontSize: 11, fontWeight: 600, color: col,
          opacity: 0.6, maxWidth: "80%", textAlign: "center",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {title}
        </span>
      </div>
    );
  }

  // ── DEFAULT mode — fixed square icon thumbnail ───────────────────────
  return image ? (
    <img src={image} alt={title} style={{
      width: size, height: size, borderRadius: 10, objectFit: "cover", flexShrink: 0,
    }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: col + "18", border: `1.5px solid ${col}30`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <BookOpen size={Math.round(size * .38)} style={{ color: col }} />
    </div>
  );
};

// ── StatusBadge ────────────────────────────────────────────────────────
// Handles: published/pending (course), approved/pending/rejected (payment),
//          active/inactive (user), any role string
export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending:         { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "⏳ Pending"  },
    approved:        { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", label: "✅ Approved" },
    rejected:        { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", label: "❌ Rejected" },
    live:            { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", label: "🟢 Live"     },
    active:          { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", label: "Active"      },
    inactive:        { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", label: "Inactive"    },
    "pending approval": { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "⏳ Pending Approval" },
  };
  const s = map[status.toLowerCase()] ?? map.pending;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
};

// Convenience: course published/unpublished
export const CourseStatusBadge = ({ published }: { published: boolean }) => (
  <StatusBadge status={published ? "live" : "pending"} />
);

// Role badge
export const RoleBadge = ({ role }: { role: string }) => {
  const m: Record<string, string[]> = {
    admin:      ["#dbeafe", "#1e40af", "#bfdbfe"],
    instructor: ["#f3e8ff", "#6b21a8", "#e9d5ff"],
    student:    ["#f0fdf4", "#166534", "#bbf7d0"],
  };
  const [bg, color, border] = m[role] ?? m.student;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      {role}
    </span>
  );
};

// ── ProgressBar ────────────────────────────────────────────────────────
export const ProgressBar = ({ pct, color = GOLD }: { pct: number; color?: string }) => (
  <div style={{ width: "100%", background: "#e2e8f0", borderRadius: 99, height: 6, overflow: "hidden" }}>
    <div style={{
      height: "100%", borderRadius: 99, width: `${pct}%`,
      background: `linear-gradient(90deg,${color},${GOLD2})`,
      transition: "width .5s ease",
    }} />
  </div>
);

// ── Skeleton loaders ────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf2", padding: 16 }}>
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: "#e8edf2", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 13, width: "70%", background: "#e8edf2", borderRadius: 6 }} />
        <div style={{ height: 10, width: "45%", background: "#f1f5f9", borderRadius: 6 }} />
        <div style={{ height: 6, width: "100%", background: "#f1f5f9", borderRadius: 99, marginTop: 4 }} />
      </div>
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div style={{
    display: "flex", gap: 12, padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9", alignItems: "center",
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#e8edf2", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 13, width: "60%", background: "#e8edf2", borderRadius: 6 }} />
      <div style={{ height: 10, width: "35%", background: "#f1f5f9", borderRadius: 6 }} />
    </div>
  </div>
);

// ── StatCard ───────────────────────────────────────────────────────────
export const StatCard = ({
  label, value, icon: Icon, color, bg, mobile = false,
}: {
  label: string; value: string | number;
  icon: any; color: string; bg: string; mobile?: boolean;
}) => (
  <div className="dash-card" style={{
    padding: mobile ? "14px 12px" : "16px 18px",
    display: "flex", alignItems: "center", gap: mobile ? 10 : 14,
  }}>
    <div style={{
      width: mobile ? 36 : 42, height: mobile ? 36 : 42,
      borderRadius: 13, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={mobile ? 15 : 18} style={{ color }} />
    </div>
    <div>
      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 3 }}>{label}</p>
      <p style={{
        fontFamily: "'Sora',sans-serif", fontWeight: 800,
        fontSize: mobile ? 17 : 20, color: NAVY, lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  </div>
);
