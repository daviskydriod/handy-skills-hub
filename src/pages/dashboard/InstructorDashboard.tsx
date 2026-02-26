// File: src/pages/dashboard/InstructorDashboard.tsx
// Full instructor dashboard — create, edit, publish/unpublish, delete courses.
// No mockData — all wired to flat PHP backend.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, BookOpen, PlusCircle, Users, DollarSign,
  User, Trash2, Eye, EyeOff, Upload, X, Star, Edit2,
  RefreshCw, Search, Check, Clock, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";
import { getCategories, type Category } from "@/api/categories";
import { getCourses, createCourse, updateCourse, updateCourseWithFile, deleteCourse, type Course } from "@/api/courses";

// ── Sidebar ────────────────────────────────────────────────────────────────────
const sidebarItems = [
  { label: "Dashboard",  to: "/instructor",             icon: <LayoutDashboard size={18} /> },
  { label: "My Courses", to: "/instructor/courses",     icon: <BookOpen size={18} /> },
  { label: "Add Course", to: "/instructor/add-course",  icon: <PlusCircle size={18} /> },
  { label: "Students",   to: "/instructor/students",    icon: <Users size={18} /> },
  { label: "Earnings",   to: "/instructor/earnings",    icon: <DollarSign size={18} /> },
  { label: "Profile",    to: "/instructor/profile",     icon: <User size={18} /> },
];

const Skeleton = ({ h = "h-8" }: { h?: string }) => (
  <div className={`${h} w-full rounded-xl bg-border/60 animate-pulse`} />
);

// ═════════════════════════════════════════════════════════════════════════════
export default function InstructorDashboard() {
  const { user } = useAuth();

  const [courses,     setCourses]     = useState<Course[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [deletingId,  setDeletingId]  = useState<number | null>(null);
  const [searchQ,     setSearchQ]     = useState("");
  const [tab,         setTab]         = useState<"courses" | "earnings">("courses");

  // ── Form fields ───────────────────────────────────────────────────────────
  const [fTitle,      setFTitle]      = useState("");
  const [fDesc,       setFDesc]       = useState("");
  const [fPrice,      setFPrice]      = useState("");
  const [fDuration,   setFDuration]   = useState("");
  const [fLessons,    setFLessons]    = useState("");
  const [fCatId,      setFCatId]      = useState("");
  const [fPublished,  setFPublished]  = useState(false);
  const [fFile,       setFFile]       = useState<File | null>(null);
  const [fPreview,    setFPreview]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFTitle(""); setFDesc(""); setFPrice(""); setFDuration("");
    setFLessons(""); setFCatId(""); setFPublished(false);
    setFFile(null); setFPreview(null); setEditingId(null); setShowForm(false);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCourses({ limit: 100 });
      // Show only courses belonging to this instructor
      setCourses(res.courses.filter(c => c.instructor_id === user?.id));
    } catch { toast({ title: "Failed to load courses", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [user?.id]);

  const fetchCats = useCallback(async () => {
    try { setCategories(await getCategories()); } catch {}
  }, []);

  useEffect(() => { fetchCourses(); fetchCats(); }, [fetchCourses, fetchCats]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalStudents = courses.reduce((a, c) => a + c.enrolled, 0);
  const totalEarnings = courses.reduce((a, c) => a + c.price * c.enrolled, 0);
  const avgRating     = courses.length
    ? (courses.reduce((a, c) => a + c.rating, 0) / courses.length).toFixed(1)
    : "—";
  const published     = courses.filter(c => c.is_published).length;

  // ── Populate form for edit ────────────────────────────────────────────────
  const startEdit = (c: Course) => {
    setFTitle(c.title); setFDesc(c.description);
    setFPrice(String(c.price)); setFDuration(c.duration ?? "");
    setFLessons(String(c.lessons)); setFCatId(String(c.category_id ?? ""));
    setFPublished(c.is_published); setFPreview(c.image);
    setFFile(null); setEditingId(c.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        if (fFile) {
          const form = new FormData();
          form.append("title", fTitle); form.append("description", fDesc);
          form.append("price", fPrice || "0"); form.append("duration", fDuration);
          form.append("lessons_count", fLessons || "0"); form.append("category_id", fCatId);
          form.append("is_published", fPublished ? "1" : "0"); form.append("thumbnail", fFile);
          await updateCourseWithFile(editingId, form);
        } else {
          await updateCourse(editingId, {
            title: fTitle, description: fDesc, price: parseFloat(fPrice || "0"),
            duration: fDuration, lessons_count: parseInt(fLessons || "0"),
            category_id: fCatId || null, is_published: fPublished ? 1 : 0,
          });
        }
        toast({ title: "Course updated ✅" });
      } else {
        const form = new FormData();
        form.append("title", fTitle); form.append("description", fDesc);
        form.append("price", fPrice || "0"); form.append("duration", fDuration);
        form.append("lessons_count", fLessons || "0"); form.append("category_id", fCatId);
        form.append("is_published", fPublished ? "1" : "0");
        if (fFile) form.append("thumbnail", fFile);
        await createCourse(form);
        toast({ title: "Course created ✅" });
      }
      resetForm(); fetchCourses();
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Failed to save", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  // ── Toggle publish ────────────────────────────────────────────────────────
  const togglePublish = async (c: Course) => {
    try {
      await updateCourse(c.id, { is_published: c.is_published ? 0 : 1 });
      setCourses(prev => prev.map(x => x.id === c.id ? { ...x, is_published: !c.is_published } : x));
      toast({ title: c.is_published ? "Course unpublished" : "Course published ✅" });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast({ title: "Course deleted" });
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
    finally { setDeletingId(null); }
  };

  const displayed = courses.filter(c =>
    c.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout items={sidebarItems} title="Instructor Portal" userName={user?.name ?? "Instructor"}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-xl md:text-2xl text-foreground">Instructor Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your courses and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchCourses} className="gap-1.5 text-xs hidden sm:flex">
            <RefreshCw size={13} /> Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(v => !v); }}
            className="gradient-accent text-accent-foreground border-0 gap-1.5">
            <PlusCircle size={14} /> New Course
          </Button>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "My Courses",     value: courses.length,                     icon: BookOpen,   color: "bg-yellow-500" },
          { label: "Total Students", value: totalStudents.toLocaleString(),      icon: Users,      color: "bg-blue-500" },
          { label: "Total Earnings", value: `₦${totalEarnings.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-500" },
          { label: "Avg Rating",     value: avgRating,                           icon: Star,       color: "bg-purple-500" },
          { label: "Published",      value: published,                           icon: Eye,        color: "bg-teal-500" },
          { label: "Drafts",         value: courses.length - published,          icon: EyeOff,     color: "bg-slate-400" },
          { label: "Avg Students",   value: courses.length ? Math.round(totalStudents / courses.length) : 0, icon: TrendingUp, color: "bg-indigo-500" },
          { label: "Categories",     value: new Set(courses.map(c => c.category)).size, icon: Clock, color: "bg-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">{label}</p>
              <p className="font-heading font-bold text-lg text-foreground leading-none mt-0.5">
                {loading ? "—" : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CREATE / EDIT FORM ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-base text-foreground">
              {editingId ? "✏️ Edit Course" : "➕ Create New Course"}
            </h2>
            <button onClick={resetForm}
              className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
              <X size={15} className="text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Course Title *</label>
                <input value={fTitle} onChange={e => setFTitle(e.target.value)} required
                  placeholder="e.g. Complete Digital Marketing Masterclass"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} rows={3}
                  placeholder="What will students learn? What are the requirements?"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category</label>
                <select value={fCatId} onChange={e => setFCatId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-yellow-400 transition-colors">
                  <option value="">Select category…</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Price (₦) — 0 for Free</label>
                <input value={fPrice} onChange={e => setFPrice(e.target.value)}
                  type="number" min="0" step="100" placeholder="e.g. 15000"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Duration</label>
                <input value={fDuration} onChange={e => setFDuration(e.target.value)}
                  placeholder="e.g. 4 weeks / 20 hours"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Number of Lessons</label>
                <input value={fLessons} onChange={e => setFLessons(e.target.value)}
                  type="number" min="0" placeholder="e.g. 24"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Thumbnail Image</label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-yellow-400 hover:text-foreground transition-all">
                    <Upload size={14} /> {fFile ? "Change Image" : "Upload Thumbnail"}
                  </button>
                  {fPreview && (
                    <div className="relative">
                      <img src={fPreview} alt="" className="w-16 h-16 rounded-xl object-cover border border-border" />
                      <button type="button" onClick={() => { setFFile(null); setFPreview(null); }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow">
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) { setFFile(f); setFPreview(URL.createObjectURL(f)); } }} />
                </div>
              </div>

              <div className="md:col-span-2">
                <button type="button" onClick={() => setFPublished(v => !v)}
                  className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-5.5 rounded-full transition-colors relative flex-shrink-0 ${fPublished ? "bg-yellow-400" : "bg-border"}`}
                    style={{ height: "22px", width: "40px" }}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${fPublished ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Publish immediately
                    {fPublished && <span className="ml-2 text-[11px] text-emerald-600 font-semibold">Will be live</span>}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}
                className="gradient-accent text-accent-foreground border-0 gap-2 disabled:opacity-60">
                {submitting
                  ? <><RefreshCw size={14} className="animate-spin" /> Saving…</>
                  : <><Check size={14} /> {editingId ? "Save Changes" : "Create Course"}</>
                }
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABS ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 bg-secondary/50 rounded-xl p-1 w-fit">
        {(["courses", "earnings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══════════════ COURSES TAB ══════════════ */}
      {tab === "courses" && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Search your courses…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors" />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} h="h-14" />)}</div>
            ) : displayed.length === 0 ? (
              <div className="py-20 text-center">
                <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm mb-4">
                  {courses.length === 0 ? "No courses yet — create your first!" : "No courses match your search"}
                </p>
                {courses.length === 0 && (
                  <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}
                    className="gradient-accent text-accent-foreground border-0 gap-1.5">
                    <PlusCircle size={13} /> Create First Course
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden md:table-cell">Students</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden lg:table-cell">Rating</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map(c => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {c.image
                              ? <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              : <div className="w-10 h-10 rounded-lg bg-secondary shrink-0 flex items-center justify-center"><BookOpen size={13} className="text-muted-foreground" /></div>
                            }
                            <p className="font-medium text-foreground text-sm line-clamp-1 max-w-[140px]">{c.title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{c.category || "—"}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground text-sm">
                          {c.price === 0 ? <span className="text-emerald-600 font-semibold text-xs">Free</span> : `₦${c.price.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{c.enrolled}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Star size={11} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{c.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${c.is_published ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                            {c.is_published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => togglePublish(c)} title={c.is_published ? "Unpublish" : "Publish"}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                              {c.is_published ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-muted-foreground" />}
                            </button>
                            <button onClick={() => startEdit(c)} title="Edit"
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                              <Edit2 size={14} className="text-blue-500" />
                            </button>
                            <button onClick={() => handleDelete(c.id, c.title)} disabled={deletingId === c.id}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50">
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════ EARNINGS TAB ══════════════ */}
      {tab === "earnings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Earnings",    value: `₦${totalEarnings.toLocaleString()}`,  desc: "All time" },
              { label: "Avg per Course",    value: courses.length ? `₦${Math.round(totalEarnings/courses.length).toLocaleString()}` : "—", desc: "Average" },
              { label: "Potential (100% enroll)", value: `₦${courses.reduce((a,c) => a + c.price, 0).toLocaleString()}`, desc: "If all courses fill" },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="font-heading font-bold text-2xl text-foreground">{loading ? "—" : s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/30">
              <h3 className="font-semibold text-sm text-foreground">Earnings per Course</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} h="h-10" />)}</div>
            ) : courses.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No courses yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-secondary/20 border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Course</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Price</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Students</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {[...courses].sort((a,b) => (b.price*b.enrolled) - (a.price*a.enrolled)).map(c => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground font-medium line-clamp-1 max-w-[180px]">{c.title}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {c.price === 0 ? "Free" : `₦${c.price.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.enrolled}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {c.price === 0
                          ? <span className="text-muted-foreground text-xs">—</span>
                          : `₦${(c.price * c.enrolled).toLocaleString()}`
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
