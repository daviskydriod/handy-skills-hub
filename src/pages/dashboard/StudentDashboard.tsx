// File: src/pages/dashboard/StudentDashboard.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen, Search, CheckCircle, TrendingUp, BarChart2,
  RefreshCw, Play, Clock, Users, Star, CreditCard, Upload,
  X, AlertCircle, Copy, Check, LayoutDashboard, Compass,
  Bell, LogOut, DollarSign, FileText,
  ChevronRight, MessageSquare,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";
import { submitPayment, getMyPayments, type Payment } from "@/api/payments";
import ReviewModal from "@/components/ReviewModal";

// ── Theme ─────────────────────────────────────────────────────────────
const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";

const BANK_DETAILS = {
  bankName:      "First Bank Nigeria",
  accountNumber: "0123456789",
  accountName:   "HandyGidi Training Centre",
};

type TabType = "overview" | "my-courses" | "explore" | "payments";

// ── Helpers ───────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 768;

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
    pending:  { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "⏳ Pending"  },
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}
      onClick={onClose}>
      {/* Bottom sheet on mobile, centered modal on desktop */}
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "8px 0 0", maxWidth: 480, width: "100%", maxHeight: "92vh", overflowY: "auto", animation: "slideUp .25s ease" }}
        onClick={e => e.stopPropagation()}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 99, margin: "0 auto 20px" }} />
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: NAVY, marginBottom: 3 }}>
                {step === "done" ? "Payment Submitted! 🎉" : "Enroll in Course"}
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{course.title}</p>
            </div>
            <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} />
            </button>
          </div>

          {step === "bank" && (
            <div>
              <div style={{ background: "linear-gradient(135deg,#f0fdfa,#e6fffa)", border: "1px solid #99f6e4", borderRadius: 16, padding: 20, marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Amount to Pay</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 32, color: NAVY, marginBottom: 16 }}>₦{course.price.toLocaleString()}</p>
                <div style={{ height: 1, background: "#99f6e440", marginBottom: 16 }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Bank Transfer Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[["Bank Name", BANK_DETAILS.bankName], ["Account Name", BANK_DETAILS.accountName]].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{val}</p>
                    </div>
                  ))}
                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Account Number</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: 3 }}>{BANK_DETAILS.accountNumber}</p>
                      <button onClick={copyAcct} style={{ background: copied ? "#d1fae5" : "#fff", border: `1px solid ${copied ? "#a7f3d0" : "#e2e8f0"}`, borderRadius: 10, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: copied ? "#065f46" : "#64748b", transition: "all .2s" }}>
                        {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 14, display: "flex", gap: 10, marginBottom: 20 }}>
                <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>Make the transfer, take a screenshot of your receipt, then tap Next.</p>
              </div>
              <button onClick={() => setStep("upload")} style={{ width: "100%", padding: 16, background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                I've Made the Transfer →
              </button>
            </div>
          )}

          {step === "upload" && (
            <div>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>Upload a screenshot of your payment receipt for verification.</p>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
              {!preview ? (
                <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "40px 16px", border: "2px dashed #cbd5e1", borderRadius: 16, background: "#f8fafc", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: TEAL + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Upload size={24} style={{ color: TEAL }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Tap to upload receipt</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>JPG, PNG — screenshot or photo</p>
                  </div>
                </button>
              ) : (
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <img src={preview} alt="Receipt" style={{ width: "100%", borderRadius: 14, border: "1px solid #e2e8f0", maxHeight: 280, objectFit: "contain", background: "#f8fafc" }} />
                  <button onClick={() => { setFile(null); setPreview(null); }} style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", background: "#ef4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={13} color="#fff" />
                  </button>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep("bank")} style={{ flex: 1, padding: 14, border: "1px solid #e2e8f0", borderRadius: 14, background: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: "#64748b" }}>← Back</button>
                <button onClick={handleSubmit} disabled={!file || submitting} style={{ flex: 2, padding: 14, background: file ? `linear-gradient(135deg,${TEAL},${TEAL2})` : "#e2e8f0", color: file ? "#fff" : "#94a3b8", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: file ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all .2s" }}>
                  {submitting ? "Submitting…" : "Submit for Approval"}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <CheckCircle size={34} style={{ color: "#065f46" }} />
              </div>
              <p style={{ fontSize: 15, color: "#475569", marginBottom: 8, lineHeight: 1.7 }}>Your receipt has been submitted. Our team will review it shortly.</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: TEAL, marginBottom: 28 }}>You'll be notified once your enrollment is confirmed.</p>
              <button onClick={onClose} style={{ padding: "14px 36px", background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff", border: "none", borderRadius: 99, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Got it!</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────
interface Props { defaultTab?: TabType; }

export default function StudentDashboard({ defaultTab = "overview" }: Props) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [mobile,       setMobile]       = useState(isMobile());
  const [tab,          setTab]          = useState<TabType>(defaultTab);
  const [enrolled,     setEnrolled]     = useState<EnrolledCourse[]>([]);
  const [explore,      setExplore]      = useState<Course[]>([]);
  const [payments,     setPayments]     = useState<Payment[]>([]);
  const [loadingE,     setLE]           = useState(true);
  const [loadingX,     setLX]           = useState(false);
  const [loadingP,     setLP]           = useState(false);
  const [search,       setSearch]       = useState("");
  const [payingCourse, setPayingCourse] = useState<Course | null>(null);
  const [reviewCourse, setReviewCourse] = useState<EnrolledCourse | null>(null);

  // Track screen size
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const enrolledIds     = new Set(enrolled.map(c => c.id));
  const pendingPayments = payments.filter(p => p.status === "pending");

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

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEnrolled(); fetchExplore(); fetchPayments();
  }, [isAuthenticated, fetchEnrolled, fetchExplore, fetchPayments]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const t = setTimeout(() => { fetchEnrolled(); fetchPayments(); }, 600);
    return () => clearTimeout(t);
  }, [location, isAuthenticated, fetchEnrolled, fetchPayments]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible" && isAuthenticated) { fetchEnrolled(); fetchPayments(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isAuthenticated, fetchEnrolled, fetchPayments]);

  const total       = enrolled.length;
  const completed   = enrolled.filter(c => c.completed).length;
  const inProgress  = enrolled.filter(c => !c.completed && c.progress > 0).length;
  const avgProgress = total ? Math.round(enrolled.reduce((a, c) => a + c.progress, 0) / total) : 0;

  const filteredExplore = explore.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const navItems: { key: TabType; label: string; icon: any; badge?: number }[] = [
    { key: "overview",   label: "Home",      icon: LayoutDashboard },
    { key: "my-courses", label: "My Courses", icon: BookOpen },
    { key: "explore",    label: "Explore",   icon: Compass },
    { key: "payments",   label: "Payments",  icon: DollarSign, badge: pendingPayments.length },
  ];

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: mobile ? "#f6f8fb" : "#f6f8fb", display: "flex", flexDirection: "column" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .card{background:#fff;border-radius:16px;border:1px solid #e8edf2;}
        .btnt{background:linear-gradient(135deg,${TEAL},${TEAL2});color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .2s;}
        .btnt:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(13,148,136,.28);}
        .btnt:disabled{opacity:.6;transform:none;}
        .btnt:active{transform:scale(.97);}
        .icn{width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;transition:all .15s;flex-shrink:0;}
        .icn:hover{background:#f1f5f9;}
        .arow{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #f8fafc;transition:background .15s;}
        .arow:hover{background:#fafcff;}
        .arow:last-child{border-bottom:none;}
        .ccard{background:#fff;border-radius:16px;border:1px solid #e8edf2;transition:all .25s;overflow:hidden;}
        .ccard:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08);}
        .ccard:active{transform:scale(.98);}
        /* Bottom nav */
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e8edf2;display:flex;z-index:50;padding-bottom:env(safe-area-inset-bottom);}
        .bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 4px 8px;border:none;background:none;cursor:pointer;font-family:inherit;position:relative;transition:all .15s;}
        .bnav-item:active{transform:scale(.9);}
        /* Desktop sidebar */
        .sidebar{background:#fff;border-right:1px solid #e8edf2;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;z-index:40;width:240px;flex-shrink:0;}
        .nib{width:100%;display:flex;align-items:center;padding:11px 16px;gap:10px;border:none;border-radius:12px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;transition:all .18s;}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .ptable{width:100%;border-collapse:collapse;}
        .ptable th{text-align:left;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;padding:10px 14px;border-bottom:2px solid #f1f5f9;}
        .ptable td{padding:12px 14px;border-bottom:1px solid #f8fafc;font-size:13px;color:${NAVY};}
        .ptable tr:last-child td{border-bottom:none;}
        .inp{width:100%;padding:12px 16px 12px 44px;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;font-size:14px;outline:none;font-family:inherit;color:${NAVY};transition:border-color .2s;}
        .inp:focus{border-color:${TEAL};}
      `}</style>

      {payingCourse && (
        <PaymentModal course={payingCourse} onClose={() => setPayingCourse(null)}
          onSubmitted={() => { setPayingCourse(null); fetchEnrolled(); fetchPayments(); }} />
      )}
      {reviewCourse && (
        <ReviewModal course={reviewCourse} onClose={() => setReviewCourse(null)} />
      )}

      {/* ══ DESKTOP LAYOUT ══ */}
      {!mobile ? (
        <div style={{ display: "flex", flex: 1 }}>
          {/* Desktop Sidebar */}
          <aside className="sidebar">
            <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: NAVY }}>Student Portal</span>
            </div>
            <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
              {navItems.map(({ key, label, icon: Icon, badge }) => (
                <button key={key} onClick={() => setTab(key as TabType)} className="nib"
                  style={{ background: tab === key ? `linear-gradient(135deg,${TEAL},${TEAL2})` : "transparent", color: tab === key ? "#fff" : "#64748b", justifyContent: "flex-start" }}>
                  <Icon size={16} />
                  <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                  {badge != null && badge > 0 && <span style={{ background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99 }}>{badge}</span>}
                </button>
              ))}
            </nav>
            <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <UserAvatar name={user?.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
                <button onClick={() => { logout(); navigate("/"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#94a3b8", fontFamily: "inherit", padding: 0 }}>
                  <LogOut size={11} /> Sign out
                </button>
              </div>
            </div>
          </aside>

          {/* Desktop Main */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <header style={{ background: "#fff", borderBottom: "1px solid #e8edf2", position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 24px", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: NAVY }}>
                  {tab === "overview" ? `Welcome back, ${user?.name?.split(" ")[0] ?? "Student"} 👋`
                   : tab === "my-courses" ? "My Courses"
                   : tab === "explore"    ? "Explore Courses"
                   :                        "My Payments"}
                </h1>
              </div>
              <button onClick={() => { fetchEnrolled(); fetchExplore(); fetchPayments(); }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", border: "1px solid #e2e8f0", borderRadius: 99, background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b", fontFamily: "inherit" }}>
                <RefreshCw size={11} /> Refresh
              </button>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#64748b" }}><Bell size={17} /></button>
            </header>
            <main style={{ flex: 1, padding: "24px 24px", maxWidth: 1080, width: "100%", margin: "0 auto" }}>
              <DashboardContent {...{ tab, setTab, mobile, enrolled, explore, payments, loadingE, loadingX, loadingP, search, setSearch, filteredExplore, enrolledIds, pendingPayments, total, completed, inProgress, avgProgress, user, navigate, setPayingCourse, setReviewCourse, fetchEnrolled, fetchExplore, fetchPayments }} />
            </main>
          </div>
        </div>
      ) : (
        /* ══ MOBILE LAYOUT ══ */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: 70 }}>
          {/* Mobile Header */}

          {/* Mobile Header */}
<header style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 30, padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
  
  {/* Avatar with dropdown */}
  <div style={{ position: "relative" }}>
    <button
      onClick={() => setShowProfileMenu(o => !o)}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
      <UserAvatar name={user?.name} size={36} />
    </button>

    {/* Dropdown */}
    {showProfileMenu && (
      <>
        {/* Backdrop */}
        <div
          onClick={() => setShowProfileMenu(false)}
          style={{ position: "fixed", inset: 0, zIndex: 90 }}
        />
        <div style={{
          position: "absolute", top: 44, left: 0, zIndex: 100,
          background: "#fff", borderRadius: 14, border: "1px solid #e8edf2",
          boxShadow: "0 8px 24px rgba(0,0,0,.12)", minWidth: 200, padding: 8,
        }}>
          {/* User info */}
          <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: 6 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{user?.email}</p>
          </div>

          {/* Nav items */}
          {navItems.map(({ key, label, icon: Icon, badge }) => (
            <button key={key} onClick={() => { setTab(key as TabType); setShowProfileMenu(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", border: "none", borderRadius: 10, cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "all .15s",
                background: tab === key ? TEAL + "12" : "transparent",
                color: tab === key ? TEAL : "#475569",
              }}>
              <Icon size={15} />
              <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
              {badge != null && badge > 0 && (
                <span style={{ background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99 }}>{badge}</span>
              )}
            </button>
          ))}

          {/* Sign out */}
          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 6, paddingTop: 6 }}>
            <button
              onClick={() => { logout(); navigate("/"); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", border: "none", borderRadius: 10, cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                background: "transparent", color: "#ef4444",
              }}>
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </>
    )}
  </div>

  <div style={{ flex: 1 }}>
    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
      {tab === "overview" ? `Good day 👋` : tab === "my-courses" ? "My Courses" : tab === "explore" ? "Explore" : "Payments"}
    </p>
    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, lineHeight: 1.2 }}>
      {tab === "overview" ? (user?.name?.split(" ")[0] ?? "Student") : tab === "my-courses" ? `${total} enrolled` : tab === "explore" ? `${filteredExplore.length} courses` : `${payments.length} records`}
    </p>
  </div>

  <button onClick={() => { fetchEnrolled(); fetchExplore(); fetchPayments(); }}
    style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
    <RefreshCw size={14} />
  </button>
  <button style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", position: "relative" }}>
    <Bell size={16} />
    {pendingPayments.length > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />}
  </button>
</header>
      
          {/* Mobile Main */}
          <main style={{ flex: 1, padding: "16px 16px 8px" }}>
            <DashboardContent {...{ tab, setTab, mobile, enrolled, explore, payments, loadingE, loadingX, loadingP, search, setSearch, filteredExplore, enrolledIds, pendingPayments, total, completed, inProgress, avgProgress, user, navigate, setPayingCourse, setReviewCourse, fetchEnrolled, fetchExplore, fetchPayments }} />
          </main>

          {/* Bottom Navigation */}
          <nav className="bottom-nav">
            {navItems.map(({ key, label, icon: Icon, badge }) => (
              <button key={key} className="bnav-item" onClick={() => setTab(key as TabType)}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 44, height: 28, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
                    background: tab === key ? TEAL + "18" : "transparent", transition: "all .2s",
                  }}>
                    <Icon size={20} style={{ color: tab === key ? TEAL : "#94a3b8", transition: "color .2s" }} />
                  </div>
                  {badge != null && badge > 0 && (
                    <span style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: tab === key ? 700 : 500, color: tab === key ? TEAL : "#94a3b8", marginTop: 3, transition: "color .2s" }}>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

// ── Shared content extracted to avoid duplication ─────────────────────
function DashboardContent({
  tab, setTab, mobile, enrolled, explore, payments,
  loadingE, loadingX, loadingP, search, setSearch,
  filteredExplore, enrolledIds, pendingPayments,
  total, completed, inProgress, avgProgress,
  user, navigate, setPayingCourse, setReviewCourse,
  fetchEnrolled, fetchExplore, fetchPayments,
}: any) {

  return (
    <>
      {/* ════ OVERVIEW ════ */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 16 : 20 }}>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {[
              { label: "Enrolled",    value: loadingE ? "—" : total,             icon: BookOpen,    color: TEAL,      bg: TEAL + "15"   },
              { label: "Completed",   value: loadingE ? "—" : completed,         icon: CheckCircle, color: "#10b981", bg: "#10b98115"   },
              { label: "In Progress", value: loadingE ? "—" : inProgress,        icon: TrendingUp,  color: "#3b82f6", bg: "#3b82f615"   },
              { label: "Avg Progress",value: loadingE ? "—" : `${avgProgress}%`, icon: BarChart2,   color: "#8b5cf6", bg: "#8b5cf615"   },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card" style={{ padding: mobile ? "14px 12px" : 16, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: mobile ? 36 : 40, height: mobile ? 36 : 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={mobile ? 15 : 17} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginBottom: 2 }}>{label}</p>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: mobile ? 17 : 19, color: NAVY, lineHeight: 1 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pending payment alert */}
          {pendingPayments.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 2 }}>
                  {pendingPayments.length} Payment{pendingPayments.length > 1 ? "s" : ""} Pending
                </p>
                <p style={{ fontSize: 12, color: "#64748b" }}>Being reviewed — you'll get access once approved.</p>
              </div>
              <button onClick={() => setTab("payments")} style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: "none", border: `1px solid ${TEAL}40`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                View →
              </button>
            </div>
          )}

          {/* Continue learning */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: NAVY }}>Continue Learning</h2>
              <button onClick={() => setTab("my-courses")} style={{ background: "none", border: "none", cursor: "pointer", color: TEAL2, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                All <ChevronRight size={12} />
              </button>
            </div>
            {loadingE ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : enrolled.filter((c: EnrolledCourse) => !c.completed).length === 0 ? (
              <div className="card" style={{ padding: "36px 20px", textAlign: "center" }}>
                <BookOpen size={28} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
                <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>No courses in progress.</p>
                <button onClick={() => setTab("explore")} className="btnt" style={{ padding: "10px 20px", fontSize: 13 }}>Browse Courses</button>
              </div>
            ) : mobile ? (
              /* Mobile: vertical list cards */
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {enrolled.filter((c: EnrolledCourse) => !c.completed).slice(0, 3).map((c: EnrolledCourse) => (
                  <div key={c.id} className="ccard" style={{ cursor: "pointer", padding: 14 }} onClick={() => navigate(`/learn/${c.id}`)}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <CourseThumb title={c.title} image={c.image} size={48} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: NAVY, lineHeight: 1.3, marginBottom: 2 }}>{c.title}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8" }}>by {c.instructor}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Play size={11} color="#fff" style={{ marginLeft: 1 }} />
                        </div>
                      </div>
                    </div>
                    <ProgressBar pct={c.progress} />
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{c.progress}% complete</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop: horizontal grid */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
                {enrolled.filter((c: EnrolledCourse) => !c.completed).slice(0, 3).map((c: EnrolledCourse) => (
                  <div key={c.id} className="ccard" style={{ cursor: "pointer", padding: 16 }} onClick={() => navigate(`/learn/${c.id}`)}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                      <CourseThumb title={c.title} image={c.image} size={52} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, lineHeight: 1.3, marginBottom: 3 }}>{c.title}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8" }}>by {c.instructor}</p>
                      </div>
                    </div>
                    <ProgressBar pct={c.progress} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{c.progress}% complete</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: TEAL }}><Play size={10} /> Continue</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested */}
          {explore.filter((c: Course) => !enrolledIds.has(c.id)).length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: NAVY }}>Suggested for You</h2>
                <button onClick={() => setTab("explore")} style={{ background: "none", border: "none", cursor: "pointer", color: TEAL2, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                  See all <ChevronRight size={12} />
                </button>
              </div>
              {mobile ? (
                /* Mobile: horizontal scroll */
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                  {explore.filter((c: Course) => !enrolledIds.has(c.id)).slice(0, 6).map((c: Course) => (
                    <div key={c.id} className="ccard" style={{ minWidth: 200, flexShrink: 0 }}>
                      <div style={{ height: 100, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <CourseThumb title={c.title} image={c.image} size={48} />
                        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: TEAL, color: "#fff" }}>{c.category}</span>
                      </div>
                      <div style={{ padding: 12 }}>
                        <p style={{ fontWeight: 700, fontSize: 12, color: NAVY, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 10 }}>by {c.instructor}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: c.price === 0 ? "#10b981" : NAVY }}>
                            {parseFloat(String(c.price ?? 0)) === 0 ? "Free" : `₦${parseFloat(String(c.price ?? 0)).toLocaleString()}`}
                          </span>
                          <button onClick={() => setPayingCourse(c)} className="btnt" style={{ padding: "6px 12px", fontSize: 10 }}>Enroll</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
                  {explore.filter((c: Course) => !enrolledIds.has(c.id)).slice(0, 3).map((c: Course) => (
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
                            {parseFloat(String(c.price ?? 0)) === 0 ? "Free" : `₦${parseFloat(String(c.price ?? 0)).toLocaleString()}`}
                          </span>
                          <button onClick={() => setPayingCourse(c)} className="btnt" style={{ padding: "7px 16px", fontSize: 11 }}>Enroll</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════ MY COURSES ════ */}
      {tab === "my-courses" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>My Courses</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{total} course{total !== 1 ? "s" : ""} enrolled</p>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            {loadingE ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) :
              enrolled.length === 0 ? (
                <div style={{ padding: "64px 24px", textAlign: "center" }}>
                  <BookOpen size={40} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                  <p style={{ color: "#94a3b8", marginBottom: 16 }}>You haven't enrolled in any courses yet.</p>
                  <button onClick={() => setTab("explore")} className="btnt" style={{ padding: "10px 24px", fontSize: 13 }}>Browse Courses</button>
                </div>
              ) : enrolled.map((c: EnrolledCourse) => (
                <div key={c.id} className="arow" style={{ flexWrap: "wrap", gap: mobile ? 10 : 12 }}>
                  <CourseThumb title={c.title} image={c.image} size={mobile ? 48 : 46} />
                  <div style={{ flex: 1, minWidth: mobile ? "calc(100% - 70px)" : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: mobile ? 14 : 13, color: NAVY }}>{c.title}</p>
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
                  <div style={{ display: "flex", gap: 8, width: mobile ? "100%" : "auto" }}>
                    <button onClick={() => navigate(`/learn/${c.id}`)} className="btnt"
                      style={{ padding: mobile ? "10px 0" : "7px 12px", fontSize: 12, borderRadius: 10, flex: mobile ? 1 : "none", justifyContent: "center" }}>
                      <Play size={11} /> {c.progress > 0 ? "Continue" : "Start"}
                    </button>
                    <button onClick={() => setReviewCourse(c)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: mobile ? "10px 0" : "7px 12px", borderRadius: 10, border: `1px solid ${c.completed ? TEAL + "40" : "#e2e8f0"}`, background: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: c.completed ? TEAL : "#94a3b8", flex: mobile ? 1 : "none", transition: "all .15s" }}>
                      <MessageSquare size={11} /> {c.completed ? "Review" : "Reviews"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ════ EXPLORE ════ */}
      {tab === "explore" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>Explore Courses</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{filteredExplore.length} courses available</p>
          </div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or category…" className="inp" />
          </div>
          {loadingX ? (
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: mobile ? 10 : 16 }}>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredExplore.length === 0 ? (
            <div className="card" style={{ padding: "64px 24px", textAlign: "center" }}>
              <Search size={28} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
              <p style={{ color: "#94a3b8" }}>No courses match your search.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: mobile ? 10 : 16 }}>
              {filteredExplore.map((c: Course) => {
                const isEnrolled = enrolledIds.has(c.id);
                const hasPending = payments.some((p: Payment) => p.course_id === c.id && p.status === "pending");
                return (
                  <div key={c.id} className="ccard">
                    <div style={{ height: mobile ? 100 : 140, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                      <CourseThumb title={c.title} image={c.image} size={mobile ? 48 : 64} />
                      <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: TEAL, color: "#fff", textTransform: "uppercase" }}>{c.category}</span>
                      {isEnrolled && <span style={{ position: "absolute", top: 8, right: 8, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#10b981", color: "#fff" }}>✓</span>}
                      {!isEnrolled && hasPending && <span style={{ position: "absolute", top: 8, right: 8, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#f59e0b", color: "#fff" }}>⏳</span>}
                    </div>
                    <div style={{ padding: mobile ? 10 : 16 }}>
                      <h3 style={{ fontWeight: 700, fontSize: mobile ? 12 : 13, color: NAVY, marginBottom: 3, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>{c.title}</h3>
                      {!mobile && <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>by {c.instructor}</p>}
                      {!mobile && (
                        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{c.duration ?? "—"}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><BookOpen size={10} />{c.lessons}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={10} />{c.enrolled}</span>
                        </div>
                      )}
                      {!mobile && (
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 10 }}>
                          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} style={{ fill: i <= Math.floor(c.rating) ? "#f59e0b" : "#e2e8f0", color: i <= Math.floor(c.rating) ? "#f59e0b" : "#e2e8f0" }} />)}
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginLeft: 3 }}>{c.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: mobile ? 8 : 12, borderTop: mobile ? "none" : "1px solid #f1f5f9", marginTop: mobile ? 4 : 0 }}>
                        <p style={{ fontWeight: 800, fontSize: mobile ? 13 : 16, color: c.price === 0 ? "#10b981" : NAVY }}>
                          {c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}
                        </p>
                        {isEnrolled ? (
                          <button onClick={() => navigate(`/learn/${c.id}`)} className="btnt" style={{ padding: mobile ? "6px 10px" : "8px 14px", fontSize: 10 }}>
                            <Play size={9} /> Go
                          </button>
                        ) : hasPending ? (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 99, padding: "4px 8px" }}>⏳</span>
                        ) : (
                          <button onClick={() => setPayingCourse(c)} className="btnt" style={{ padding: mobile ? "6px 10px" : "8px 16px", fontSize: 10 }}>
                            <CreditCard size={9} /> Enroll
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
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>My Payments</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{payments.length} record{payments.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total Paid", value: `₦${payments.filter((p: Payment) => p.status === "approved").reduce((a: number, p: Payment) => a + parseFloat(String(p.amount ?? 0)), 0).toLocaleString()}`, color: "#10b981", bg: "#10b98115" },
              { label: "Pending",    value: pendingPayments.length,                                                    color: "#f59e0b", bg: "#f59e0b15" },
              { label: "Rejected",   value: payments.filter((p: Payment) => p.status === "rejected").length,          color: "#ef4444", bg: "#ef444415" },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: mobile ? "12px 10px" : 16, textAlign: "center" }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: mobile ? 18 : 20, color: s.color }}>{loadingP ? "—" : s.value}</p>
                <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mobile: card list. Desktop: table */}
          <div className="card" style={{ overflow: "hidden" }}>
            {loadingP ? [1, 2, 3].map(i => <SkeletonRow key={i} />) :
              payments.length === 0 ? (
                <div style={{ padding: "64px 24px", textAlign: "center" }}>
                  <FileText size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                  <p style={{ color: "#94a3b8", marginBottom: 16 }}>No payment history yet.</p>
                  <button onClick={() => setTab("explore")} className="btnt" style={{ padding: "10px 24px", fontSize: 13 }}>Browse Courses</button>
                </div>
              ) : mobile ? (
                /* Mobile payment cards */
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {payments.map((p: Payment) => (
                    <div key={p.id} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f8fafc", alignItems: "flex-start" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: TEAL + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <BookOpen size={16} style={{ color: TEAL }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 3 }}>{(p as any).course_title ?? `Course #${p.course_id}`}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <StatusBadge status={p.status} />
                          <span style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>₦{parseFloat(String(p.amount ?? 0)).toLocaleString()}</span>
                        </div>
                        {p.status === "rejected" && (p as any).rejection_reason && (
                          <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{(p as any).rejection_reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop table */
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{["Course", "Amount", "Status", "Date", "Note"].map(h => (
                        <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 14px", borderBottom: "2px solid #f1f5f9" }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {payments.map((p: Payment) => (
                        <tr key={p.id}>
                          <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontSize: 13, color: NAVY }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: TEAL + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <BookOpen size={14} style={{ color: TEAL }} />
                              </div>
                              <div>
                                <p style={{ fontWeight: 600 }}>{(p as any).course_title ?? `Course #${p.course_id}`}</p>
                                <p style={{ fontSize: 11, color: "#94a3b8" }}>ID #{p.id}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontWeight: 700, fontSize: 13, color: NAVY }}>₦{parseFloat(String(p.amount ?? 0)).toLocaleString()}</td>
                          <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontSize: 13, color: NAVY }}><StatusBadge status={p.status} /></td>
                          <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontSize: 13, color: "#64748b" }}>{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontSize: 12, color: "#94a3b8" }}>
                            {p.status === "rejected" && (p as any).rejection_reason
                              ? <span style={{ color: "#ef4444" }}>{(p as any).rejection_reason}</span>
                              : p.status === "approved" ? <span style={{ color: "#10b981" }}>Enrolled ✓</span>
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
    </>
  );
}
