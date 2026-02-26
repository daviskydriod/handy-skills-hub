// File: src/pages/dashboard/StudentDashboard.tsx

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Search, Award, User, Settings,
  Clock, CheckCircle, TrendingUp, Star, ArrowRight, RefreshCw,
  Play,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, enrollInCourse, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";

const sidebarItems = [
  { label: "Dashboard",       to: "/dashboard/student",      icon: <LayoutDashboard size={18} /> },
  { label: "My Courses",      to: "/dashboard/my-courses",   icon: <BookOpen size={18} /> },
  { label: "Explore Courses", to: "/dashboard/explore",      icon: <Search size={18} /> },
  { label: "Certificates",    to: "/dashboard/certificates", icon: <Award size={18} /> },
  { label: "Profile",         to: "/dashboard/profile",      icon: <User size={18} /> },
  { label: "Settings",        to: "/dashboard/settings",     icon: <Settings size={18} /> },
];

const Skeleton = ({ h = "h-8", w = "w-full", rounded = "rounded-lg" }: { h?: string; w?: string; rounded?: string }) => (
  <div className={`${h} ${w} ${rounded} bg-border/60 animate-pulse`} />
);

const ProgressRing = ({ pct, size = 44 }: { pct: number; size?: number }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EAB308" strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();

  const [tab,             setTab]           = useState<"overview" | "my-courses" | "explore">("overview");
  const [enrolled,        setEnrolled]      = useState<EnrolledCourse[]>([]);
  const [explore,         setExplore]       = useState<Course[]>([]);
  const [loadingEnrolled, setLE]            = useState(true);
  const [loadingExplore,  setLX]            = useState(false);
  const [enrollingId,     setEnrollingId]   = useState<number | null>(null);
  const [exploreSearch,   setExploreSearch] = useState("");

  const enrolledIds = new Set(enrolled.map((c) => c.id));

  const fetchEnrolled = useCallback(async () => {
    setLE(true);
    try {
      const data = await getMyEnrollments();
      setEnrolled(data);
    } catch {
      toast({ title: "Failed to load your courses", variant: "destructive" });
    } finally { setLE(false); }
  }, []);

  const fetchExplore = useCallback(async () => {
    setLX(true);
    try {
      const res = await getCourses({ limit: 12 });
      setExplore(res.courses);
    } catch {
      toast({ title: "Failed to load courses", variant: "destructive" });
    } finally { setLX(false); }
  }, []);

  // ✅ Wait for auth to be ready before fetching — avoids 401 on first load
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEnrolled();
    fetchExplore();
  }, [isAuthenticated, fetchEnrolled, fetchExplore]);

  // ✅ Re-fetch when user switches back to this browser tab — catches deleted/updated courses
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        fetchEnrolled();
        fetchExplore();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
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
    ? Math.round(enrolled.reduce((a, c) => a + c.progress, 0) / enrolled.length)
    : 0;

  const filteredExplore = explore.filter((c) =>
    c.title.toLowerCase().includes(exploreSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(exploreSearch.toLowerCase())
  );

  return (
    <DashboardLayout items={sidebarItems} title="Student Portal" userName={user?.name ?? "Student"}>

      {/* Welcome banner */}
      <div className="gradient-accent rounded-xl p-5 mb-6 text-accent-foreground flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl md:text-2xl mb-1">
            Welcome back, {user?.name?.split(" ")[0] ?? "Student"}! 👋
          </h1>
          <p className="text-sm opacity-90">Continue your learning journey today.</p>
        </div>
        <button onClick={fetchEnrolled}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full transition-colors">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Enrolled",     value: enrolled.length,   icon: BookOpen,    color: "text-yellow-500" },
          { label: "Completed",    value: completed,          icon: CheckCircle, color: "text-emerald-500" },
          { label: "In Progress",  value: inProgress,         icon: TrendingUp,  color: "text-blue-500" },
          { label: "Avg Progress", value: `${avgProgress}%`,  icon: Award,       color: "text-purple-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
            <p className="font-heading font-bold text-2xl text-foreground">{loadingEnrolled ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-1 mb-5 bg-secondary/50 rounded-xl p-1 w-fit">
        {(["overview", "my-courses", "explore"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t === "my-courses" ? "My Courses" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-base text-foreground">Continue Learning</h2>
              <button onClick={() => setTab("my-courses")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                View all <ArrowRight size={11} />
              </button>
            </div>
            {loadingEnrolled ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <Skeleton key={i} h="h-48" rounded="rounded-xl" />)}
              </div>
            ) : enrolled.filter(c => !c.completed).length === 0 ? (
              <div className="bg-card border border-border rounded-xl py-12 text-center">
                <BookOpen size={28} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No courses in progress.</p>
                <button onClick={() => setTab("explore")}
                  className="mt-3 text-xs font-semibold text-yellow-600 hover:underline">
                  Browse courses →
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolled.filter(c => !c.completed).slice(0, 3).map((c) => (
                  <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative h-36 bg-secondary">
                      <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/courses/${c.id}`}
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow">
                          <Play size={16} className="text-yellow-600 ml-0.5" />
                        </Link>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {c.progress}%
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-foreground line-clamp-1 mb-1">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground mb-2">by {c.instructor}</p>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div className="gradient-accent h-1.5 rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{c.progress}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {enrolled.filter(c => c.completed).length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-base text-foreground mb-3">Completed Courses 🎉</h2>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {enrolled.filter(c => c.completed).map((c) => (
                  <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    </div>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold shrink-0">
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
                <h2 className="font-heading font-semibold text-base text-foreground">Suggested for You</h2>
                <button onClick={() => setTab("explore")}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  See all <ArrowRight size={11} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {explore.filter(c => !enrolledIds.has(c.id)).slice(0, 3).map((c) => (
                  <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="h-32 bg-secondary relative">
                      <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                        {c.category}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-foreground line-clamp-1 mb-1">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground mb-3">by {c.instructor}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">
                          {c.price === 0 ? <span className="text-emerald-600">Free</span> : `₦${c.price.toLocaleString()}`}
                        </span>
                        <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId === c.id}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-full gradient-accent text-accent-foreground disabled:opacity-60">
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

      {/* ── MY COURSES ── */}
      {tab === "my-courses" && (
        <div>
          {loadingEnrolled ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} h="h-20" rounded="rounded-xl" />)}</div>
          ) : enrolled.length === 0 ? (
            <div className="bg-card border border-border rounded-xl py-20 text-center">
              <BookOpen size={36} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium mb-3">You haven't enrolled in any courses yet.</p>
              <button onClick={() => setTab("explore")}
                className="px-5 py-2 rounded-full gradient-accent text-accent-foreground text-sm font-bold">
                Explore Courses
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolled.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{c.title}</p>
                      {c.completed
                        ? <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold shrink-0">Done</span>
                        : <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-semibold shrink-0">Active</span>
                      }
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">by {c.instructor} · {c.category}</p>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="gradient-accent h-1.5 rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{c.progress}% complete</p>
                  </div>
                  <div className="relative shrink-0 hidden sm:flex items-center justify-center">
                    <ProgressRing pct={c.progress} />
                    <span className="absolute text-[10px] font-bold text-foreground">{c.progress}%</span>
                  </div>
                  <Link to={`/courses/${c.id}`}
                    className="shrink-0 w-9 h-9 rounded-xl gradient-accent flex items-center justify-center text-accent-foreground hover:opacity-90 transition-opacity">
                    <Play size={14} className="ml-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EXPLORE ── */}
      {tab === "explore" && (
        <div>
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={exploreSearch} onChange={(e) => setExploreSearch(e.target.value)}
              placeholder="Search courses by title or category…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors" />
          </div>
          {loadingExplore ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} h="h-52" rounded="rounded-xl" />)}
            </div>
          ) : filteredExplore.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No courses found</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExplore.map((c) => {
                const isEnrolled = enrolledIds.has(c.id);
                return (
                  <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                    <div className="relative h-36 bg-secondary shrink-0">
                      <img src={c.image ?? "/placeholder-course.jpg"} alt={c.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                        {c.category}
                      </span>
                      {isEnrolled && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Enrolled
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="font-semibold text-sm text-foreground line-clamp-2 mb-1 flex-1">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground mb-2">by {c.instructor}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[11px] text-foreground">{c.rating.toFixed(1)}</span>
                        <span className="text-[11px] text-muted-foreground">· {c.enrolled} students</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="font-bold text-sm text-foreground">
                          {c.price === 0 ? <span className="text-emerald-600">Free</span> : `₦${c.price.toLocaleString()}`}
                        </span>
                        {isEnrolled ? (
                          <Link to={`/courses/${c.id}`}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <Play size={10} /> Continue
                          </Link>
                        ) : (
                          <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId === c.id}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-full gradient-accent text-accent-foreground disabled:opacity-60 transition-opacity">
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
