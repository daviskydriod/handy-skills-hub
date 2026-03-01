// File: src/pages/dashboard/InstructorDashboard.tsx
// ── Uses shared: DashboardLayout, StatCard, CourseThumb, SkeletonRow,
//                CourseStatusBadge, ContentBuilder, Avatar
// ── Theme: NAVY/GOLD (Admin theme, unified)
// ── Mobile: Student-approved mobile layout via DashboardLayout

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, BookOpen, PlusCircle, Users, DollarSign,
  Trash2, EyeOff, Upload, X, Star, Edit2, Search,
  Check, Clock, TrendingUp, AlertCircle, ShieldCheck,
  BarChart2, ChevronRight, Loader, Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getCourses, createCourse, updateCourse,
  updateCourseWithFile, deleteCourse, type Course,
} from "@/api/courses";
import { getCategories, type Category } from "@/api/categories";

import { DashboardLayout, useMobile } from "../../components/layout/DashboardLayout";
import { StatCard, CourseThumb, SkeletonRow, CourseStatusBadge } from "../../components/shared/UIAtoms";
import { ContentBuilder, parseCourseContent, mkPart, type Part } from "../../components/course/ContentBuilder";
import { NAVY, GOLD, GOLD2 } from "../../theme";

type TabType = "overview" | "courses" | "add" | "earnings";

const makeEmptyForm = () => ({
  title: "", description: "", price: "", duration: "",
  lessons: "", catId: "", file: null as File | null,
  preview: null as string | null, parts: [mkPart()] as Part[],
});

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const mobile   = useMobile();

  const [tab,        setTab]        = useState<TabType>("overview");
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQ,    setSearchQ]    = useState("");
  const [form,       setForm]       = useState(makeEmptyForm);

  const fileRef = useRef<HTMLInputElement>(null);
  const setF    = (key: keyof ReturnType<typeof makeEmptyForm>, val: any) => setForm(p => ({ ...p, [key]: val }));
  const resetForm = () => { setForm(makeEmptyForm()); setEditingId(null); };

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getCourses({ limit: 200, admin: true });
      setCourses(res.courses.filter((c: Course) => Number(c.instructor_id) === Number(user.id)));
    } catch {
      toast({ title: "Failed to load courses", variant: "destructive" });
    } finally { setLoading(false); }
  }, [user?.id]);

  const fetchCats = useCallback(async () => {
    try { setCategories(await getCategories()); } catch {}
  }, []);

  useEffect(() => { if (!user) return; fetchCourses(); fetchCats(); }, [user, fetchCourses, fetchCats]);
  useEffect(() => {
    const fn = () => { if (document.visibilityState === "visible" && user) fetchCourses(); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [user, fetchCourses]);

  const totalStudents = courses.reduce((a, c) => a + (c.enrolled ?? 0), 0);
  const totalEarnings = courses.reduce((a, c) => a + (parseFloat(String(c.price ?? 0)) * (c.enrolled ?? 0)), 0);
  const avgRating     = courses.length ? (courses.reduce((a, c) => a + (c.rating ?? 0), 0) / courses.length).toFixed(1) : "—";
  const published     = courses.filter(c => c.is_published).length;
  const pending       = courses.filter(c => !c.is_published).length;
  const displayed     = courses.filter(c =>
    c.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  const startEdit = (c: Course) => {
    const parsed = parseCourseContent(c.content);
    setForm({
      title: c.title ?? "", description: c.description ?? "",
      price: String(c.price ?? ""), duration: c.duration ?? "",
      lessons: String(c.lessons ?? ""), catId: String(c.category_id ?? ""),
      file: null, preview: c.image ?? null,
      parts: parsed?.parts?.length ? parsed.parts : [mkPart()],
    });
    setEditingId(c.id);
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSubmitting(true);
    const contentJSON = JSON.stringify({ parts: form.parts });
    try {
      if (editingId) {
        if (form.file) {
          const fd = new FormData();
          fd.append("title", form.title); fd.append("description", form.description);
          fd.append("price", form.price || "0"); fd.append("duration", form.duration);
          fd.append("lessons_count", form.lessons || "0"); fd.append("category_id", form.catId);
          fd.append("is_published", "0"); fd.append("thumbnail", form.file); fd.append("content", contentJSON);
          await updateCourseWithFile(editingId, fd);
        } else {
          await updateCourse(editingId, { title: form.title, description: form.description, price: parseFloat(form.price || "0"), duration: form.duration, lessons_count: parseInt(form.lessons || "0"), category_id: form.catId || null, is_published: 0, content: contentJSON });
        }
        toast({ title: "Course updated — awaiting admin approval ✅" });
      } else {
        const fd = new FormData();
        fd.append("title", form.title); fd.append("description", form.description);
        fd.append("price", form.price || "0"); fd.append("duration", form.duration);
        fd.append("lessons_count", form.lessons || "0"); fd.append("category_id", form.catId);
        fd.append("is_published", "0"); fd.append("content", contentJSON);
        if (form.file) fd.append("thumbnail", form.file);
        await createCourse(fd);
        toast({ title: "Course submitted for admin approval 🎉" });
      }
      resetForm(); await fetchCourses(); setTab("courses");
    } catch (err: any) {
      toast({ title: err?.response?.data?.error ?? "Failed to save", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCourse(id); setCourses(prev => prev.filter(c => c.id !== id));
      toast({ title: "Course deleted" });
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
    finally { setDeletingId(null); }
  };

  const navItems = [
    { key: "overview",  label: "Overview",                             icon: LayoutDashboard },
    { key: "courses",   label: "My Courses",                           icon: BookOpen, badge: pending },
    { key: "add",       label: editingId ? "Edit Course" : "Add Course", icon: PlusCircle },
    { key: "earnings",  label: "Earnings",                             icon: DollarSign },
  ];

  const pageTitle = {
    overview: `Welcome back, ${user?.name?.split(" ")[0] ?? "Instructor"} 👋`,
    courses:  "My Courses",
    add:      editingId ? "Edit Course" : "Add New Course",
    earnings: "Earnings",
  }[tab] ?? "";

  const mobileSubtitle = { overview: "Instructor Portal", courses: "My Courses", add: "Course Builder", earnings: "Earnings" }[tab] ?? "";
  const mobileTitle    = { overview: user?.name?.split(" ")[0] ?? "Instructor", courses: `${courses.length} courses`, add: editingId ? "Edit" : "New Course", earnings: `₦${totalEarnings.toLocaleString()}` }[tab] ?? "";

  return (
    <DashboardLayout
      navItems={navItems}
      activeTab={tab}
      onTabChange={key => {
        setTab(key as TabType);
        if (key === "add" && !editingId) resetForm();
      }}
      pageTitle={pageTitle}
      mobileSubtitle={mobileSubtitle}
      mobileTitleText={mobileTitle}
      user={user}
      onLogout={() => { logout(); navigate("/"); }}
      onRefresh={() => { fetchCourses(); fetchCats(); }}
      hasMobileBadge={pending > 0}
    >
      {/* ════ OVERVIEW ════ */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gap: 12 }} className="g4">
            <StatCard label="My Courses"       value={loading ? "—" : courses.length}                                       icon={BookOpen}    color={GOLD2}     bg={GOLD + "15"} />
            <StatCard label="Total Students"   value={loading ? "—" : totalStudents.toLocaleString()}                       icon={Users}       color="#3b82f6"   bg="#3b82f615"   />
            <StatCard label="Est. Earnings"    value={loading ? "—" : `₦${totalEarnings.toLocaleString()}`}                 icon={DollarSign}  color="#10b981"   bg="#10b98115"   />
            <StatCard label="Avg Rating"       value={loading ? "—" : avgRating}                                            icon={Star}        color="#f59e0b"   bg="#f59e0b15"   />
            <StatCard label="Published"        value={loading ? "—" : published}                                            icon={TrendingUp}  color="#22c55e"   bg="#22c55e15"   />
            <StatCard label="Pending Approval" value={loading ? "—" : pending}                                              icon={Clock}       color="#f97316"   bg="#f9731615"   />
            <StatCard label="Avg Students"     value={loading ? "—" : courses.length ? Math.round(totalStudents / courses.length) : 0} icon={BarChart2} color="#8b5cf6" bg="#8b5cf615" />
            <StatCard label="Categories"       value={loading ? "—" : new Set(courses.map(c => c.category)).size}           icon={ChevronRight} color="#ec4899"  bg="#ec489915"   />
          </div>

          <div style={{ background: GOLD + "08", border: `1px solid ${GOLD}25`, borderRadius: 14, padding: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <ShieldCheck size={16} style={{ color: GOLD2, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 2 }}>Admin Approval Required</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>All new and edited courses are saved as drafts and must be approved by an admin before going live.</p>
            </div>
          </div>

          {pending > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 2 }}>{pending} Course{pending > 1 ? "s" : ""} Awaiting Approval</p>
                <p style={{ fontSize: 12, color: "#64748b" }}>Your submitted courses are under admin review.</p>
              </div>
              <button onClick={() => setTab("courses")} style={{ fontSize: 11, fontWeight: 700, color: GOLD2, background: "none", border: `1px solid ${GOLD}50`, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                View →
              </button>
            </div>
          )}

          {loading ? (
            <div className="dash-card" style={{ overflow: "hidden" }}>{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
          ) : courses.length === 0 ? (
            <div className="dash-card" style={{ padding: "56px 24px", textAlign: "center" }}>
              <BookOpen size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8", marginBottom: 16, fontSize: 14 }}>No courses yet.</p>
              <button onClick={() => { resetForm(); setTab("add"); }} className="btn-gold" style={{ padding: "10px 24px", fontSize: 13 }}>
                <PlusCircle size={14} /> Create First Course
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
              {courses.slice(0, 6).map(c => (
                <div key={c.id} className="dash-card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <CourseThumb title={c.title} image={c.image} size={46} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{c.title}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{c.enrolled} students · ₦{parseFloat(String(c.price ?? 0)).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <CourseStatusBadge published={!!c.is_published} />
                    <button onClick={() => startEdit(c)} className="btn-icon"><Edit2 size={13} style={{ color: GOLD2 }} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ MY COURSES ════ */}
      {tab === "courses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>
              My Courses <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 13 }}>({courses.length})</span>
            </h2>
            <button onClick={() => { resetForm(); setTab("add"); }} className="btn-gold" style={{ padding: "9px 18px", fontSize: 12 }}>
              <PlusCircle size={13} /> New Course
            </button>
          </div>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input className="dash-inp" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search courses…" style={{ paddingLeft: 36 }} />
          </div>
          <div className="dash-card" style={{ overflow: "hidden" }}>
            {loading ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) :
              displayed.length === 0 ? (
                <div style={{ padding: "56px 24px", textAlign: "center" }}><p style={{ color: "#94a3b8" }}>{courses.length === 0 ? "No courses yet." : "No results."}</p></div>
              ) : displayed.map(c => (
                <div key={c.id} className="dash-row">
                  <CourseThumb title={c.title} image={c.image} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>{c.category || "—"} · {c.enrolled} students · ₦{parseFloat(String(c.price ?? 0)).toLocaleString()}</p>
                  </div>
                  <CourseStatusBadge published={!!c.is_published} />
                  <div style={{ display: "flex", gap: 4 }}>
                    {c.is_published && (
                      <button onClick={async () => {
                        try {
                          await updateCourse(c.id, { is_published: 0 });
                          setCourses(prev => prev.map(x => x.id === c.id ? { ...x, is_published: false } : x));
                          toast({ title: "Course unpublished" });
                        } catch { toast({ title: "Failed", variant: "destructive" }); }
                      }} className="btn-icon" title="Unpublish">
                        <EyeOff size={14} style={{ color: "#64748b" }} />
                      </button>
                    )}
                    <button onClick={() => startEdit(c)} className="btn-icon" title="Edit">
                      <Edit2 size={14} style={{ color: GOLD2 }} />
                    </button>
                    <button onClick={() => handleDelete(c.id, c.title)} disabled={deletingId === c.id} className="btn-icon" title="Delete">
                      <Trash2 size={14} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ════ ADD / EDIT ════ */}
      {tab === "add" && (
        <div style={{ maxWidth: 780 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: NAVY, marginBottom: 4 }}>
                {editingId ? "Edit Course" : "Create New Course"}
              </h2>
              <p style={{ fontSize: 12, color: "#64748b" }}>
                {editingId ? "Changes require admin re-approval before going live." : "Your course will be reviewed by an admin before going live."}
              </p>
            </div>
            {editingId && (
              <button onClick={() => { resetForm(); setTab("courses"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
                <X size={13} /> Cancel
              </button>
            )}
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 12, display: "flex", gap: 8, marginBottom: 22 }}>
            <Info size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#92400e" }}>
              <strong>Admin approval required.</strong> {editingId ? "Saving will reset this course to Pending." : "Course will be saved as a draft until approved."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <section className="dash-card" style={{ padding: 20 }}>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: NAVY, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>📋 Basic Information</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Course Title <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="dash-inp" value={form.title} onChange={e => setF("title", e.target.value)} required placeholder="e.g. Complete Digital Marketing Masterclass" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Description</label>
                  <textarea className="dash-inp" value={form.description} onChange={e => setF("description", e.target.value)} rows={4} placeholder="What will students learn?" style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="fgrid">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Category</label>
                    <select className="dash-inp" value={form.catId} onChange={e => setF("catId", e.target.value)}>
                      <option value="">Select category…</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Price (₦) — 0 for Free</label>
                    <input className="dash-inp" type="number" min="0" step="100" value={form.price} onChange={e => setF("price", e.target.value)} placeholder="e.g. 15000" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="fgrid">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Duration</label>
                    <input className="dash-inp" value={form.duration} onChange={e => setF("duration", e.target.value)} placeholder="e.g. 4 weeks" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Lessons Count</label>
                    <input className="dash-inp" type="number" min="0" value={form.lessons} onChange={e => setF("lessons", e.target.value)} placeholder="e.g. 24" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Course Thumbnail</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", border: `1.5px dashed ${GOLD}60`, borderRadius: 12, background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: GOLD2, fontFamily: "inherit" }}>
                      <Upload size={14} /> {form.file ? "Change Image" : "Upload Thumbnail"}
                    </button>
                    {form.preview && (
                      <div style={{ position: "relative" }}>
                        <img src={form.preview} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0" }} />
                        <button type="button" onClick={() => setForm(p => ({ ...p, file: null, preview: null }))} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ef4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={9} color="#fff" />
                        </button>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setForm(p => ({ ...p, file: f, preview: URL.createObjectURL(f) })); }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Recommended: 1280×720px · JPG, PNG or WebP</p>
                </div>
              </div>
            </section>

            <ContentBuilder
              parts={form.parts}
              onChange={parts => setF("parts", parts)}
            />

            <div style={{ display: "flex", gap: 10, paddingTop: 4, flexWrap: "wrap" }}>
              <button type="submit" disabled={submitting} className="btn-gold" style={{ padding: "11px 24px", fontSize: 13 }}>
                {submitting ? <><Loader size={13} className="spin" /> Saving…</> : <><Check size={13} /> {editingId ? "Save & Submit for Review" : "Submit for Approval"}</>}
              </button>
              <button type="button" onClick={() => { resetForm(); setTab("courses"); }} style={{ padding: "11px 20px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, color: "#64748b" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ════ EARNINGS ════ */}
      {tab === "earnings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gap: 12 }} className="g3">
            {[
              { label: "Total Earned",   value: `₦${totalEarnings.toLocaleString()}`,                                                                              desc: "All time estimate" },
              { label: "Avg per Course", value: courses.length ? `₦${Math.round(totalEarnings / courses.length).toLocaleString()}` : "—",                          desc: "Average revenue"   },
              { label: "Best Performer", value: courses.length ? `₦${Math.max(...courses.map(c => parseFloat(String(c.price ?? 0)) * (c.enrolled ?? 0))).toLocaleString()}` : "—", desc: "Highest earning" },
            ].map(s => (
              <div key={s.label} className="dash-card" style={{ padding: 20 }}>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: NAVY, marginBottom: 4 }}>{loading ? "—" : s.value}</p>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="dash-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>Revenue per Course</h3>
            </div>
            {loading ? [1, 2, 3].map(i => <SkeletonRow key={i} />) :
              courses.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}><p style={{ color: "#94a3b8" }}>No courses yet.</p></div>
              ) : [...courses].sort((a, b) =>
                  (parseFloat(String(b.price ?? 0)) * (b.enrolled ?? 0)) -
                  (parseFloat(String(a.price ?? 0)) * (a.enrolled ?? 0))
                ).map((c, i, arr) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <CourseThumb title={c.title} image={c.image} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{c.enrolled} students · {c.is_published ? "Live" : "Pending"}</p>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 15, color: NAVY, flexShrink: 0 }}>
                      {parseFloat(String(c.price ?? 0)) === 0
                        ? <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 13 }}>Free</span>
                        : `₦${(parseFloat(String(c.price ?? 0)) * (c.enrolled ?? 0)).toLocaleString()}`}
                    </p>
                  </div>
                ))
            }
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 12, display: "flex", gap: 8 }}>
            <AlertCircle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#92400e" }}>Earnings are estimates. Actual payouts depend on admin-confirmed bank transfer payments.</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
