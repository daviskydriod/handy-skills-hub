// File: src/pages/dashboard/StudentDashboard.tsx
//
// Route setup required in your router:
//   <Route path="/dashboard/student"      element={<StudentDashboard />} />
//   <Route path="/dashboard/my-courses"   element={<StudentDashboard defaultTab="my-courses" />} />
//   <Route path="/dashboard/explore"      element={<StudentDashboard defaultTab="explore" />} />
//   <Route path="/dashboard/certificates" element={<Certificates />} />
//   <Route path="/dashboard/profile"      element={<Profile />} />
//   <Route path="/dashboard/settings"     element={<Settings />} />

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Search, Award, User, Settings,
  CheckCircle, TrendingUp, Star, ArrowRight, RefreshCw, Play,
  Clock, Users,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, enrollInCourse, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";

/* ─── tokens ─────────────────────────────────────────────── */
const NAVY  = "#0b1f3a";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

/* ─── sidebar items — real routes for Certificates/Profile/Settings ─── */
const sidebarItems = [
  { label: "Dashboard",       to: "/dashboard/student",      icon: <LayoutDashboard size={18} /> },
  { label: "My Courses",      to: "/dashboard/my-courses",   icon: <BookOpen size={18} /> },
  { label: "Explore Courses", to: "/dashboard/explore",      icon: <Search size={18} /> },
  { label: "Certificates",    to: "/dashboard/certificates", icon: <Award size={18} /> },
  { label: "Profile",         to: "/dashboard/profile",      icon: <User size={18} /> },
  { label: "Settings",        to: "/dashboard/settings",     icon: <Settings size={18} /> },
];

/* ─── small components ───────────────────────────────────── */
const Skeleton = ({ h = "h-10", rounded = "rounded-xl" }: { h?: string; rounded?: string }) => (
  <div className={`${h} w-full ${rounded} bg-slate-200 animate-pulse`} />
);

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500"
      style={{ width: `${pct}%`, background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
  </div>
);

const ProgressRing = ({ pct, size = 48 }: { pct: number; size?: number }) => {
  const r    = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={GOLD} strokeWidth={6}
        strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" />
    </svg>
  );
};

const Badge = ({ children, color }: { children: React.ReactNode; color: "gold" | "green" | "blue" }) => {
  const styles = {
    gold:  { background: `${GOLD}18`,  color: GOLD2,     border: `1px solid ${GOLD}40`  },
    green: { background: "#10b98118",  color: "#059669",  border: "1px solid #10b98140"  },
    blue:  { background: "#3b82f618",  color: "#2563eb",  border: "1px solid #3b82f640"  },
  }[color];
  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0" style={styles}>
      {children}
    </span>
  );
};

/* ════════════════════════════════════════════════════════ */
interface Props { defaultTab?: "overview" | "my-courses" | "explore"; }

export default function StudentDashboard({ defaultTab = "overview" }: Props) {
  const { user, isAuthenticated } = useAuth();

  const [tab,          setTab]         = useState(defaultTab);
  const [enrolled,     setEnrolled]    = useState<EnrolledCourse[]>([]);
  const [explore,      setExplore]     = useState<Course[]>([]);
  const [loadingE,     setLE]          = useState(true);
  const [loadingX,     setLX]          = useState(false);
  const [enrollingId,  setEnrollingId] = useState<number | null>(null);
  const [search,       setSearch]      = useState("");

  const enrolledIds = new Set(enrolled.map((c) => c.id));

  const fetchEnrolled = useCallback(async () => {
    setLE(true);
    try   { setEnrolled(await getMyEnrollments()); }
    catch { toast({ title: "Failed to load your courses", variant: "destructive" }); }
    finally { setLE(false); }
  }, []);

  const fetchExplore = useCallback(async () => {
    setLX(true);
    try   { const r = await getCourses({ limit: 12 }); setExplore(r.courses); }
    catch { toast({ title: "Failed to load courses", variant: "destructive" }); }
    finally { setLX(false); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEnrolled();
    fetchExplore();
  }, [isAuthenticated, fetchEnrolled, fetchExplore]);

  useEffect(() => {
    const fn = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        fetchEnrolled();
        fetchExplore();
      }
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
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

  /* ── derived stats ───────────────────────────────────── */
  const total       = enrolled.length;
  const completed   = enrolled.filter((c) => c.completed).length;
  const inProgress  = enrolled.filter((c) => !c.completed && c.progress > 0).length;
  const avgProgress = total
    ? Math.round(enrolled.reduce((a, c) => a + c.progress, 0) / total) : 0;

  const filteredExplore = explore.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  /* ── tab switcher ────────────────────────────────────── */
  const TabBtn = ({ t, label }: { t: typeof tab; label: string }) => (
    <button onClick={() => setTab(t)}
      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
      style={tab === t
        ? { background: NAVY, color: "#fff", boxShadow: "0 2px 8px rgba(11,31,58,0.2)" }
        : { color: "#64748b" }}>
      {label}
    </button>
  );

  /* ════════════════════════════════════════════════════ */
  return (
    <DashboardLayout items={sidebarItems} title="Student Portal" userName={user?.name ?? "Student"}>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Enrolled",  value: loadingE ? "—" : total,            icon: BookOpen,    accent: GOLD,      bg: `${GOLD}12`      },
          { label: "Completed",       value: loadingE ? "—" : completed,         icon: CheckCircle, accent: "#10b981", bg: "#10b98112"      },
          { label: "In Progress",     value: loadingE ? "—" : inProgress,        icon: TrendingUp,  accent: "#3b82f6", bg: "#3b82f612"      },
          { label: "Avg. Progress",   value: loadingE ? "—" : `${avgProgress}%`, icon: Award,       accent: "#8b5cf6", bg: "#8b5cf612"      },
        ].map(({ label, value, icon: Icon, accent, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3"
            style={{ border: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: bg }}>
              <Icon size={18} style={{ color: accent }} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="font-extrabold text-2xl leading-tight" style={{ color: NAVY }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white w-fit"
        style={{ border: "1px solid #e8edf2" }}>
        <TabBtn t="overview"    label="Overview"     />
        <TabBtn t="my-courses"  label="My Courses"   />
        <TabBtn t="explore"     label="Explore"      />
      </div>

      {/* ════ OVERVIEW ═════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="space-y-8">

          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg" style={{ color: NAVY }}>Continue Learning</h2>
              <p className="text-sm text-slate-400 mt-0.5">Pick up where you left off</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { fetchEnrolled(); fetchExplore(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-500 hover:border-slate-300 transition-colors">
                <RefreshCw size={11} /> Refresh
              </button>
              <button onClick={() => setTab("my-courses")}
                className="flex items-center gap-1 text-xs font-bold transition-colors"
                style={{ color: GOLD2 }}>
                View all <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* In-progress grid */}
          {loadingE ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} h="h-64" />)}
            </div>
          ) : enrolled.filter(c => !c.completed).length === 0 ? (
            <div className="bg-white rounded-2xl py-14 text-center"
              style={{ border: "1px solid #e8edf2" }}>
              <BookOpen size={32} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 text-sm font-medium">No courses in progress yet.</p>
              <button onClick={() => setTab("explore")}
                className="mt-3 text-sm font-bold" style={{ color: GOLD2 }}>
                Browse courses →
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolled.filter(c => !c.completed).slice(0, 3).map((c) => (
                <div key={c.id} className="bg-white rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300"
                  style={{ border: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/courses/${c.id}`}
                        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: GOLD }}>
                        <Play size={16} style={{ color: NAVY }} className="ml-0.5" />
                      </Link>
                    </div>
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                      <span className="text-[10px] font-bold text-white/80">by {c.instructor}</span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ background: GOLD, color: NAVY }}>{c.progress}%</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-sm line-clamp-1 mb-1" style={{ color: NAVY }}>{c.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                      <span className="flex items-center gap-1"><Clock size={10} />{c.category}</span>
                    </div>
                    <ProgressBar pct={c.progress} />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-400">{c.progress}% complete</span>
                      <Link to={`/courses/${c.id}`}
                        className="text-[11px] font-bold" style={{ color: GOLD2 }}>
                        Continue →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed courses */}
          {enrolled.filter(c => c.completed).length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-4" style={{ color: NAVY }}>Completed Courses 🎉</h2>
              <div className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #e8edf2" }}>
                {enrolled.filter(c => c.completed).map((c, i, arr) => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                    style={i < arr.length - 1 ? { borderBottom: "1px solid #f1f5f9" } : {}}>
                    <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{c.title}</p>
                      <p className="text-[11px] text-slate-400">by {c.instructor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge color="green"><CheckCircle size={9} className="inline mr-1" />Completed</Badge>
                      <Link to={`/courses/${c.id}`}
                        className="text-[11px] font-bold hidden sm:block" style={{ color: GOLD2 }}>
                        Review →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested */}
          {explore.filter(c => !enrolledIds.has(c.id)).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg" style={{ color: NAVY }}>Suggested for You</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Courses you might enjoy</p>
                </div>
                <button onClick={() => setTab("explore")}
                  className="text-xs font-bold flex items-center gap-1" style={{ color: GOLD2 }}>
                  See all <ArrowRight size={11} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {explore.filter(c => !enrolledIds.has(c.id)).slice(0, 3).map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
                    style={{ border: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div className="relative h-36 bg-slate-100 overflow-hidden">
                      <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                        className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ background: GOLD, color: NAVY }}>{c.category}</span>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm line-clamp-1 mb-1" style={{ color: NAVY }}>{c.title}</p>
                      <p className="text-[11px] text-slate-400 mb-3">by {c.instructor}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-base" style={{ color: c.price === 0 ? "#10b981" : NAVY }}>
                          {c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}
                        </p>
                        <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId === c.id}
                          className="text-xs font-extrabold px-4 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-60"
                          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
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

      {/* ════ MY COURSES ═══════════════════════════════════ */}
      {tab === "my-courses" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-lg" style={{ color: NAVY }}>My Courses</h2>
              <p className="text-sm text-slate-400 mt-0.5">{total} course{total !== 1 ? "s" : ""} enrolled</p>
            </div>
          </div>

          {loadingE ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} h="h-24" />)}</div>
          ) : enrolled.length === 0 ? (
            <div className="bg-white rounded-2xl py-20 text-center"
              style={{ border: "1px solid #e8edf2" }}>
              <BookOpen size={40} className="mx-auto mb-4 text-slate-200" />
              <p className="font-semibold text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
              <button onClick={() => setTab("explore")}
                className="px-6 py-2.5 rounded-full text-sm font-extrabold transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolled.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all"
                  style={{ border: "1px solid #e8edf2" }}>
                  {/* Thumbnail */}
                  <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 hidden sm:block" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: NAVY }}>{c.title}</p>
                      <Badge color={c.completed ? "green" : "gold"}>
                        {c.completed ? "Completed" : "Active"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      by {c.instructor} · {c.category}
                    </p>
                    <ProgressBar pct={c.progress} />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-slate-400">{c.progress}% complete</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {c.completed ? "✓ Done" : `${100 - c.progress}% remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Ring + Play */}
                  <div className="hidden md:flex flex-col items-center gap-2 shrink-0">
                    <div className="relative">
                      <ProgressRing pct={c.progress} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold"
                        style={{ color: NAVY }}>{c.progress}%</span>
                    </div>
                  </div>
                  <Link to={`/courses/${c.id}`}
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <Play size={15} style={{ color: NAVY }} className="ml-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ EXPLORE ══════════════════════════════════════ */}
      {tab === "explore" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-lg" style={{ color: NAVY }}>Explore Courses</h2>
              <p className="text-sm text-slate-400 mt-0.5">{filteredExplore.length} courses available</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category…"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all"
              style={{ border: "1px solid #e2e8f0" }}
              onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
              onBlur={e  => (e.currentTarget.style.borderColor = "#e2e8f0")} />
          </div>

          {loadingX ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} h="h-72" />)}
            </div>
          ) : filteredExplore.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl" style={{ border: "1px solid #e8edf2" }}>
              <Search size={28} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 text-sm">No courses match your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExplore.map((c) => {
                const isEnrolled = enrolledIds.has(c.id);
                return (
                  <div key={c.id} className="bg-white rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300"
                    style={{ border: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    {/* Image */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
                      <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide"
                        style={{ background: GOLD, color: NAVY }}>{c.category}</span>
                      {isEnrolled && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                          Enrolled
                        </span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/50 to-transparent">
                        <p className="text-[11px] text-white/80">by {c.instructor}</p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-sm line-clamp-2 mb-2 flex-1" style={{ color: NAVY }}>{c.title}</h3>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                        <span className="flex items-center gap-1"><Clock size={10} />{c.duration ?? "—"}</span>
                        <span className="flex items-center gap-1"><BookOpen size={10} />{c.lessons} lessons</span>
                        <span className="flex items-center gap-1"><Users size={10} />{c.enrolled}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11}
                            style={{
                              fill:  i < Math.floor(c.rating) ? GOLD : "#e2e8f0",
                              color: i < Math.floor(c.rating) ? GOLD : "#e2e8f0",
                            }} />
                        ))}
                        <span className="text-[11px] font-semibold text-slate-500 ml-1">{c.rating.toFixed(1)}</span>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid #f1f5f9" }}>
                        <div>
                          <p className="font-extrabold text-base"
                            style={{ color: c.price === 0 ? "#10b981" : NAVY }}>
                            {c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}
                          </p>
                          {c.price > 0 && <p className="text-[10px] text-slate-400">one-time</p>}
                        </div>
                        {isEnrolled ? (
                          <Link to={`/courses/${c.id}`}
                            className="flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-full transition-all hover:scale-105"
                            style={{ background: "#10b98118", color: "#059669", border: "1px solid #10b98140" }}>
                            <Play size={10} /> Continue
                          </Link>
                        ) : (
                          <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId === c.id}
                            className="text-xs font-extrabold px-4 py-2 rounded-full transition-all hover:scale-105 disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
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
