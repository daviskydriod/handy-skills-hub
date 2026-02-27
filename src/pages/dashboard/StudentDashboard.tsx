// File: src/pages/dashboard/StudentDashboard.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Search, CheckCircle, TrendingUp, BarChart2,
  RefreshCw, Play, Clock, Users, Star, CreditCard, Upload,
  X, AlertCircle, Copy, Check, LayoutDashboard, Compass,
  ChevronLeft, Menu, Bell, LogOut, DollarSign, FileText,
  ChevronRight, Circle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";
import { submitPayment, getMyPayments, type Payment } from "@/api/payments";


const location = useLocation();

useEffect(() => {
  if (!isAuthenticated) return;
  // Fires on every navigation TO this page, with a short delay
  // to allow the player's 2-second debounced sync to complete
  const timer = setTimeout(() => {
    fetchEnrolled();
    fetchPayments();
  }, 600);
  return () => clearTimeout(timer);
}, [location, isAuthenticated, fetchEnrolled, fetchPayments]);

// ── Theme ─────────────────────────────────────────────────────────────
// ✅ FIX: TEAL was incorrectly set to "#0b1f3a" (navy). Corrected to teal.
const TEAL    = "#0d9488";
const TEAL2   = "#0f766e";
const NAVY    = "#0b1f3a";
const SIDEBAR_W = 240;

// ── Bank details ──────────────────────────────────────────────────────
const BANK_DETAILS = {
  bankName:      "First Bank Nigeria",
  accountNumber: "0123456789",
  accountName:   "HandyGidi Training Centre",
};

type TabType = "overview" | "my-courses" | "explore" | "payments";

// ── Helpers ───────────────────────────────────────────────────────────
const CourseThumb = ({ image, title, size = 44 }: { image?: string | null; title?: string; size?: number }) => {
  const cols = [TEAL, "#0891b2", "#7c3aed", "#db2777", "#d97706", "#16a34a"];
  const col  = cols[(title?.charCodeAt(0) ?? 0) % cols.length];
  return image ? (
    <img src={image} alt={title} style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 10, background: col + "18", border: `1px solid ${col}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <BookOpen size={Math.round(size * 0.38)} style={{ color: col }} />
    </div>
  );
};

const UserAvatar = ({ name, size = 34 }: { name?: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${TEAL},${NAVY})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: Math.round(size * 0.38), flexShrink: 0 }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

const ProgressBar = ({ pct }: { pct: number }) => (
  <div style={{ width: "100%", background: "#e2e8f0", borderRadius: 99, height: 6, overflow: "hidden" }}>
    <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${TEAL},${TEAL2})`, width: `${pct}%`, transition: "width .5s ease" }} />
  </div>
);

const SkeletonCard = () => (
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

const SkeletonRow = () => (
  <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#e8edf2", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 13, width: "60%", background: "#e8edf2", borderRadius: 6 }} />
      <div style={{ height: 10, width: "35%", background: "#f1f5f9", borderRadius: 6 }} />
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending:  { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "⏳ Pending" },
    approved: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", label: "✅ Approved" },
    rejected: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", label: "❌ Rejected" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, badge, collapsed }: {
  icon: any; label: string; active: boolean; onClick: () => void; badge?: number; collapsed: boolean;
}) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    style={{
      width: "100%", display: "flex", alignItems: "center",
      gap: collapsed ? 0 : 10,
      justifyContent: collapsed ? "center" : "flex-start",
      padding: collapsed ? "11px 0" : "11px 16px",
      border: "none", borderRadius: 12, cursor: "pointer",
      fontFamily: "inherit", fontSize: 13, fontWeight: 600,
      transition: "all .18s",
      background: active ? TEAL : "transparent",
      color: active ? "#fff" : "#64748b",
      position: "relative",
    }}
  >
    <Icon size={16} />
    {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
    {!collapsed && badge != null && badge > 0 && (
      <span style={{ background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99 }}>{badge}</span>
    )}
    {collapsed && badge != null && badge > 0 && (
      <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />
    )}
  </button>
);

// ── Payment Modal ─────────────────────────────────────────────────────
const PaymentModal = ({ course, onClose, onSubmitted }: {
  course: Course; onClose: () => void; onSubmitted: () => void;
}) => {
  const [step, setStep]       = useState<"bank" | "upload" | "done">("bank");
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSub]  = useState(false);
  const [copied, setCopied]   = useState(false);
  const fileRef               = useRef<HTMLInputElement>(null);

  const copyAcct = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!file) { toast({ title: "Please upload your payment receipt", variant: "destructive" }); return; }
    setSub(true);
    try {
      const fd = new FormData();
      fd.append("course_id", String(course.id));
      fd.append("amount",    String(course.price));
      fd.append("proof_image", file);
      await submitPayment(fd);
      setStep("done");
      onSubmitted();
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Failed to submit. Please try again.", variant: "destructive" });
    } finally { setSub(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: NAVY, marginBottom: 3 }}>
              {step === "done" ? "Payment Submitted! 🎉" : "Enroll in Course"}
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{course.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {step === "bank" && (
          <div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Amount to Pay</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, color: NAVY, marginBottom: 16 }}>₦{course.price.toLocaleString()}</p>
              <div style={{ height: 1, background: "#e2e8f0", marginBottom: 16 }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Bank Transfer Details</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Bank Name", BANK_DETAILS.bankName], ["Account Name", BANK_DETAILS.accountName]].map(([label, val]) => (
                  <div key={label}>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{val}</p>
                  </div>
                ))}
                <div>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Account Number</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: 2 }}>{BANK_DETAILS.accountNumber}</p>
                    <button onClick={copyAcct} style={{ background: copied ? "#d1fae5" : "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: copied ? "#065f46" : "#64748b", transition: "all .2s" }}>
                      {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: 12, display: "flex", gap: 8, marginBottom: 18 }}>
              <AlertCircle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "#92400e" }}>Make the transfer, take a screenshot of your receipt, then click Next.</p>
            </div>
            <button onClick={() => setStep("upload")} style={{ width: "100%", padding: 12, background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              I've Made the Transfer →
            </button>
          </div>
        )}

        {step === "upload" && (
          <div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>Upload a screenshot of your payment receipt for verification.</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
            {!preview ? (
              <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "32px 16px", border: "2px dashed #cbd5e1", borderRadius: 14, background: "#f8fafc", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <Upload size={28} style={{ color: "#94a3b8" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Tap to upload receipt</p>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>JPG, PNG — screenshot or photo</p>
              </button>
            ) : (
              <div style={{ position: "relative", marginBottom: 18 }}>
                <img src={preview} alt="Receipt" style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: 260, objectFit: "contain", background: "#f8fafc" }} />
                <button onClick={() => { setFile(null); setPreview(null); }} style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: "#ef4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={12} color="#fff" />
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("bank")} style={{ flex: 1, padding: 11, border: "1px solid #e2e8f0", borderRadius: 12, background: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, color: "#64748b" }}>← Back</button>
              <button onClick={handleSubmit} disabled={!file || submitting} style={{ flex: 2, padding: 11, background: file ? `linear-gradient(135deg,${TEAL},${TEAL2})` : "#e2e8f0", color: file ? "#fff" : "#94a3b8", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: file ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all .2s" }}>
                {submitting ? "Submitting…" : "Submit for Approval"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle size={30} style={{ color: "#065f46" }} />
            </div>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 8, lineHeight: 1.6 }}>Your receipt has been submitted. Our team will review it shortly.</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: TEAL, marginBottom: 24 }}>You'll be notified once your enrollment is confirmed.</p>
            <button onClick={onClose} style={{ padding: "10px 28px", background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff", border: "none", borderRadius: 99, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Got it!</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────
interface Props { defaultTab?: TabType; }

export default function StudentDashboard({ defaultTab = "overview" }: Props) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [tab,          setTab]          = useState<TabType>(defaultTab);
  const [enrolled,     setEnrolled]     = useState<EnrolledCourse[]>([]);
  const [explore,      setExplore]      = useState<Course[]>([]);
  const [payments,     setPayments]     = useState<Payment[]>([]);
  const [loadingE,     setLE]           = useState(true);
  const [loadingX,     setLX]           = useState(false);
  const [loadingP,     setLP]           = useState(false);
  const [search,       setSearch]       = useState("");
  const [payingCourse, setPayingCourse] = useState<Course | null>(null);

  const enrolledIds     = new Set(enrolled.map(c => c.id));
  const pendingPayments = payments.filter(p => p.status === "pending");
  const SW              = sidebarOpen ? SIDEBAR_W : 64;

  const fetchEnrolled = useCallback(async () => {
    setLE(true);
    try { setEnrolled(await getMyEnrollments()); }
    catch { toast({ title: "Failed to load your courses", variant: "destructive" }); }
    finally { setLE(false); }
  }, []);

  const fetchExplore = useCallback(async () => {
    setLX(true);
    try { const r = await getCourses({ limit: 20 }); setExplore(r.courses); }
    catch { toast({ title: "Failed to load courses", variant: "destructive" }); }
    finally { setLX(false); }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLP(true);
    try { setPayments(await getMyPayments()); }
    catch {}
    finally { setLP(false); }
  }, []);

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEnrolled(); fetchExplore(); fetchPayments();
  }, [isAuthenticated, fetchEnrolled, fetchExplore, fetchPayments]);

  // ✅ FIX: Re-fetch enrolled courses when user comes BACK to this tab
  // from the course player — this is what updates the progress bars.
  // The player syncs progress to the DB, and this pulls the fresh data.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        fetchEnrolled();
        fetchPayments();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isAuthenticated, fetchEnrolled, fetchPayments]);

  // ✅ FIX: Also refresh when the browser tab gets focus (covers
  // the case where the player is on the same tab via router navigation)
  useEffect(() => {
    const onFocus = () => {
      if (isAuthenticated) fetchEnrolled();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated, fetchEnrolled]);

  const total       = enrolled.length;
  const completed   = enrolled.filter(c => c.completed).length;
  const inProgress  = enrolled.filter(c => !c.completed && c.progress > 0).length;
  const avgProgress = total ? Math.round(enrolled.reduce((a, c) => a + c.progress, 0) / total) : 0;

  const filteredExplore = explore.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const navItems: { key: TabType; label: string; icon: any; badge?: number }[] = [
    { key: "overview",   label: "Overview",    icon: LayoutDashboard },
    { key: "my-courses", label: "My Courses",  icon: BookOpen },
    { key: "explore",    label: "Explore",     icon: Compass },
    { key: "payments",   label: "My Payments", icon: DollarSign, badge: pendingPayments.length },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#f6f8fb", display: "flex" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .card{background:#fff;border-radius:16px;border:1px solid #e8edf2;}
        .btnt{background:linear-gradient(135deg,${TEAL},${TEAL2});color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .2s;}
        .btnt:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(13,148,136,.28);}
        .btnt:disabled{opacity:.6;transform:none;}
        .icn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;transition:all .15s;flex-shrink:0;}
        .icn:hover{background:#f1f5f9;}
        .arow{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #f8fafc;transition:background .15s;}
        .arow:hover{background:#fafcff;}
        .arow:last-child{border-bottom:none;}
        .ccard{background:#fff;border-radius:16px;border:1px solid #e8edf2;transition:all .25s;overflow:hidden;}
        .ccard:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.08);}
        .sidebar{transition:width .22s cubic-bezier(.4,0,.2,1);overflow:hidden;flex-shrink:0;}
        .ptable{width:100%;border-collapse:collapse;}
        .ptable th{text-align:left;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;padding:10px 14px;border-bottom:2px solid #f1f5f9;}
        .ptable td{padding:12px 14px;border-bottom:1px solid #f8fafc;font-size:13px;color:${NAVY};}
        .ptable tr:last-child td{border-bottom:none;}
        .ptable tr:hover td{background:#fafcff;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @media(max-width:700px){.hide-sm{display:none!important;}.g4{grid-template-columns:repeat(2,1fr)!important;}.g3{grid-template-columns:1fr!important;}}
        @media(min-width:701px){.g4{grid-template-columns:repeat(4,1fr);}.g3{grid-template-columns:repeat(3,1fr);}}
      `}</style>

      {payingCourse && (
        <PaymentModal
          course={payingCourse}
          onClose={() => setPayingCourse(null)}
          onSubmitted={() => { setPayingCourse(null); fetchEnrolled(); fetchPayments(); }}
        />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="sidebar" style={{ width: SW, background: "#fff", borderRight: "1px solid #e8edf2", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", zIndex: 40 }}>
        <div style={{ padding: sidebarOpen ? "18px 16px 14px" : "18px 0 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
          {sidebarOpen && (
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: NAVY }}>Student Portal</span>
          )}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {navItems.map(({ key, label, icon, badge }) => (
            <NavItem key={key} icon={icon} label={label} active={tab === key} badge={badge} collapsed={!sidebarOpen} onClick={() => setTab(key as TabType)} />
          ))}
        </nav>
        <div style={{ borderTop: "1px solid #f1f5f9", padding: sidebarOpen ? "12px 16px" : "12px 0", display: "flex", alignItems: "center", gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
          <UserAvatar name={user?.name} size={32} />
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
              <button onClick={() => { logout(); navigate("/"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#94a3b8", fontFamily: "inherit", padding: 0 }}>
                <LogOut size={11} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #e8edf2", position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 20px", gap: 14 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#64748b", display: "flex" }}>
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: NAVY }}>
              {tab === "overview"    ? `Welcome back, ${user?.name?.split(" ")[0] ?? "Student"} 👋`
               : tab === "my-courses" ? "My Courses"
               : tab === "explore"    ? "Explore Courses"
               :                        "My Payments"}
            </h1>
          </div>
          <button onClick={() => { fetchEnrolled(); fetchExplore(); fetchPayments(); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", border: "1px solid #e2e8f0", borderRadius: 99, background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b", fontFamily: "inherit" }}>
            <RefreshCw size={11} /> Refresh
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#64748b" }}><Bell size={17} /></button>
        </header>

        <main style={{ flex: 1, padding: "24px 20px", maxWidth: 1080, width: "100%", margin: "0 auto" }}>

          {/* ════ OVERVIEW ════ */}
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gap: 12 }} className="g4">
                {[
                  { label: "Enrolled",     value: loadingE ? "—" : total,             icon: BookOpen,    color: TEAL,      bg: TEAL + "15" },
                  { label: "Completed",    value: loadingE ? "—" : completed,         icon: CheckCircle, color: "#10b981", bg: "#10b98115" },
                  { label: "In Progress",  value: loadingE ? "—" : inProgress,        icon: TrendingUp,  color: "#3b82f6", bg: "#3b82f615" },
                  { label: "Avg Progress", value: loadingE ? "—" : `${avgProgress}%`, icon: BarChart2,   color: "#8b5cf6", bg: "#8b5cf615" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={17} style={{ color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: NAVY, lineHeight: 1.1 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {pendingPayments.length > 0 && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 2 }}>
                      {pendingPayments.length} Payment{pendingPayments.length > 1 ? "s" : ""} Awaiting Approval
                    </p>
                    <p style={{ fontSize: 12, color: "#64748b" }}>Your payment receipts are being reviewed. You'll get access once approved.</p>
                  </div>
                  <button onClick={() => setTab("payments")} style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: "none", border: `1px solid ${TEAL}40`, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    View →
                  </button>
                </div>
              )}

              {/* Continue learning */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: NAVY }}>Continue Learning</h2>
                  <button onClick={() => setTab("my-courses")} style={{ background: "none", border: "none", cursor: "pointer", color: TEAL2, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                {loadingE ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
                    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : enrolled.filter(c => !c.completed).length === 0 ? (
                  <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
                    <BookOpen size={32} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
                    <p style={{ color: "#94a3b8", fontSize: 13 }}>No courses in progress.</p>
                    <button onClick={() => setTab("explore")} style={{ background: "none", border: "none", cursor: "pointer", color: TEAL2, fontWeight: 700, fontSize: 13, fontFamily: "inherit", marginTop: 8 }}>Browse courses →</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
                    {enrolled.filter(c => !c.completed).slice(0, 3).map(c => (
                      <div key={c.id} className="ccard" style={{ cursor: "pointer" }} onClick={() => navigate(`/learn/${c.id}`)}>
                        <div style={{ padding: 16 }}>
                          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                            <CourseThumb title={c.title} image={c.image} size={52} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, lineHeight: 1.3, marginBottom: 3 }}>{c.title}</p>
                              <p style={{ fontSize: 11, color: "#94a3b8" }}>by {c.instructor}</p>
                            </div>
                          </div>
                          <ProgressBar pct={c.progress} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{c.progress}% complete</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: TEAL }}>
                              <Play size={10} /> Continue
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested */}
              {explore.filter(c => !enrolledIds.has(c.id)).length > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: NAVY }}>Suggested for You</h2>
                    <button onClick={() => setTab("explore")} style={{ background: "none", border: "none", cursor: "pointer", color: TEAL2, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                      See all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }} className="g3">
                    {explore.filter(c => !enrolledIds.has(c.id)).slice(0, 3).map(c => (
                      <div key={c.id} className="ccard">
                        <div style={{ height: 110, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          <CourseThumb title={c.title} image={c.image} size={56} />
                          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: TEAL, color: "#fff" }}>{c.category}</span>
                        </div>
                        <div style={{ padding: 14 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>by {c.instructor}</p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: c.price === 0 ? "#10b981" : NAVY }}>
                              {c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}
                            </span>
                            <button onClick={() => setPayingCourse(c)} className="btnt" style={{ padding: "7px 16px", fontSize: 11 }}>Enroll</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ MY COURSES ════ */}
          {tab === "my-courses" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>My Courses</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{total} course{total !== 1 ? "s" : ""} enrolled</p>
                </div>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                {loadingE ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) :
                  enrolled.length === 0 ? (
                    <div style={{ padding: "64px 24px", textAlign: "center" }}>
                      <BookOpen size={40} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                      <p style={{ color: "#94a3b8", marginBottom: 16 }}>You haven't enrolled in any courses yet.</p>
                      <button onClick={() => setTab("explore")} className="btnt" style={{ padding: "10px 24px", fontSize: 13 }}>Browse Courses</button>
                    </div>
                  ) : enrolled.map(c => (
                    <div key={c.id} className="arow">
                      <CourseThumb title={c.title} image={c.image} size={46} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{c.title}</p>
                          <span style={{ background: c.completed ? "#d1fae5" : "#fef3c7", color: c.completed ? "#065f46" : "#92400e", border: `1px solid ${c.completed ? "#a7f3d0" : "#fde68a"}`, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                            {c.completed ? "Completed" : "Active"}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>by {c.instructor} · {c.category}</p>
                        <ProgressBar pct={c.progress} />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{c.progress}% complete</span>
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{c.completed ? "✓ Finished" : `${100 - c.progress}% left`}</span>
                        </div>
                      </div>
                      <div className="hide-sm" style={{ flexShrink: 0, position: "relative", width: 48, height: 48 }}>
                        <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke={TEAL} strokeWidth="5"
                            strokeDasharray={`${(c.progress / 100) * (2 * Math.PI * 20)} ${2 * Math.PI * 20}`} strokeLinecap="round" />
                        </svg>
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: NAVY }}>{c.progress}%</span>
                      </div>
                      <button onClick={() => navigate(`/learn/${c.id}`)} className="btnt" style={{ padding: "8px 14px", fontSize: 11, borderRadius: 10 }}>
                        <Play size={11} /> {c.progress > 0 ? "Continue" : "Start"}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ════ EXPLORE ════ */}
          {tab === "explore" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>Explore Courses</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{filteredExplore.length} courses available</p>
                </div>
              </div>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or category…"
                  style={{ width: "100%", paddingLeft: 42, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", color: NAVY }} />
              </div>
              {loadingX ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : filteredExplore.length === 0 ? (
                <div className="card" style={{ padding: "64px 24px", textAlign: "center" }}>
                  <Search size={28} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
                  <p style={{ color: "#94a3b8" }}>No courses match your search.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                  {filteredExplore.map(c => {
                    const isEnrolled = enrolledIds.has(c.id);
                    const hasPending = payments.some(p => p.course_id === c.id && p.status === "pending");
                    return (
                      <div key={c.id} className="ccard">
                        <div style={{ height: 140, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                          <CourseThumb title={c.title} image={c.image} size={64} />
                          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: TEAL, color: "#fff", textTransform: "uppercase" }}>{c.category}</span>
                          {isEnrolled && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "#10b981", color: "#fff" }}>Enrolled</span>}
                          {!isEnrolled && hasPending && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "#f59e0b", color: "#fff" }}>⏳ Pending</span>}
                        </div>
                        <div style={{ padding: 16 }}>
                          <h3 style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 4, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>{c.title}</h3>
                          <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>by {c.instructor}</p>
                          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{c.duration ?? "—"}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><BookOpen size={10} />{c.lessons} lessons</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={10} />{c.enrolled}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} style={{ fill: i <= Math.floor(c.rating) ? "#f59e0b" : "#e2e8f0", color: i <= Math.floor(c.rating) ? "#f59e0b" : "#e2e8f0" }} />)}
                            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginLeft: 3 }}>{c.rating.toFixed(1)}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                            <div>
                              <p style={{ fontWeight: 800, fontSize: 16, color: c.price === 0 ? "#10b981" : NAVY }}>{c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}</p>
                              {c.price > 0 && <p style={{ fontSize: 10, color: "#94a3b8" }}>bank transfer</p>}
                            </div>
                            {isEnrolled ? (
                              <button onClick={() => navigate(`/learn/${c.id}`)} className="btnt" style={{ padding: "8px 14px", fontSize: 11 }}>
                                <Play size={10} /> Continue
                              </button>
                            ) : hasPending ? (
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 99, padding: "6px 12px" }}>⏳ Pending</span>
                            ) : (
                              <button onClick={() => setPayingCourse(c)} className="btnt" style={{ padding: "8px 16px", fontSize: 11 }}>
                                <CreditCard size={11} /> Enroll
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════ PAYMENTS ════ */}
          {tab === "payments" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>My Payments</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{payments.length} payment record{payments.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div style={{ display: "grid", gap: 12, marginBottom: 20 }} className="g3">
                {[
                  { label: "Total Paid", value: `₦${payments.filter(p => p.status === "approved").reduce((a, p) => a + p.amount, 0).toLocaleString()}`, color: "#10b981", bg: "#10b98115" },
                  { label: "Pending",    value: pendingPayments.length,                                                                                   color: "#f59e0b", bg: "#f59e0b15" },
                  { label: "Rejected",   value: payments.filter(p => p.status === "rejected").length,                                                     color: "#ef4444", bg: "#ef444415" },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DollarSign size={17} style={{ color: s.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{s.label}</p>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: NAVY }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                {loadingP ? [1, 2, 3].map(i => <SkeletonRow key={i} />) :
                  payments.length === 0 ? (
                    <div style={{ padding: "64px 24px", textAlign: "center" }}>
                      <FileText size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                      <p style={{ color: "#94a3b8", marginBottom: 16 }}>No payment history yet.</p>
                      <button onClick={() => setTab("explore")} className="btnt" style={{ padding: "10px 24px", fontSize: 13 }}>Browse Courses</button>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="ptable">
                        <thead>
                          <tr><th>Course</th><th>Amount</th><th>Status</th><th>Date</th><th>Note</th></tr>
                        </thead>
                        <tbody>
                          {payments.map(p => (
                            <tr key={p.id}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 36, height: 36, borderRadius: 8, background: TEAL + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <BookOpen size={14} style={{ color: TEAL }} />
                                  </div>
                                  <div>
                                    <p style={{ fontWeight: 600, fontSize: 13 }}>{p.course_title ?? `Course #${p.course_id}`}</p>
                                    <p style={{ fontSize: 11, color: "#94a3b8" }}>ID #{p.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontWeight: 700 }}>₦{p.amount.toLocaleString()}</td>
                              <td><StatusBadge status={p.status} /></td>
                              <td style={{ color: "#64748b" }}>{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                              <td style={{ color: "#94a3b8", fontSize: 12 }}>
                                {p.status === "rejected" && p.rejection_reason
                                  ? <span style={{ color: "#ef4444" }}>{p.rejection_reason}</span>
                                  : p.status === "approved"
                                  ? <span style={{ color: "#10b981" }}>Enrolled ✓</span>
                                  : <span>Awaiting review</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
