// File: src/pages/dashboard/StudentDashboard.tsx

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Search, Award, User, Settings,
  CheckCircle, TrendingUp, Star, ArrowRight, RefreshCw, Play,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, enrollInCourse, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";

/* ─── design tokens ─────────────────────────────────────── */
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

/* ─── sidebar items ─────────────────────────────────────── */
const sidebarItems = [
  { label: "Dashboard",       to: "/dashboard/student",      icon: <LayoutDashboard size={18} /> },
  { label: "My Courses",      to: "/dashboard/my-courses",   icon: <BookOpen size={18} /> },
  { label: "Explore Courses", to: "/dashboard/explore",      icon: <Search size={18} /> },
  { label: "Certificates",    to: "/dashboard/certificates", icon: <Award size={18} /> },
  { label: "Profile",         to: "/dashboard/profile",      icon: <User size={18} /> },
  { label: "Settings",        to: "/dashboard/settings",     icon: <Settings size={18} /> },
];

/* ─── helpers ───────────────────────────────────────────── */
const Skeleton = ({ h = "h-8" }: { h?: string }) => (
  <div className={`${h} w-full rounded-xl animate-pulse`}
    style={{ background: "rgba(255,255,255,0.06)" }} />
);

const ProgressRing = ({ pct, size = 44 }: { pct: number; size?: number }) => {
  const r    = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={GOLD} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();

  const [tab,             setTab]         = useState<"overview" | "my-courses" | "explore">("overview");
  const [enrolled,        setEnrolled]    = useState<EnrolledCourse[]>([]);
  const [explore,         setExplore]     = useState<Course[]>([]);
  const [loadingEnrolled, setLE]          = useState(true);
  const [loadingExplore,  setLX]          = useState(false);
  const [enrollingId,     setEnrollingId] = useState<number | null>(null);
  const [exploreSearch,   setSearch]      = useState("");

  const enrolledIds = new Set(enrolled.map((c) => c.id));

  const fetchEnrolled = useCallback(async () => {
    setLE(true);
    try   { setEnrolled(await getMyEnrollments()); }
    catch { toast({ title: "Failed to load your courses", variant: "destructive" }); }
    finally { setLE(false); }
  }, []);

  const fetchExplore = useCallback(async () => {
    setLX(true);
    try   { const res = await getCourses({ limit: 12 }); setExplore(res.courses); }
    catch { toast({ title: "Failed to load courses", variant: "destructive" }); }
    finally { setLX(false); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEnrolled();
    fetchExplore();
  }, [isAuthenticated, fetchEnrolled, fetchExplore]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        fetchEnrolled();
        fetchExplore();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isAuthenticated, fetchEnrolled, fetchExplore]);

  const handleEnroll = async (courseId: number, title: string) => {
    setEnrollingId(courseId);
    try {
      await enrollInCourse(courseId);
      toast({ title: `Enrolled in "${title}" ✅` });
      fetchEnrolled();
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Enrollment failed", variant: "destructive" });
    } finally { setEnrollingId(null); }
  };

  const completed   = enrolled.filter((c) => c.completed).length;
  const inProgress  = enrolled.filter((c) => !c.completed && c.progress > 0).length;
  const avgProgress = enrolled.length
    ? Math.round(enrolled.reduce((a, c) => a + c.progress, 0) / enrolled.length) : 0;

  const filteredExplore = explore.filter((c) =>
    c.title.toLowerCase().includes(exploreSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(exploreSearch.toLowerCase())
  );

  const card    = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
  const divider = { borderTop: "1px solid rgba(255,255,255,0.07)" };

  /* ══════════════════════════════════════════════════════ */
  return (
    <DashboardLayout
      items={sidebarItems}
      title="Student Portal"
      userName={user?.name ?? "Student"}
    >

      {/* ── STAT CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Enrolled",     value: enrolled.length,  icon: BookOpen,    accent: GOLD       },
          { label: "Completed",    value: completed,         icon: CheckCircle, accent: "#10b981"  },
          { label: "In Progress",  value: inProgress,        icon: TrendingUp,  accent: "#3b82f6"  },
          { label: "Avg Progress", value: `${avgProgress}%`, icon: Award,       accent: "#a78bfa"  },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3" style={card}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: accent + "22" }}>
              <Icon size={16} style={{ color: accent }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
              <p className="font-bold text-xl text-white leading-tight">
                {loadingEnrolled ? "—" : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {(["overview", "my-courses", "explore"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all"
            style={tab === t
              ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }
              : { color: "rgba(255,255,255,0.5)" }}>
            {t === "my-courses" ? "My Courses" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ════════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="space-y-6">

          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-base">Continue Learning</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => { fetchEnrolled(); fetchExplore(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <RefreshCw size={11} /> Refresh
              </button>
              <button onClick={() => setTab("my-courses")}
                className="text-xs font-semibold flex items-center gap-1" style={{ color: GOLD }}>
                View all <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {loadingEnrolled ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} h="h-52" />)}
            </div>
          ) : enrolled.filter(c => !c.completed).length === 0 ? (
            <div className="rounded-2xl py-12 text-center" style={card}>
              <BookOpen size={28} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No courses in progress.</p>
              <button onClick={() => setTab("explore")} className="mt-3 text-xs font-bold" style={{ color: GOLD }}>
                Browse courses →
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolled.filter(c => !c.completed).slice(0, 3).map((c) => (
                <div key={c.id} className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={card}>
                  <div className="relative h-36">
                    <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/courses/${c.id}`}
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: GOLD }}>
                        <Play size={16} style={{ color: "#060d1c" }} className="ml-0.5" />
                      </Link>
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,0,0,0.7)", color: GOLD }}>
                      {c.progress}%
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-white line-clamp-1 mb-0.5">{c.title}</p>
                    <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>by {c.instructor}</p>
                    <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${c.progress}%`, background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{c.progress}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {enrolled.filter(c => c.completed).length > 0 && (
            <div>
              <h2 className="font-bold text-white text-base mb-3">Completed Courses 🎉</h2>
              <div className="rounded-2xl overflow-hidden" style={card}>
                {enrolled.filter(c => c.completed).map((c, i, arr) => (
                  <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3"
                    style={i < arr.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.06)" } : {}}>
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle size={15} style={{ color: "#10b981" }} className="shrink-0" />
                      <p className="text-sm font-medium text-white truncate">{c.title}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {explore.filter(c => !enrolledIds.has(c.id)).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white text-base">Suggested for You</h2>
                <button onClick={() => setTab("explore")} className="text-xs font-bold flex items-center gap-1" style={{ color: GOLD }}>
                  See all <ArrowRight size={11} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {explore.filter(c => !enrolledIds.has(c.id)).slice(0, 3).map((c) => (
                  <div key={c.id} className="rounded-2xl overflow-hidden" style={card}>
                    <div className="h-32 relative">
                      <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                        {c.category}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-white line-clamp-1 mb-1">{c.title}</p>
                      <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>by {c.instructor}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm" style={{ color: c.price === 0 ? "#10b981" : "white" }}>
                          {c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}
                        </span>
                        <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId === c.id}
                          className="text-[11px] font-extrabold px-3 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-60"
                          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                          {enrollingId === c.id ? "…" : "Enroll"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ MY COURSES ══════════════════════════════════════ */}
      {tab === "my-courses" && (
        <div>
          {loadingEnrolled ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} h="h-24" />)}</div>
          ) : enrolled.length === 0 ? (
            <div className="rounded-2xl py-20 text-center" style={card}>
              <BookOpen size={36} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                You haven't enrolled in any courses yet.
              </p>
              <button onClick={() => setTab("explore")}
                className="px-5 py-2 rounded-full text-sm font-extrabold transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                Explore Courses
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolled.map((c) => (
                <div key={c.id} className="rounded-2xl p-4 flex items-center gap-4" style={card}>
                  <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-white line-clamp-1">{c.title}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={c.completed
                          ? { background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }
                          : { background: `rgba(234,179,8,0.12)`, color: GOLD, border: `1px solid ${GOLD}33` }}>
                        {c.completed ? "Done" : "Active"}
                      </span>
                    </div>
                    <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                      by {c.instructor} · {c.category}
                    </p>
                    <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${c.progress}%`, background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{c.progress}% complete</p>
                  </div>
                  <div className="relative shrink-0 hidden sm:flex items-center justify-center">
                    <ProgressRing pct={c.progress} />
                    <span className="absolute text-[10px] font-bold text-white">{c.progress}%</span>
                  </div>
                  <Link to={`/courses/${c.id}`}
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <Play size={14} style={{ color: "#060d1c" }} className="ml-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ EXPLORE ═════════════════════════════════════════ */}
      {tab === "explore" && (
        <div>
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(255,255,255,0.3)" }} />
            <input value={exploreSearch} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title or category…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
              onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
          </div>

          {loadingExplore ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} h="h-60" />)}
            </div>
          ) : filteredExplore.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No courses found</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExplore.map((c) => {
                const isEnrolled = enrolledIds.has(c.id);
                return (
                  <div key={c.id} className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1" style={card}>
                    <div className="relative h-36 shrink-0">
                      <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                        {c.category}
                      </span>
                      {isEnrolled && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>
                          Enrolled
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="font-semibold text-sm text-white line-clamp-2 mb-1 flex-1">{c.title}</p>
                      <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>by {c.instructor}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <Star size={11} style={{ fill: GOLD, color: GOLD }} />
                        <span className="text-[11px] text-white">{c.rating.toFixed(1)}</span>
                        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          · {c.enrolled} students
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3" style={divider}>
                        <span className="font-bold text-sm" style={{ color: c.price === 0 ? "#10b981" : "white" }}>
                          {c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}
                        </span>
                        {isEnrolled ? (
                          <Link to={`/courses/${c.id}`}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all hover:scale-105"
                            style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                            <Play size={10} /> Continue
                          </Link>
                        ) : (
                          <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId === c.id}
                            className="text-[11px] font-extrabold px-3 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                            {enrollingId === c.id ? "Enrolling…" : "Enroll Now"}
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

    </DashboardLayout>
  );
}
