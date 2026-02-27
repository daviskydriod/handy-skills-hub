// File: src/pages/StudentCoursePlayer.tsx
// Route: /learn/:id
// Full course player — shows video, tracks progress, sidebar curriculum

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronDown, ChevronRight,
  PlayCircle, CheckCircle, Clock, BookOpen,
  Film, FileText, Menu, X, Circle, Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCourse } from "@/hooks/useCourses";
import type { CoursePart, CourseModule, Lesson } from "@/api/courses";

const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";
const GOLD  = "#f59e0b";

// ── YouTube helper ────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|shorts\/))([^&?/\s]{11})/);
  return m ? m[1] : null;
}

// ── Flat lesson list for prev/next nav ────────────────────────────────
interface FlatLesson {
  lesson: Lesson;
  partIdx: number;
  modIdx: number;
  lessonIdx: number;
  partTitle: string;
  modTitle: string;
}
function flattenLessons(parts: CoursePart[]): FlatLesson[] {
  const list: FlatLesson[] = [];
  parts.forEach((part, pi) => {
    (part.modules ?? []).forEach((mod, mi) => {
      (mod.lessons ?? []).forEach((lesson, li) => {
        list.push({ lesson, partIdx: pi, modIdx: mi, lessonIdx: li, partTitle: part.title || `Part ${pi + 1}`, modTitle: mod.title || `Module ${mi + 1}` });
      });
    });
  });
  return list;
}

// ── Progress storage (localStorage per user+course) ───────────────────
function getProgressKey(userId: number, courseId: string) {
  return `progress_${userId}_${courseId}`;
}
function loadProgress(userId: number, courseId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getProgressKey(userId, courseId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveProgress(userId: number, courseId: string, done: Set<string>) {
  try { localStorage.setItem(getProgressKey(userId, courseId), JSON.stringify([...done])); } catch {}
}

// ── Lesson ID helper ──────────────────────────────────────────────────
function lessonKey(pi: number, mi: number, li: number) {
  return `${pi}-${mi}-${li}`;
}

export default function StudentCoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course, isLoading, error } = useCourse(id);

  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [activePart,    setActivePart]    = useState(0);
  const [activeMod,     setActiveMod]     = useState(0);
  const [activeLesson,  setActiveLesson]  = useState(0);
  const [collapsedParts, setCollapsedParts] = useState<Record<number, boolean>>({});
  const [collapsedMods,  setCollapsedMods]  = useState<Record<string, boolean>>({});
  const [done,          setDone]          = useState<Set<string>>(new Set());
  const [autoplay,      setAutoplay]      = useState(false);

  const userId = user?.id ?? 0;
  const parts = course?.content?.parts ?? [];
  const flatLessons = flattenLessons(parts);
  const currentLesson = parts[activePart]?.modules?.[activeMod]?.lessons?.[activeLesson];
  const currentKey = lessonKey(activePart, activeMod, activeLesson);
  const ytId = getYouTubeId(currentLesson?.videoUrl ?? "");

  // Load saved progress
  useEffect(() => {
    if (userId && id) setDone(loadProgress(userId, id));
  }, [userId, id]);

  const markDone = useCallback((key: string) => {
    setDone(prev => {
      const next = new Set(prev);
      next.add(key);
      saveProgress(userId, id!, next);
      return next;
    });
  }, [userId, id]);

  const goToLesson = (pi: number, mi: number, li: number) => {
    setActivePart(pi); setActiveMod(mi); setActiveLesson(li);
    setCollapsedParts(p => ({ ...p, [pi]: false }));
    setCollapsedMods(p => ({ ...p, [`${pi}-${mi}`]: false }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentFlatIdx = flatLessons.findIndex(f => f.partIdx === activePart && f.modIdx === activeMod && f.lessonIdx === activeLesson);
  const hasPrev = currentFlatIdx > 0;
  const hasNext = currentFlatIdx < flatLessons.length - 1;

  const goPrev = () => {
    if (!hasPrev) return;
    const f = flatLessons[currentFlatIdx - 1];
    goToLesson(f.partIdx, f.modIdx, f.lessonIdx);
  };

  const goNext = () => {
    markDone(currentKey);
    if (!hasNext) return;
    const f = flatLessons[currentFlatIdx + 1];
    goToLesson(f.partIdx, f.modIdx, f.lessonIdx);
  };

  const totalLessons = flatLessons.length;
  const doneCount = done.size;
  const progressPct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  // ── Loading / error states ────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${TEAL}40`, borderTop: `3px solid ${TEAL}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Loading course…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ minHeight: "100vh", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: 16 }}>{error ?? "Course not found"}</p>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "10px 24px", background: TEAL, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasParts = parts.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1520", fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .ls-item{display:flex;align-items:center;gap:9px;padding:9px 14px;border-radius:8px;cursor:pointer;transition:all .15s;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;}
        .ls-item:hover{background:rgba(255,255,255,.06);}
        .ls-item.active{background:${TEAL}20;border-left:2px solid ${TEAL};}
        .mod-head{display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:pointer;border-radius:8px;transition:background .15s;}
        .mod-head:hover{background:rgba(255,255,255,.04);}
        .part-head{display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.06);}
        .part-head:hover{background:rgba(255,255,255,.04);}
        .progress-bar{height:3px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;}
        .progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,${TEAL},${TEAL2});transition:width .6s ease;}
        .nav-btn{display:flex;align-items:center;gap:6px;padding:10px 20px;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .2s;}
        .nav-btn:disabled{opacity:.35;cursor:not-allowed;}
        @media(max-width:900px){.sidebar-panel{display:none!important;} .sidebar-panel.open{display:flex!important;position:fixed;inset:0;z-index:100;}}
      `}</style>

      {/* ── TOP BAR ── */}
      <header style={{ background: "#0b1220", borderBottom: "1px solid rgba(255,255,255,.08)", height: 56, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
          <ChevronLeft size={15} /> Dashboard
        </button>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.12)" }} />
        <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</p>

        {/* Progress in header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 120, height: 4, background: "rgba(255,255,255,.12)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: TEAL, borderRadius: 99, transition: "width .5s ease" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>{progressPct}%</span>
        </div>

        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "rgba(255,255,255,.6)", display: "flex" }}>
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── VIDEO + CONTENT AREA ── */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>

          {/* Video player */}
          <div style={{ background: "#000", position: "relative" }}>
            {ytId ? (
              <div style={{ position: "relative", paddingTop: "56.25%" }}>
                <iframe
                  key={`${activePart}-${activeMod}-${activeLesson}`}
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=${autoplay ? 1 : 0}&rel=0`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={currentLesson?.title ?? "Lesson"}
                />
              </div>
            ) : (
              <div style={{ paddingTop: "56.25%", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#0b1220" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={26} style={{ color: "rgba(255,255,255,.3)" }} />
                  </div>
                  <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, fontWeight: 600 }}>No video for this lesson</p>
                  <p style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>Read the lesson description below</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info + nav */}
          <div style={{ padding: "24px 28px", maxWidth: 860, margin: "0 auto" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 12, flexWrap: "wrap" }}>
              <span>{parts[activePart]?.title || `Part ${activePart + 1}`}</span>
              <ChevronRight size={10} />
              <span>{parts[activePart]?.modules?.[activeMod]?.title || `Module ${activeMod + 1}`}</span>
              <ChevronRight size={10} />
              <span style={{ color: TEAL }}>Lesson {activeLesson + 1}</span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 10, lineHeight: 1.3 }}>
              {currentLesson?.title || `Lesson ${activeLesson + 1}`}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {currentLesson?.duration && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,.45)" }}>
                  <Clock size={12} /> {currentLesson.duration}
                </span>
              )}
              {ytId && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,.45)" }}>
                  <Film size={12} /> Video lesson
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: done.has(currentKey) ? TEAL : "rgba(255,255,255,.35)" }}>
                {done.has(currentKey) ? <CheckCircle size={12} /> : <Circle size={12} />}
                {done.has(currentKey) ? "Completed" : "Not yet completed"}
              </span>
            </div>

            {/* Description */}
            {currentLesson?.description && (
              <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.8 }}>{currentLesson.description}</p>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.08)" }}>
              <button onClick={goPrev} disabled={!hasPrev} className="nav-btn" style={{ background: "rgba(255,255,255,.07)", color: "#fff" }}>
                <ChevronLeft size={14} /> Previous
              </button>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {/* Mark complete */}
                <button
                  onClick={() => markDone(currentKey)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", border: done.has(currentKey) ? `1px solid ${TEAL}` : "1px solid rgba(255,255,255,.15)", borderRadius: 10, background: done.has(currentKey) ? TEAL + "20" : "transparent", color: done.has(currentKey) ? TEAL : "rgba(255,255,255,.5)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}
                >
                  <CheckCircle size={13} /> {done.has(currentKey) ? "Completed ✓" : "Mark Complete"}
                </button>

                {hasNext && (
                  <button onClick={goNext} className="nav-btn" style={{ background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff" }}>
                    Next <ChevronRight size={14} />
                  </button>
                )}

                {!hasNext && (
                  <button onClick={() => markDone(currentKey)} className="nav-btn" style={{ background: `linear-gradient(135deg,#10b981,#059669)`, color: "#fff" }}>
                    <CheckCircle size={14} /> Finish Course
                  </button>
                )}
              </div>
            </div>

            {/* Course completed state */}
            {progressPct === 100 && (
              <div style={{ marginTop: 24, background: "linear-gradient(135deg,#065f4620,#0d948820)", border: `1px solid ${TEAL}40`, borderRadius: 14, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 4 }}>Course Completed!</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>Congratulations on finishing {course.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── CURRICULUM SIDEBAR ── */}
        <div
          className={`sidebar-panel${sidebarOpen ? " open" : ""}`}
          style={{
            width: sidebarOpen ? 340 : 0,
            background: "#0b1220",
            borderLeft: "1px solid rgba(255,255,255,.07)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            transition: "width .25s cubic-bezier(.4,0,.2,1)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Sidebar header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", marginBottom: 6 }}>Course Curriculum</p>
            {/* Progress bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg,${TEAL},${TEAL2})`, transition: "width .6s ease" }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, flexShrink: 0 }}>{progressPct}%</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
              {doneCount} of {totalLessons} lessons completed
            </p>
          </div>

          {/* Parts */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {!hasParts ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13 }}>No curriculum content available yet.</p>
              </div>
            ) : parts.map((part, pi) => {
              const partCollapsed = collapsedParts[pi];
              const partDone = (part.modules ?? []).reduce((a, m) =>
                a + (m.lessons ?? []).filter((_, li) => done.has(lessonKey(pi, (part.modules ?? []).indexOf(m), li))).length, 0);
              const partTotal = (part.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0);

              return (
                <div key={pi} style={{ marginBottom: 4 }}>
                  {/* Part header */}
                  <div className="part-head" onClick={() => setCollapsedParts(p => ({ ...p, [pi]: !p[pi] }))}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: pi === activePart ? TEAL : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: pi === activePart ? "#fff" : "rgba(255,255,255,.5)" }}>{pi + 1}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {part.title || `Part ${pi + 1}`}
                      </p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{partDone}/{partTotal} lessons</p>
                    </div>
                    <ChevronDown size={13} style={{ color: "rgba(255,255,255,.3)", transform: partCollapsed ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                  </div>

                  {/* Modules */}
                  {!partCollapsed && (part.modules ?? []).map((mod, mi) => {
                    const modKey = `${pi}-${mi}`;
                    const modCollapsed = collapsedMods[modKey];

                    return (
                      <div key={mi} style={{ paddingLeft: 8 }}>
                        {/* Module header */}
                        <div className="mod-head" onClick={() => setCollapsedMods(p => ({ ...p, [modKey]: !p[modKey] }))}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, background: mi === activeMod && pi === activePart ? TEAL + "30" : "transparent", border: `1px solid ${mi === activeMod && pi === activePart ? TEAL : "rgba(255,255,255,.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 8, fontWeight: 800, color: mi === activeMod && pi === activePart ? TEAL : "rgba(255,255,255,.35)" }}>{mi + 1}</span>
                          </div>
                          <p style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {mod.title || `Module ${mi + 1}`}
                          </p>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>{mod.lessons?.length ?? 0}</span>
                          <ChevronDown size={11} style={{ color: "rgba(255,255,255,.25)", transform: modCollapsed ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                        </div>

                        {/* Lessons */}
                        {!modCollapsed && (mod.lessons ?? []).map((lesson, li) => {
                          const key = lessonKey(pi, mi, li);
                          const isActive = pi === activePart && mi === activeMod && li === activeLesson;
                          const isDone   = done.has(key);
                          const hasVideo = !!getYouTubeId(lesson.videoUrl ?? "");

                          return (
                            <button
                              key={li}
                              className={`ls-item${isActive ? " active" : ""}`}
                              onClick={() => goToLesson(pi, mi, li)}
                              style={{ paddingLeft: 24 }}
                            >
                              {/* Status icon */}
                              <div style={{ flexShrink: 0, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {isDone
                                  ? <CheckCircle size={14} style={{ color: TEAL }} />
                                  : isActive
                                  ? <PlayCircle size={14} style={{ color: GOLD }} />
                                  : hasVideo
                                  ? <Film size={13} style={{ color: "rgba(255,255,255,.25)" }} />
                                  : <FileText size={13} style={{ color: "rgba(255,255,255,.25)" }} />
                                }
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : isDone ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: isDone ? "line-through" : "none" }}>
                                  {lesson.title || `Lesson ${li + 1}`}
                                </p>
                                {lesson.duration && (
                                  <p style={{ fontSize: 10, color: "rgba(255,255,255,.2)" }}>{lesson.duration}</p>
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
        </div>
      </div>
    </div>
  );
}
