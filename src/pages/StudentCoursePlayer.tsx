// File: src/pages/StudentCoursePlayer.tsx
// Route: /learn/:id
// Light-themed course player — videos, progress tracking synced to DB

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronDown, ChevronRight,
  PlayCircle, CheckCircle, Clock, BookOpen,
  Film, FileText, Menu, X, Circle, Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCourse } from "@/hooks/useCourses";
import { updateProgress } from "@/api/enrollments";
import type { CoursePart, Lesson } from "@/api/courses";

const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";

// ── YouTube helper ────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|shorts\/))([^&?/\s]{11})/);
  return m ? m[1] : null;
}

// ── Parse content — API returns content as a JSON string ──────────────
function getParts(course: any): CoursePart[] {
  if (!course) return [];
  let content = course.content;
  if (typeof content === "string") {
    try { content = JSON.parse(content); } catch { return []; }
  }
  return content?.parts ?? [];
}

// ── Flat lesson list for sequential nav ───────────────────────────────
interface FlatLesson {
  lesson: Lesson;
  partIdx: number;
  modIdx: number;
  lessonIdx: number;
}
function flattenLessons(parts: CoursePart[]): FlatLesson[] {
  const list: FlatLesson[] = [];
  parts.forEach((part, pi) => {
    (part.modules ?? []).forEach((mod, mi) => {
      (mod.lessons ?? []).forEach((lesson, li) => {
        list.push({ lesson, partIdx: pi, modIdx: mi, lessonIdx: li });
      });
    });
  });
  return list;
}

function lessonKey(pi: number, mi: number, li: number) {
  return `${pi}-${mi}-${li}`;
}

// ── Local progress cache (instant UI, survives refresh) ───────────────
function cacheKey(userId: number, courseId: string) {
  return `lp_${userId}_${courseId}`;
}
function loadCache(userId: number, courseId: string): Set<string> {
  try {
    const r = localStorage.getItem(cacheKey(userId, courseId));
    return r ? new Set(JSON.parse(r)) : new Set();
  } catch { return new Set(); }
}
function saveCache(userId: number, courseId: string, done: Set<string>) {
  try {
    localStorage.setItem(cacheKey(userId, courseId), JSON.stringify([...done]));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────
export default function StudentCoursePlayer() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course, isLoading, error } = useCourse(id);

  const parts       = getParts(course);
  const flatLessons = flattenLessons(parts);

  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [activePart,     setActivePart]     = useState(0);
  const [activeMod,      setActiveMod]      = useState(0);
  const [activeLesson,   setActiveLesson]   = useState(0);
  const [collapsedParts, setCollapsedParts] = useState<Record<number, boolean>>({});
  const [collapsedMods,  setCollapsedMods]  = useState<Record<string, boolean>>({});
  const [done,           setDone]           = useState<Set<string>>(new Set());
  const [syncing,        setSyncing]        = useState(false);

  const userId   = user?.id ?? 0;
  const courseId = id ?? "";
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load cached progress on mount
  useEffect(() => {
    if (userId && courseId) setDone(loadCache(userId, courseId));
  }, [userId, courseId]);

  // Seed from API enrollment progress % on first load (if cache is empty)
  useEffect(() => {
    if (!course || !userId || !courseId || flatLessons.length === 0) return;
    const cached = loadCache(userId, courseId);
    if (cached.size > 0) return;
    const apiProgress = (course as any).progress ?? 0;
    if (apiProgress > 0) {
      const doneCount = Math.round((apiProgress / 100) * flatLessons.length);
      const initial = new Set(
        flatLessons.slice(0, doneCount).map(f => lessonKey(f.partIdx, f.modIdx, f.lessonIdx))
      );
      setDone(initial);
      saveCache(userId, courseId, initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, userId, courseId, flatLessons.length]);

  const currentLesson = parts[activePart]?.modules?.[activeMod]?.lessons?.[activeLesson];
  const currentKey    = lessonKey(activePart, activeMod, activeLesson);
  const ytId          = getYouTubeId(currentLesson?.videoUrl ?? "");

  const totalLessons = flatLessons.length;
  const doneCount    = done.size;
  const progressPct  = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
  const isCompleted  = progressPct === 100;

  // Debounced API sync — 800ms after last change
  const syncToApi = useCallback((newDone: Set<string>) => {
    if (!userId || !courseId || totalLessons === 0) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const pct       = Math.round((newDone.size / totalLessons) * 100);
      const completed = pct === 100;
      setSyncing(true);
      try {
        await updateProgress(Number(courseId), pct, completed);
      } catch (e) {
        console.warn("Progress sync failed", e);
      } finally {
        setSyncing(false);
      }
    }, 800);
  }, [userId, courseId, totalLessons]);

  const markDone = useCallback((key: string) => {
    setDone(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveCache(userId, courseId, next);
      syncToApi(next);
      return next;
    });
  }, [userId, courseId, syncToApi]);

  const unmarkDone = useCallback((key: string) => {
    setDone(prev => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      saveCache(userId, courseId, next);
      syncToApi(next);
      return next;
    });
  }, [userId, courseId, syncToApi]);

  // ✅ FIXED: useEffect is now correctly placed INSIDE the component
  // Flush any pending sync immediately when navigating away
  useEffect(() => {
    return () => {
      if (syncTimer.current) {
        clearTimeout(syncTimer.current);
        if (userId && courseId && totalLessons > 0) {
          const pct = Math.round((done.size / totalLessons) * 100);
          updateProgress(Number(courseId), pct, pct === 100).catch(() => {});
        }
      }
    };
  }, [done, userId, courseId, totalLessons]);

  const goToLesson = (pi: number, mi: number, li: number) => {
    setActivePart(pi); setActiveMod(mi); setActiveLesson(li);
    setCollapsedParts(p => ({ ...p, [pi]: false }));
    setCollapsedMods(p => ({ ...p, [`${pi}-${mi}`]: false }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const flatIdx = flatLessons.findIndex(f =>
    f.partIdx === activePart && f.modIdx === activeMod && f.lessonIdx === activeLesson
  );
  const hasPrev = flatIdx > 0;
  const hasNext = flatIdx < flatLessons.length - 1;

  const goPrev = () => {
    if (!hasPrev) return;
    const f = flatLessons[flatIdx - 1];
    goToLesson(f.partIdx, f.modIdx, f.lessonIdx);
  };

  const goNext = () => {
    markDone(currentKey);
    if (!hasNext) return;
    const f = flatLessons[flatIdx + 1];
    goToLesson(f.partIdx, f.modIdx, f.lessonIdx);
  };

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: `3px solid ${TEAL}30`, borderTop: `3px solid ${TEAL}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading course…</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: 16, fontWeight: 600 }}>{error ?? "Course not found"}</p>
          <button onClick={() => navigate("/dashboard/student")} style={{ padding: "10px 24px", background: TEAL, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasParts = parts.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb", fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        .fade-in{animation:fadeIn .25s ease;}
        .ls-item{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;cursor:pointer;transition:all .15s;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;}
        .ls-item:hover{background:#f1f5f9;}
        .ls-item.active{background:${TEAL}12;border-left:3px solid ${TEAL};padding-left:9px;}
        .mod-head{display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;border-radius:8px;transition:background .15s;border:none;background:transparent;width:100%;font-family:inherit;text-align:left;}
        .mod-head:hover{background:#f8fafc;}
        .part-head{display:flex;align-items:center;gap:10px;padding:11px 12px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;transition:background .15s;border-radius:10px;}
        .part-head:hover{background:#f8fafc;}
        .nav-btn{display:flex;align-items:center;gap:6px;padding:10px 20px;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .2s;}
        .nav-btn:disabled{opacity:.35;cursor:not-allowed;}
        .nav-btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.1);}
        @media(max-width:900px){
          .sidebar-panel{position:fixed;right:0;top:56px;bottom:0;z-index:100;box-shadow:-4px 0 24px rgba(0,0,0,.1);}
          .sidebar-panel.closed{transform:translateX(100%);}
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8edf2", height: 56, display: "flex", alignItems: "center", padding: "0 20px", gap: 14, position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <button
          onClick={() => navigate("/dashboard/student")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, fontWeight: 700, fontFamily: "inherit", padding: "6px 10px", borderRadius: 8, transition: "background .15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <ChevronLeft size={14} /> Dashboard
        </button>

        <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />

        <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {course.title}
        </p>

        {/* Progress pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {syncing && (
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, border: `1.5px solid ${TEAL}40`, borderTop: `1.5px solid ${TEAL}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              Saving…
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", borderRadius: 99, padding: "5px 14px" }}>
            <div style={{ width: 80, height: 4, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg,${TEAL},${TEAL2})`, borderRadius: 99, transition: "width .6s ease" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: isCompleted ? "#10b981" : TEAL, minWidth: 32 }}>
              {progressPct}%
            </span>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 7, borderRadius: 8, color: "#64748b", display: "flex", transition: "background .15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>

          {/* Video area */}
          <div style={{ background: "#000" }}>
            {ytId ? (
              <div style={{ position: "relative", paddingTop: "min(56.25%, 72vh)" }}>
                <iframe
                  key={`${activePart}-${activeMod}-${activeLesson}`}
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentLesson?.title ?? "Lesson"}
                />
              </div>
            ) : (
              <div style={{ background: "#f8fafc", padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={22} style={{ color: "#94a3b8" }} />
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Text lesson — no video</p>
              </div>
            )}
          </div>

          {/* Lesson details */}
          <div style={{ padding: "28px 32px 60px", maxWidth: 820, margin: "0 auto" }} className="fade-in">

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8", marginBottom: 14, flexWrap: "wrap" }}>
              <span>{parts[activePart]?.title || `Part ${activePart + 1}`}</span>
              <ChevronRight size={10} />
              <span>{parts[activePart]?.modules?.[activeMod]?.title || `Module ${activeMod + 1}`}</span>
              <ChevronRight size={10} />
              <span style={{ color: TEAL, fontWeight: 700 }}>Lesson {activeLesson + 1}</span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: NAVY, marginBottom: 12, lineHeight: 1.3 }}>
              {currentLesson?.title || `Lesson ${activeLesson + 1}`}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", gap: 16, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
              {currentLesson?.duration && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                  <Clock size={13} style={{ color: "#94a3b8" }} /> {currentLesson.duration}
                </span>
              )}
              {ytId && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                  <Film size={13} style={{ color: "#94a3b8" }} /> Video lesson
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: done.has(currentKey) ? "#10b981" : "#94a3b8" }}>
                {done.has(currentKey) ? <CheckCircle size={13} /> : <Circle size={13} />}
                {done.has(currentKey) ? "Completed" : "Not completed"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                <BookOpen size={13} style={{ color: "#94a3b8" }} />
                Lesson {flatIdx + 1} of {totalLessons}
              </span>
            </div>

            {/* Description */}
            {currentLesson?.description && (
              <div style={{ background: "#f8fafc", border: "1px solid #e8edf2", borderRadius: 12, padding: 20, marginBottom: 28 }}>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.9 }}>
                  {currentLesson.description}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
              <button onClick={goPrev} disabled={!hasPrev} className="nav-btn" style={{ background: "#f1f5f9", color: "#475569" }}>
                <ChevronLeft size={14} /> Previous
              </button>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {/* Mark complete toggle */}
                <button
                  onClick={() => done.has(currentKey) ? unmarkDone(currentKey) : markDone(currentKey)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 18px",
                    border: `1.5px solid ${done.has(currentKey) ? "#10b981" : "#e2e8f0"}`,
                    borderRadius: 10,
                    background: done.has(currentKey) ? "#d1fae5" : "#fff",
                    color: done.has(currentKey) ? "#065f46" : "#64748b",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                    fontFamily: "inherit", transition: "all .2s",
                  }}
                >
                  <CheckCircle size={13} />
                  {done.has(currentKey) ? "Completed ✓" : "Mark Complete"}
                </button>

                {hasNext ? (
                  <button onClick={goNext} className="nav-btn" style={{ background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff" }}>
                    Next Lesson <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => { markDone(currentKey); }}
                    className="nav-btn"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff" }}
                  >
                    <Award size={14} /> Finish Course
                  </button>
                )}
              </div>
            </div>

            {/* Completion banner */}
            {isCompleted && (
              <div style={{ marginTop: 28, background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "1px solid #6ee7b7", borderRadius: 16, padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#065f46", marginBottom: 6 }}>
                  Course Complete!
                </p>
                <p style={{ fontSize: 13, color: "#047857", marginBottom: 20 }}>
                  Congratulations on finishing <strong>{course.title}</strong>
                </p>
                <button
                  onClick={() => navigate("/dashboard/student")}
                  style={{ padding: "11px 28px", background: "#059669", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── CURRICULUM SIDEBAR ── */}
        <aside
          className={`sidebar-panel${sidebarOpen ? "" : " closed"}`}
          style={{
            width: 320,
            background: "#fff",
            borderLeft: "1px solid #e8edf2",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflowY: "auto",
            transition: "transform .25s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {/* Sidebar header — sticky */}
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 10, flexShrink: 0 }}>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: NAVY, marginBottom: 8 }}>
              Course Content
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <div style={{ flex: 1, height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg,${TEAL},${TEAL2})`, transition: "width .6s ease" }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: isCompleted ? "#10b981" : TEAL, flexShrink: 0 }}>
                {progressPct}%
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>
              {doneCount} / {totalLessons} lessons
              {syncing && <span style={{ color: TEAL, marginLeft: 6 }}>· Saving…</span>}
            </p>
          </div>

          {/* Parts */}
          <div style={{ flex: 1, padding: "8px 8px 32px", overflowY: "auto" }}>
            {!hasParts ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>No curriculum content yet.</p>
              </div>
            ) : parts.map((part, pi) => {
              const partCollapsed = collapsedParts[pi];
              const partDoneCount = (part.modules ?? []).reduce((a, m, mi) =>
                a + (m.lessons ?? []).filter((_, li) => done.has(lessonKey(pi, mi, li))).length, 0);
              const partTotal    = (part.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0);
              const partAllDone  = partDoneCount === partTotal && partTotal > 0;
              const partIsActive = pi === activePart;

              return (
                <div key={pi} style={{ marginBottom: 4 }}>
                  <button className="part-head" onClick={() => setCollapsedParts(p => ({ ...p, [pi]: !p[pi] }))}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                      background: partAllDone ? "#d1fae5" : partIsActive ? TEAL + "18" : "#f1f5f9",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {partAllDone
                        ? <CheckCircle size={13} style={{ color: "#10b981" }} />
                        : <span style={{ fontSize: 10, fontWeight: 800, color: partIsActive ? TEAL : "#64748b" }}>{pi + 1}</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <p style={{ fontWeight: 700, fontSize: 12, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {part.title || `Part ${pi + 1}`}
                      </p>
                      <p style={{ fontSize: 10, color: "#94a3b8" }}>{partDoneCount}/{partTotal} lessons done</p>
                    </div>
                    <ChevronDown size={13} style={{ color: "#94a3b8", transform: partCollapsed ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                  </button>

                  {!partCollapsed && (part.modules ?? []).map((mod, mi) => {
                    const modKey       = `${pi}-${mi}`;
                    const modCollapsed = collapsedMods[modKey];
                    const modDone      = (mod.lessons ?? []).filter((_, li) => done.has(lessonKey(pi, mi, li))).length;
                    const modAllDone   = modDone === (mod.lessons?.length ?? 0) && (mod.lessons?.length ?? 0) > 0;
                    const modIsActive  = pi === activePart && mi === activeMod;

                    return (
                      <div key={mi} style={{ paddingLeft: 8 }}>
                        <button className="mod-head" onClick={() => setCollapsedMods(p => ({ ...p, [modKey]: !p[modKey] }))}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                            background: modAllDone ? "#d1fae5" : "#f1f5f9",
                            border: `1px solid ${modIsActive ? TEAL + "60" : "#e2e8f0"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {modAllDone
                              ? <CheckCircle size={10} style={{ color: "#10b981" }} />
                              : <span style={{ fontSize: 8, fontWeight: 800, color: modIsActive ? TEAL : "#94a3b8" }}>{mi + 1}</span>
                            }
                          </div>
                          <p style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
                            {mod.title || `Module ${mi + 1}`}
                          </p>
                          <span style={{ fontSize: 10, color: "#94a3b8", marginRight: 4 }}>
                            {modDone}/{mod.lessons?.length ?? 0}
                          </span>
                          <ChevronDown size={11} style={{ color: "#94a3b8", transform: modCollapsed ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                        </button>

                        {!modCollapsed && (mod.lessons ?? []).map((lesson, li) => {
                          const key      = lessonKey(pi, mi, li);
                          const isActive = pi === activePart && mi === activeMod && li === activeLesson;
                          const isDone   = done.has(key);
                          const hasVid   = !!getYouTubeId(lesson.videoUrl ?? "");

                          return (
                            <button
                              key={li}
                              className={`ls-item${isActive ? " active" : ""}`}
                              onClick={() => goToLesson(pi, mi, li)}
                              style={{ paddingLeft: 30 }}
                            >
                              <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {isDone
                                  ? <CheckCircle size={14} style={{ color: "#10b981" }} />
                                  : isActive
                                  ? <PlayCircle size={14} style={{ color: TEAL }} />
                                  : hasVid
                                  ? <Film size={12} style={{ color: "#cbd5e1" }} />
                                  : <FileText size={12} style={{ color: "#cbd5e1" }} />
                                }
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: 12,
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? NAVY : isDone ? "#94a3b8" : "#475569",
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                  textDecoration: isDone && !isActive ? "line-through" : "none",
                                }}>
                                  {lesson.title || `Lesson ${li + 1}`}
                                </p>
                                {lesson.duration && (
                                  <p style={{ fontSize: 10, color: "#94a3b8" }}>{lesson.duration}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
