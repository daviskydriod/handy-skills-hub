// File: src/pages/dashboard/StudentDashboard.tsx
// ── Uses shared: DashboardLayout, StatCard, CourseThumb, SkeletonCard,
//                SkeletonRow, StatusBadge, ProgressBar, PaymentModal
// ── Theme: NAVY/GOLD (Admin theme, unified across all dashboards)

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen, Search, CheckCircle, TrendingUp, BarChart2,
  Play, Clock, Users, Star, CreditCard,
  AlertCircle, LayoutDashboard, Compass,
  DollarSign, FileText, ChevronRight, MessageSquare,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";
import { getMyPayments, type Payment } from "@/api/payments";
import ReviewModal from "@/components/ReviewModal";

import { DashboardLayout, useMobile } from "../../components/layout/DashboardLayout";
import { PaymentModal } from "../../components/modals/PaymentModal";
import {
  StatCard, CourseThumb, SkeletonCard, SkeletonRow,
  StatusBadge, ProgressBar,
} from "../../components/shared/UIAtoms";
import { NAVY, GOLD, GOLD2 } from "../../theme";

type TabType = "overview" | "my-courses" | "explore" | "payments";

interface Props { defaultTab?: TabType; }

export default function StudentDashboard({ defaultTab = "overview" }: Props) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mobile   = useMobile();

  const [tab,             setTab]             = useState<TabType>(defaultTab);
  const [enrolled,        setEnrolled]        = useState<EnrolledCourse[]>([]);
  const [explore,         setExplore]         = useState<Course[]>([]);
  const [payments,        setPayments]        = useState<Payment[]>([]);
  const [loadingE,        setLE]              = useState(true);
  const [loadingX,        setLX]              = useState(false);
  const [loadingP,        setLP]              = useState(false);
  const [search,          setSearch]          = useState("");
  const [payingCourse,    setPayingCourse]    = useState<Course | null>(null);
  const [reviewCourse,    setReviewCourse]    = useState<EnrolledCourse | null>(null);

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

  const refreshAll = useCallback(() => { fetchEnrolled(); fetchExplore(); fetchPayments(); }, [fetchEnrolled, fetchExplore, fetchPayments]);

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
    const fn = () => { if (document.visibilityState === "visible" && isAuthenticated) { fetchEnrolled(); fetchPayments(); } };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [isAuthenticated, fetchEnrolled, fetchPayments]);

  const total       = enrolled.length;
  const completed   = enrolled.filter(c => c.completed).length;
  const inProgress  = enrolled.filter(c => !c.completed && c.progress > 0).length;
  const avgProgress = total ? Math.round(enrolled.reduce((a, c) => a + c.progress, 0) / total) : 0;

  const filteredExplore = explore.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { key: "overview",   label: "Home",        icon: LayoutDashboard },
    { key: "my-courses", label: "My Courses",  icon: BookOpen },
    { key: "explore",    label: "Explore",     icon: Compass },
    { key: "payments",   label: "Payments",    icon: DollarSign, badge: pendingPayments.length },
  ];

  // Mobile header text
  const mobileSubtitles: Record<TabType, string> = {
    "overview":   "Good day 👋",
    "my-courses": "My Courses",
    "explore":    "Explore",
    "payments":   "Payments",
  };
  const mobileTitles: Record<TabType, string> = {
    "overview":   user?.name?.split(" ")[0] ?? "Student",
    "my-courses": `${total} enrolled`,
    "explore":    `${filteredExplore.length} courses`,
    "payments":   `${payments.length} records`,
  };

  const desktopTitles: Record<TabType, string> = {
    "overview":   `Welcome back, ${user?.name?.split(" ")[0] ?? "Student"} 👋`,
    "my-courses": "My Courses",
    "explore":    "Explore Courses",
    "payments":   "My Payments",
  };

  return (
    <>
      {payingCourse && (
        <PaymentModal
          course={payingCourse}
          onClose={() => setPayingCourse(null)}
          onSubmitted={() => { setPayingCourse(null); fetchEnrolled(); fetchPayments(); }}
        />
      )}
      {reviewCourse && (
        <ReviewModal course={reviewCourse} onClose={() => setReviewCourse(null)} />
      )}

      <DashboardLayout
        navItems={navItems}
        activeTab={tab}
        onTabChange={key => setTab(key as TabType)}
        pageTitle={desktopTitles[tab]}
        mobileSubtitle={mobileSubtitles[tab]}
        mobileTitleText={mobileTitles[tab]}
        user={user}
        onLogout={() => { logout(); navigate("/"); }}
        onRefresh={refreshAll}
        hasMobileBadge={pendingPayments.length > 0}
      >
        {/* ════ OVERVIEW ════ */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 16 : 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              <StatCard label="Enrolled"     value={loadingE ? "—" : total}             icon={BookOpen}    color={GOLD2}     bg={GOLD + "15"}    mobile={mobile} />
              <StatCard label="Completed"    value={loadingE ? "—" : completed}         icon={CheckCircle} color="#10b981"   bg="#10b98115"      mobile={mobile} />
              <StatCard label="In Progress"  value={loadingE ? "—" : inProgress}        icon={TrendingUp}  color="#3b82f6"   bg="#3b82f615"      mobile={mobile} />
              <StatCard label="Avg Progress" value={loadingE ? "—" : `${avgProgress}%`} icon={BarChart2}   color="#8b5cf6"   bg="#8b5cf615"      mobile={mobile} />
            </div>

            {pendingPayments.length > 0 && (
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14,
                padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 2 }}>
                    {pendingPayments.length} Payment{pendingPayments.length > 1 ? "s" : ""} Pending
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Being reviewed — you'll get access once approved.</p>
                </div>
                <button onClick={() => setTab("payments")} style={{
                  fontSize: 11, fontWeight: 700, color: GOLD2, background: "none",
                  border: `1px solid ${GOLD}50`, borderRadius: 8, padding: "5px 10px",
                  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}>
                  View →
                </button>
              </div>
            )}

            {/* Continue Learning */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: NAVY }}>Continue Learning</h2>
                <button onClick={() => setTab("my-courses")} style={{ background: "none", border: "none", cursor: "pointer", color: GOLD2, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                  All <ChevronRight size={12} />
                </button>
              </div>
              {loadingE ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1, 2].map(i => <SkeletonCard key={i} />)}</div>
              ) : enrolled.filter(c => !c.completed).length === 0 ? (
                <div className="dash-card" style={{ padding: "36px 20px", textAlign: "center" }}>
                  <BookOpen size={28} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
                  <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>No courses in progress.</p>
                  <button onClick={() => setTab("explore")} className="btn-gold" style={{ padding: "10px 20px", fontSize: 13 }}>Browse Courses</button>
                </div>
              ) : mobile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {enrolled.filter(c => !c.completed).slice(0, 3).map(c => (
                    <div key={c.id} className="dash-card" style={{ cursor: "pointer", padding: 14 }} onClick={() => navigate(`/learn/${c.id}`)}>
                      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <CourseThumb title={c.title} image={c.image} size={48} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: NAVY, lineHeight: 1.3, marginBottom: 2 }}>{c.title}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>by {c.instructor}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Play size={11} color={NAVY} style={{ marginLeft: 1 }} />
                          </div>
                        </div>
                      </div>
                      <ProgressBar pct={c.progress} />
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{c.progress}% complete</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
                  {enrolled.filter(c => !c.completed).slice(0, 3).map(c => (
                    <div key={c.id} className="dash-card" style={{ cursor: "pointer", padding: 16 }} onClick={() => navigate(`/learn/${c.id}`)}>
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
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: GOLD2 }}><Play size={10} /> Continue</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested */}
            {explore.filter(c => !enrolledIds.has(c.id)).length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: NAVY }}>Suggested for You</h2>
                  <button onClick={() => setTab("explore")} style={{ background: "none", border: "none", cursor: "pointer", color: GOLD2, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                    See all <ChevronRight size={12} />
                  </button>
                </div>
                {mobile ? (
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                    {explore.filter(c => !enrolledIds.has(c.id)).slice(0, 6).map(c => (
                      <div key={c.id} className="dash-card" style={{ minWidth: 200, flexShrink: 0 }}>
                        <div style={{ height: 100, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          <CourseThumb title={c.title} image={c.image} size={48} />
                          <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: GOLD, color: NAVY }}>{c.category}</span>
                        </div>
                        <div style={{ padding: 12 }}>
                          <p style={{ fontWeight: 700, fontSize: 12, color: NAVY, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 10 }}>by {c.instructor}</p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: c.price === 0 ? "#10b981" : NAVY }}>
                              {parseFloat(String(c.price ?? 0)) === 0 ? "Free" : `₦${parseFloat(String(c.price ?? 0)).toLocaleString()}`}
                            </span>
                            <button onClick={() => setPayingCourse(c)} className="btn-gold" style={{ padding: "6px 12px", fontSize: 10 }}>Enroll</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
                    {explore.filter(c => !enrolledIds.has(c.id)).slice(0, 3).map(c => (
                      <div key={c.id} className="dash-card">
                        <div style={{ height: 110, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          <CourseThumb title={c.title} image={c.image} size={56} />
                          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: GOLD, color: NAVY }}>{c.category}</span>
                        </div>
                        <div style={{ padding: 14 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>by {c.instructor}</p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: c.price === 0 ? "#10b981" : NAVY }}>
                              {parseFloat(String(c.price ?? 0)) === 0 ? "Free" : `₦${parseFloat(String(c.price ?? 0)).toLocaleString()}`}
                            </span>
                            <button onClick={() => setPayingCourse(c)} className="btn-gold" style={{ padding: "7px 16px", fontSize: 11 }}>Enroll</button>
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
            <div className="dash-card" style={{ overflow: "hidden" }}>
              {loadingE ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) :
                enrolled.length === 0 ? (
                  <div style={{ padding: "64px 24px", textAlign: "center" }}>
                    <BookOpen size={40} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                    <p style={{ color: "#94a3b8", marginBottom: 16 }}>You haven't enrolled in any courses yet.</p>
                    <button onClick={() => setTab("explore")} className="btn-gold" style={{ padding: "10px 24px", fontSize: 13 }}>Browse Courses</button>
                  </div>
                ) : enrolled.map(c => (
                  <div key={c.id} className="dash-row" style={{ flexWrap: "wrap", gap: mobile ? 10 : 12 }}>
                    <CourseThumb title={c.title} image={c.image} size={mobile ? 48 : 46} />
                    <div style={{ flex: 1, minWidth: mobile ? "calc(100% - 70px)" : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <p style={{ fontWeight: 700, fontSize: mobile ? 14 : 13, color: NAVY }}>{c.title}</p>
                        <span style={{
                          background: c.completed ? "#d1fae5" : "#fef3c7",
                          color: c.completed ? "#065f46" : "#92400e",
                          border: `1px solid ${c.completed ? "#a7f3d0" : "#fde68a"}`,
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                        }}>
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
                      <button
                        onClick={() => navigate(`/learn/${c.id}`)}
                        className="btn-gold"
                        style={{ padding: mobile ? "10px 0" : "7px 12px", fontSize: 12, borderRadius: 10, flex: mobile ? 1 : "none", justifyContent: "center" }}
                      >
                        <Play size={11} /> {c.progress > 0 ? "Continue" : "Start"}
                      </button>
                      <button
                        onClick={() => setReviewCourse(c)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          padding: mobile ? "10px 0" : "7px 12px", borderRadius: 10,
                          border: `1px solid ${c.completed ? GOLD + "50" : "#e2e8f0"}`,
                          background: "none", cursor: "pointer", fontFamily: "inherit",
                          fontWeight: 700, fontSize: 12, color: c.completed ? GOLD2 : "#94a3b8",
                          flex: mobile ? 1 : "none", transition: "all .15s",
                        }}
                      >
                        <MessageSquare size={11} /> {c.completed ? "Review" : "Reviews"}
                      </button>
                    </div>
                  </div>
                ))
              }
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
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or category…"
                className="dash-inp"
                style={{ paddingLeft: 44 }}
              />
            </div>
            {loadingX ? (
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: mobile ? 10 : 16 }}>
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredExplore.length === 0 ? (
              <div className="dash-card" style={{ padding: "64px 24px", textAlign: "center" }}>
                <Search size={28} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
                <p style={{ color: "#94a3b8" }}>No courses match your search.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: mobile ? 10 : 16 }}>
                {filteredExplore.map(c => {
                  const isEnrolled = enrolledIds.has(c.id);
                  const hasPending = payments.some(p => p.course_id === c.id && p.status === "pending");
                  return (
                    <div key={c.id} className="dash-card" style={{ overflow: "hidden" }}>
                      <div style={{ height: mobile ? 100 : 140, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                        <CourseThumb title={c.title} image={c.image} size={mobile ? 48 : 64} />
                        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: GOLD, color: NAVY, textTransform: "uppercase" }}>{c.category}</span>
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
                            <button onClick={() => navigate(`/learn/${c.id}`)} className="btn-gold" style={{ padding: mobile ? "6px 10px" : "8px 14px", fontSize: 10 }}>
                              <Play size={9} /> Go
                            </button>
                          ) : hasPending ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 99, padding: "4px 8px" }}>⏳</span>
                          ) : (
                            <button onClick={() => setPayingCourse(c)} className="btn-gold" style={{ padding: mobile ? "6px 10px" : "8px 16px", fontSize: 10 }}>
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
                { label: "Total Paid", value: `₦${payments.filter(p => p.status === "approved").reduce((a, p) => a + parseFloat(String(p.amount ?? 0)), 0).toLocaleString()}`, color: "#10b981" },
                { label: "Pending",   value: pendingPayments.length, color: "#f59e0b" },
                { label: "Rejected",  value: payments.filter(p => p.status === "rejected").length, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} className="dash-card" style={{ padding: mobile ? "12px 10px" : 16, textAlign: "center" }}>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: mobile ? 18 : 20, color: s.color }}>{loadingP ? "—" : s.value}</p>
                  <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="dash-card" style={{ overflow: "hidden" }}>
              {loadingP ? [1, 2, 3].map(i => <SkeletonRow key={i} />) :
                payments.length === 0 ? (
                  <div style={{ padding: "64px 24px", textAlign: "center" }}>
                    <FileText size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                    <p style={{ color: "#94a3b8", marginBottom: 16 }}>No payment history yet.</p>
                    <button onClick={() => setTab("explore")} className="btn-gold" style={{ padding: "10px 24px", fontSize: 13 }}>Browse Courses</button>
                  </div>
                ) : mobile ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {payments.map(p => (
                      <div key={p.id} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f8fafc", alignItems: "flex-start" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: GOLD + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BookOpen size={16} style={{ color: GOLD2 }} />
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
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{["Course", "Amount", "Status", "Date", "Note"].map(h => (
                          <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 14px", borderBottom: "2px solid #f1f5f9" }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p.id}>
                            <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontSize: 13, color: NAVY }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: GOLD + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <BookOpen size={14} style={{ color: GOLD2 }} />
                                </div>
                                <div>
                                  <p style={{ fontWeight: 600 }}>{(p as any).course_title ?? `Course #${p.course_id}`}</p>
                                  <p style={{ fontSize: 11, color: "#94a3b8" }}>ID #{p.id}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontWeight: 700, fontSize: 13, color: NAVY }}>₦{parseFloat(String(p.amount ?? 0)).toLocaleString()}</td>
                            <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc" }}><StatusBadge status={p.status} /></td>
                            <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontSize: 13, color: "#64748b" }}>{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                            <td style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", fontSize: 12, color: "#94a3b8" }}>
                              {p.status === "rejected" && (p as any).rejection_reason
                                ? <span style={{ color: "#ef4444" }}>{(p as any).rejection_reason}</span>
                                : p.status === "approved"
                                ? <span style={{ color: "#10b981" }}>Enrolled ✓</span>
                                : <span>Awaiting review</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
