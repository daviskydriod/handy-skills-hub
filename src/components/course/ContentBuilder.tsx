// ── ContentBuilder & ContentViewer ─────────────────────────────────────
// Parts → Modules → Lessons content editor.
// Used by AdminDashboard and InstructorDashboard (Add/Edit course forms).
// ContentViewer is used in the Admin course detail panel.

import { useState } from "react";
import {
  ChevronDown, Plus, X, GripVertical, PlayCircle,
  Film, FileText, Clock, BookOpen,
} from "lucide-react";
import { NAVY, GOLD, GOLD2 } from "../../theme";

// ── Types ──────────────────────────────────────────────────────────────
export interface Lesson {
  id: string; title: string; description: string; videoUrl: string; duration: string;
}
export interface Module {
  id: string; title: string; description: string; lessons: Lesson[];
}
export interface Part {
  id: string; title: string; description: string; modules: Module[];
}

// ── ID helpers ─────────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);
export const mkLesson = (): Lesson => ({ id: uid(), title: "", description: "", videoUrl: "", duration: "" });
export const mkModule = (): Module => ({ id: uid(), title: "", description: "", lessons: [mkLesson()] });
export const mkPart   = (): Part   => ({ id: uid(), title: "", description: "", modules: [mkModule()] });

export function ensureIds(parts: any[]): Part[] {
  return (parts ?? []).map(p => ({
    id:          p.id          ?? uid(),
    title:       p.title       ?? "",
    description: p.description ?? "",
    modules: (p.modules ?? []).map((m: any) => ({
      id:          m.id          ?? uid(),
      title:       m.title       ?? "",
      description: m.description ?? "",
      lessons: (m.lessons ?? []).map((l: any) => ({
        id:          l.id          ?? uid(),
        title:       l.title       ?? "",
        description: l.description ?? "",
        videoUrl:    l.videoUrl    ?? l.video_url ?? "",
        duration:    l.duration    ?? "",
      })),
    })),
  }));
}

export function parseCourseContent(raw: any): { parts: Part[] } | null {
  if (!raw) return null;
  let obj: any = raw;
  if (typeof raw === "string") {
    try { obj = JSON.parse(raw); } catch { return null; }
  }
  if (typeof obj === "object" && obj !== null && Array.isArray(obj.parts)) {
    return { parts: ensureIds(obj.parts) };
  }
  return null;
}

export function ytId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|shorts\/))([^&?/\s]{11})/);
  return m ? m[1] : null;
}

// ── ContentViewer ──────────────────────────────────────────────────────
export const ContentViewer = ({ rawContent }: { rawContent: any }) => {
  const [openPart, setOpenPart] = useState<string | null>(null);
  const [openMod,  setOpenMod]  = useState<string | null>(null);
  const parsed = parseCourseContent(rawContent);
  const parts: Part[] = parsed?.parts ?? [];

  if (!parts.length) return (
    <div style={{ padding: "28px 0", textAlign: "center" }}>
      <BookOpen size={28} style={{ color: "#cbd5e1", margin: "0 auto 8px" }} />
      <p style={{ fontSize: 12, color: "#94a3b8" }}>No course content uploaded yet.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {parts.map((part, pi) => {
        const pid = part.id ?? String(pi);
        return (
          <div key={pid} style={{ border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
            <button
              onClick={() => setOpenPart(openPart === pid ? null : pid)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", background: NAVY + "08", border: "none",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 7, background: NAVY,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{pi + 1}</span>
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{part.title || `Part ${pi + 1}`}</p>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>
                  {(part.modules ?? []).length} modules · {(part.modules ?? []).reduce((a: number, m: Module) => a + (m.lessons ?? []).length, 0)} lessons
                </p>
              </div>
              <ChevronDown size={14} style={{
                color: "#94a3b8",
                transform: openPart === pid ? "rotate(180deg)" : "none",
                transition: "transform .2s", flexShrink: 0,
              }} />
            </button>
            {openPart === pid && (
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {part.description && <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{part.description}</p>}
                {(part.modules ?? []).map((mod, mi) => {
                  const mk = `${pid}|${mod.id ?? mi}`;
                  return (
                    <div key={mk} style={{ border: "1px solid #f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                      <button
                        onClick={() => setOpenMod(openMod === mk ? null : mk)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 12px", background: "#f8fafc", border: "none",
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: 6,
                          background: GOLD + "22", display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: GOLD2 }}>{mi + 1}</span>
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ fontWeight: 700, fontSize: 12, color: NAVY }}>{mod.title || `Module ${mi + 1}`}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8" }}>{(mod.lessons ?? []).length} lessons</p>
                        </div>
                        <ChevronDown size={13} style={{
                          color: "#94a3b8",
                          transform: openMod === mk ? "rotate(180deg)" : "none",
                          transition: "transform .2s",
                        }} />
                      </button>
                      {openMod === mk && (
                        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                          {(mod.lessons ?? []).map((lesson, li) => {
                            const vid = ytId(lesson.videoUrl ?? "");
                            return (
                              <div key={lesson.id ?? li} style={{
                                background: "#fff", border: "1px solid #eef2f7",
                                borderRadius: 8, padding: "11px 13px",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                  <PlayCircle size={13} style={{ color: GOLD2 }} />
                                  <span style={{ fontWeight: 700, fontSize: 12, color: NAVY, flex: 1 }}>
                                    Lesson {li + 1}{lesson.title ? `: ${lesson.title}` : ""}
                                  </span>
                                  {lesson.duration && <span style={{ fontSize: 10, color: "#94a3b8" }}>{lesson.duration}</span>}
                                </div>
                                {lesson.description && <p style={{ fontSize: 11, color: "#64748b", marginBottom: 7, lineHeight: 1.6 }}>{lesson.description}</p>}
                                {vid
                                  ? <div style={{ borderRadius: 7, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                      <iframe src={`https://www.youtube.com/embed/${vid}`} style={{ width: "100%", height: 150, border: "none", display: "block" }} allowFullScreen title={lesson.title} />
                                    </div>
                                  : lesson.videoUrl
                                  ? <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: GOLD2, wordBreak: "break-all" }}>{lesson.videoUrl}</a>
                                  : <p style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>No video URL added</p>
                                }
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── ContentBuilder ─────────────────────────────────────────────────────
interface ContentBuilderProps {
  parts: Part[];
  onChange: (parts: Part[]) => void;
}

export function ContentBuilder({ parts, onChange }: ContentBuilderProps) {
  const [colParts, setColParts] = useState<Record<string, boolean>>({});
  const [colMods,  setColMods]  = useState<Record<string, boolean>>({});

  const setParts = (next: Part[]) => onChange(next);
  const updPart  = (pid: string, d: Partial<Part>) => setParts(parts.map(p => p.id === pid ? { ...p, ...d } : p));
  const addPart  = () => setParts([...parts, mkPart()]);
  const remPart  = (pid: string) => setParts(parts.filter(p => p.id !== pid));
  const addMod   = (pid: string) => updPart(pid, { modules: [...parts.find(p => p.id === pid)!.modules, mkModule()] });
  const remMod   = (pid: string, mid: string) => updPart(pid, { modules: parts.find(p => p.id === pid)!.modules.filter(m => m.id !== mid) });
  const updMod   = (pid: string, mid: string, d: Partial<Module>) => updPart(pid, { modules: parts.find(p => p.id === pid)!.modules.map(m => m.id === mid ? { ...m, ...d } : m) });
  const addLesson  = (pid: string, mid: string) => { const mod = parts.find(p => p.id === pid)!.modules.find(m => m.id === mid)!; updMod(pid, mid, { lessons: [...mod.lessons, mkLesson()] }); };
  const remLesson  = (pid: string, mid: string, lid: string) => { const mod = parts.find(p => p.id === pid)!.modules.find(m => m.id === mid)!; updMod(pid, mid, { lessons: mod.lessons.filter(l => l.id !== lid) }); };
  const updLesson  = (pid: string, mid: string, lid: string, d: Partial<Lesson>) => { const mod = parts.find(p => p.id === pid)!.modules.find(m => m.id === mid)!; updMod(pid, mid, { lessons: mod.lessons.map(l => l.id === lid ? { ...l, ...d } : l) }); };

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: NAVY }}>📚 Course Content</p>
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Structure: Parts → Modules → Lessons</p>
        </div>
        <button type="button" onClick={addPart} className="add-btn"><Plus size={13} /> Add Part</button>
      </div>

      {(parts ?? []).map((part, pi) => {
        const pc = colParts[part.id];
        const tl = (part.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0);
        return (
          <div key={part.id} className="part-block">
            <div
              className="sec-head"
              style={{ background: NAVY + "06", borderBottom: pc ? "none" : "1px solid #e8edf2" }}
              onClick={() => setColParts(p => ({ ...p, [part.id]: !p[part.id] }))}
            >
              <GripVertical size={14} style={{ color: "#cbd5e1" }} />
              <div style={{ width: 24, height: 24, borderRadius: 6, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{pi + 1}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{part.title || `Part ${pi + 1}`}</p>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>{(part.modules ?? []).length} modules · {tl} lessons</p>
              </div>
              <ChevronDown size={14} style={{ color: "#94a3b8", transform: pc ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
              {parts.length > 1 && (
                <button type="button" onClick={e => { e.stopPropagation(); remPart(part.id); }} className="btn-icon">
                  <X size={13} style={{ color: "#ef4444" }} />
                </button>
              )}
            </div>

            {!pc && (
              <div style={{ padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }} className="fgrid">
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 5, display: "block" }}>Part Title</label>
                    <input className="dash-inp" value={part.title} onChange={e => updPart(part.id, { title: e.target.value })} placeholder={`Part ${pi + 1}: Introduction`} style={{ fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 5, display: "block" }}>Part Description</label>
                    <input className="dash-inp" value={part.description} onChange={e => updPart(part.id, { description: e.target.value })} placeholder="Brief overview…" style={{ fontSize: 12 }} />
                  </div>
                </div>

                {(part.modules ?? []).map((mod, mi) => {
                  const mk = `${part.id}|${mod.id}`;
                  const mc = colMods[mk];
                  return (
                    <div key={mod.id} className="mod-block">
                      <div
                        className="sec-head"
                        style={{ borderBottom: mc ? "none" : "1px solid #e8edf2" }}
                        onClick={() => setColMods(p => ({ ...p, [mk]: !p[mk] }))}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: 5, background: GOLD + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: GOLD2 }}>{mi + 1}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 12, color: NAVY }}>{mod.title || `Module ${mi + 1}`}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8" }}>{(mod.lessons ?? []).length} lessons</p>
                        </div>
                        <ChevronDown size={13} style={{ color: "#94a3b8", transform: mc ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                        {part.modules.length > 1 && (
                          <button type="button" onClick={e => { e.stopPropagation(); remMod(part.id, mod.id); }} className="btn-icon">
                            <X size={12} style={{ color: "#ef4444" }} />
                          </button>
                        )}
                      </div>
                      {!mc && (
                        <div style={{ padding: 14 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }} className="fgrid">
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>Module Title</label>
                              <input className="dash-inp" value={mod.title} onChange={e => updMod(part.id, mod.id, { title: e.target.value })} placeholder={`Module ${mi + 1}`} style={{ fontSize: 12 }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>Module Description</label>
                              <input className="dash-inp" value={mod.description} onChange={e => updMod(part.id, mod.id, { description: e.target.value })} placeholder="What's covered…" style={{ fontSize: 12 }} />
                            </div>
                          </div>

                          {(mod.lessons ?? []).map((lesson, li) => {
                            const vid = ytId(lesson.videoUrl ?? "");
                            return (
                              <div key={lesson.id} className="lesson-block">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <PlayCircle size={13} style={{ color: GOLD2 }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>Lesson {li + 1}</span>
                                  </div>
                                  {mod.lessons.length > 1 && (
                                    <button type="button" onClick={() => remLesson(part.id, mod.id, lesson.id)} className="btn-icon">
                                      <X size={12} style={{ color: "#ef4444" }} />
                                    </button>
                                  )}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }} className="fgrid">
                                  <div>
                                    <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 3 }}><FileText size={10} /> Lesson Title</label>
                                    <input className="dash-inp" value={lesson.title} onChange={e => updLesson(part.id, mod.id, lesson.id, { title: e.target.value })} placeholder="e.g. Intro to Variables" style={{ fontSize: 12 }} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} /> Duration</label>
                                    <input className="dash-inp" value={lesson.duration} onChange={e => updLesson(part.id, mod.id, lesson.id, { duration: e.target.value })} placeholder="e.g. 12 mins" style={{ fontSize: 12 }} />
                                  </div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 3 }}><Film size={10} /> YouTube URL</label>
                                  <input className="dash-inp" value={lesson.videoUrl} onChange={e => updLesson(part.id, mod.id, lesson.id, { videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." style={{ fontSize: 12 }} />
                                </div>
                                {vid && (
                                  <div style={{ borderRadius: 8, overflow: "hidden", marginBottom: 8, border: "1px solid #e2e8f0" }}>
                                    <iframe src={`https://www.youtube.com/embed/${vid}`} style={{ width: "100%", height: 160, border: "none", display: "block" }} allowFullScreen title={lesson.title} />
                                  </div>
                                )}
                                <div>
                                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "block" }}>Lesson Description</label>
                                  <textarea className="dash-inp" value={lesson.description} onChange={e => updLesson(part.id, mod.id, lesson.id, { description: e.target.value })} rows={2} placeholder="What will students learn?" style={{ fontSize: 12, resize: "vertical" }} />
                                </div>
                              </div>
                            );
                          })}
                          <button type="button" onClick={() => addLesson(part.id, mod.id)} className="add-btn" style={{ marginTop: 6 }}><Plus size={12} /> Add Lesson</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button type="button" onClick={() => addMod(part.id)} className="add-btn" style={{ marginTop: 4 }}><Plus size={12} /> Add Module</button>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={addPart} className="add-btn" style={{ width: "100%", justifyContent: "center", padding: "11px 0" }}>
        <Plus size={13} /> Add Another Part
      </button>
    </section>
  );
}
