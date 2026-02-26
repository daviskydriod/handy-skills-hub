// File: src/pages/dashboard/InstructorDashboard.tsx
// Complete instructor portal — all sidebar pages in one file using tab routing.
// Course fields match DB: title, description, category_id, price, duration,
// lessons_count, thumbnail, is_published (always 0 — needs admin approval).

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, BookOpen, PlusCircle, Users, DollarSign,
  User, Trash2, Eye, EyeOff, Upload, X, Star, Edit2,
  RefreshCw, Search, Check, Clock, TrendingUp, Award,
  AlertCircle, ImageIcon, FileText, Settings, Bell,
  ChevronRight, Info, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  getCourses, createCourse, updateCourse,
  updateCourseWithFile, deleteCourse, type Course,
} from "@/api/courses";
import { getCategories, type Category } from "@/api/categories";

// ── Sidebar ────────────────────────────────────────────────────────────────────
const sidebarItems = [
  { label: "Dashboard",  to: "/dashboard/instructor",          icon: <LayoutDashboard size={18} /> },
  { label: "My Courses", to: "/dashboard/instructor/courses",  icon: <BookOpen size={18} /> },
  { label: "Add Course", to: "/dashboard/instructor/add",      icon: <PlusCircle size={18} /> },
  { label: "Students",   to: "/dashboard/instructor/students", icon: <Users size={18} /> },
  { label: "Earnings",   to: "/dashboard/instructor/earnings", icon: <DollarSign size={18} /> },
  { label: "Profile",    to: "/dashboard/instructor/profile",  icon: <User size={18} /> },
];

type TabType = "overview" | "courses" | "add" | "students" | "earnings" | "profile";

const Skeleton = ({ h = "h-8" }: { h?: string }) => (
  <div className={`${h} w-full rounded-xl bg-border/60 animate-pulse`} />
);

const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";
const NAVY  = "#0b1f3a";

// ── Empty form state ───────────────────────────────────────────────────────────
const emptyForm = {
  title: "", description: "", price: "", duration: "",
  lessons: "", catId: "", file: null as File | null,
  preview: null as string | null,
};

// ═════════════════════════════════════════════════════════════════════════════
export default function InstructorDashboard() {
  const { user } = useAuth();

  const [tab,        setTab]        = useState<TabType>("overview");
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQ,    setSearchQ]    = useState("");

  // Form state
  const [form, setForm] = useState(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  const setF = (key: keyof typeof emptyForm, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCourses({ limit: 100 });
      setCourses(res.courses.filter(c => c.instructor_id === user?.id));
    } catch {
      toast({ title: "Failed to load courses", variant: "destructive" });
    } finally { setLoading(false); }
  }, [user?.id]);

  const fetchCats = useCallback(async () => {
    try { setCategories(await getCategories()); } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchCourses();
    fetchCats();
  }, [user, fetchCourses, fetchCats]);

  // Re-fetch when tab becomes visible
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && user) fetchCourses();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user, fetchCourses]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalStudents = courses.reduce((a, c) => a + c.enrolled, 0);
  const totalEarnings = courses.reduce((a, c) => a + c.price * c.enrolled, 0);
  const avgRating     = courses.length
    ? (courses.reduce((a, c) => a + c.rating, 0) / courses.length).toFixed(1) : "—";
  const published     = courses.filter(c => c.is_published).length;
  const pending       = courses.filter(c => !c.is_published).length;

  // ── Start edit ─────────────────────────────────────────────────────────────
  const startEdit = (c: Course) => {
    setForm({
      title: c.title, description: c.description,
      price: String(c.price), duration: c.duration ?? "",
      lessons: String(c.lessons), catId: String(c.category_id ?? ""),
      file: null, preview: c.image,
    });
    setEditingId(c.id);
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        if (form.file) {
          const fd = new FormData();
          fd.append("title",        form.title);
          fd.append("description",  form.description);
          fd.append("price",        form.price || "0");
          fd.append("duration",     form.duration);
          fd.append("lessons_count",form.lessons || "0");
          fd.append("category_id",  form.catId);
          fd.append("is_published", "0"); // always needs re-approval after edit
          fd.append("thumbnail",    form.file);
          await updateCourseWithFile(editingId, fd);
        } else {
          await updateCourse(editingId, {
            title:         form.title,
            description:   form.description,
            price:         parseFloat(form.price || "0"),
            duration:      form.duration,
            lessons_count: parseInt(form.lessons || "0"),
            category_id:   form.catId || null,
            is_published:  0, // reset to pending on edit
          });
        }
        toast({ title: "Course updated — awaiting admin approval ✅" });
      } else {
        const fd = new FormData();
        fd.append("title",         form.title);
        fd.append("description",   form.description);
        fd.append("price",         form.price || "0");
        fd.append("duration",      form.duration);
        fd.append("lessons_count", form.lessons || "0");
        fd.append("category_id",   form.catId);
        fd.append("is_published",  "0"); // ✅ always 0 — admin must approve
        if (form.file) fd.append("thumbnail", form.file);
        await createCourse(fd);
        toast({ title: "Course submitted for admin approval 🎉" });
      }
      resetForm();
      fetchCourses();
      setTab("courses");
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Failed to save", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  // ── Toggle publish (instructor can unpublish, but re-publish needs admin) ──
  const togglePublish = async (c: Course) => {
    if (!c.is_published) {
      toast({ title: "Only admins can publish courses. Please contact admin.", variant: "destructive" });
      return;
    }
    try {
      await updateCourse(c.id, { is_published: 0 });
      setCourses(prev => prev.map(x => x.id === c.id ? { ...x, is_published: false } : x));
      toast({ title: "Course unpublished" });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
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

  // ── Shared input class ──────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors";

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout items={sidebarItems} title="Instructor Portal" userName={user?.name ?? "Instructor"}>

      {/* ── Tab nav (mirrors sidebar) ── */}
      <div className="flex gap-1 mb-6 bg-secondary/40 rounded-xl p-1 overflow-x-auto scrollbar-hide">
        {(["overview","courses","add","students","earnings","profile"] as TabType[]).map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === "add") resetForm(); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap capitalize transition-all ${
              tab === t
                ? "bg-card shadow text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {t === "add" ? (editingId ? "Edit Course" : "Add Course") : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW ══════════════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="space-y-6">

          {/* Welcome */}
          <div className="rounded-2xl p-5 text-white flex items-center justify-between"
            style={{ background: `linear-gradient(135deg,${NAVY},#0f2d56)` }}>
            <div>
              <h1 className="font-heading font-bold text-xl mb-1">
                Welcome, {user?.name?.split(" ")[0] ?? "Instructor"}! 👋
              </h1>
              <p className="text-sm opacity-75">Here's how your courses are performing.</p>
            </div>
            <button onClick={fetchCourses}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "My Courses",     value: courses.length,                       icon: BookOpen,   bg: "bg-yellow-500" },
              { label: "Total Students", value: totalStudents.toLocaleString(),        icon: Users,      bg: "bg-blue-500" },
              { label: "Total Earnings", value: `₦${totalEarnings.toLocaleString()}`,  icon: DollarSign, bg: "bg-emerald-500" },
              { label: "Avg Rating",     value: avgRating,                             icon: Star,       bg: "bg-purple-500" },
              { label: "Published",      value: published,                             icon: Eye,        bg: "bg-teal-500" },
              { label: "Pending Approval",value: pending,                              icon: Clock,      bg: "bg-orange-500" },
              { label: "Avg Students",   value: courses.length ? Math.round(totalStudents/courses.length) : 0, icon: TrendingUp, bg: "bg-indigo-500" },
              { label: "Categories",     value: new Set(courses.map(c => c.category)).size, icon: Award, bg: "bg-rose-500" },
            ].map(({ label, value, icon: Icon, bg }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                  <p className="font-heading font-bold text-lg text-foreground leading-none mt-0.5">
                    {loading ? "—" : value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Approval notice */}
          <div className="rounded-xl p-4 flex items-start gap-3 border"
            style={{ background: "rgba(234,179,8,0.06)", borderColor: "rgba(234,179,8,0.2)" }}>
            <ShieldCheck size={18} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Admin Approval Required</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                All new and edited courses are submitted as drafts. An admin must approve them before
                they appear publicly on the courses page. You'll see "Pending Approval" status until then.
              </p>
            </div>
          </div>

          {/* Recent courses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-sm text-foreground">Recent Courses</h2>
              <button onClick={() => setTab("courses")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ChevronRight size={12} />
              </button>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} h="h-14" />)}</div>
            ) : courses.length === 0 ? (
              <div className="bg-card border border-border rounded-xl py-12 text-center">
                <BookOpen size={28} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm mb-3">No courses yet.</p>
                <button onClick={() => { resetForm(); setTab("add"); }}
                  className="text-xs font-bold px-4 py-2 rounded-full text-black"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {courses.slice(0,5).map(c => (
                  <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                      {c.image
                        ? <img src={c.image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={13} className="text-muted-foreground" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground">{c.enrolled} students · ₦{c.price.toLocaleString()}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                      c.is_published
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {c.is_published ? "Live" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MY COURSES ════════════════════════════════════════════ */}
      {tab === "courses" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-base text-foreground">My Courses</h2>
            <button onClick={() => { resetForm(); setTab("add"); }}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-black"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <PlusCircle size={13} /> New Course
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Search courses…"
              className={`${inputCls} pl-9`} />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} h="h-16" />)}</div>
            ) : displayed.length === 0 ? (
              <div className="py-20 text-center">
                <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">
                  {courses.length === 0 ? "No courses yet." : "No results."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map(c => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                              {c.image
                                ? <img src={c.image} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={12} className="text-muted-foreground" /></div>
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm line-clamp-1 max-w-[140px]">{c.title}</p>
                              <p className="text-[10px] text-muted-foreground">{c.duration || "—"} · {c.lessons} lessons</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{c.category || "—"}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-sm">
                          {c.price === 0 ? <span className="text-emerald-600 text-xs font-bold">Free</span> : `₦${c.price.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{c.enrolled}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Star size={11} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{c.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            c.is_published
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>
                            {c.is_published ? "Live" : "Pending Approval"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {c.is_published && (
                              <button onClick={() => togglePublish(c)} title="Unpublish"
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                                <EyeOff size={14} className="text-muted-foreground" />
                              </button>
                            )}
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
        </div>
      )}

      {/* ══════════════ ADD / EDIT COURSE ════════════════════════════════════ */}
      {tab === "add" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-bold text-base text-foreground">
                {editingId ? "Edit Course" : "Create New Course"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editingId
                  ? "Changes will be submitted for admin review."
                  : "Your course will be reviewed by an admin before going live."}
              </p>
            </div>
            {editingId && (
              <button onClick={() => { resetForm(); setTab("courses"); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <X size={13} /> Cancel Edit
              </button>
            )}
          </div>

          {/* Approval notice banner */}
          <div className="mb-5 rounded-xl p-3.5 flex items-start gap-2.5 border"
            style={{ background: "rgba(234,179,8,0.05)", borderColor: "rgba(234,179,8,0.2)" }}>
            <Info size={14} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Admin approval required.</span>{" "}
              Your course will be saved as a draft and won't appear publicly until an admin reviews
              and approves it. You'll see it under "Pending Approval" in My Courses.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Course Title <span className="text-red-400">*</span>
              </label>
              <input value={form.title} onChange={e => setF("title", e.target.value)}
                required placeholder="e.g. Complete Digital Marketing Masterclass"
                className={inputCls} />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Description
              </label>
              <textarea value={form.description} onChange={e => setF("description", e.target.value)}
                rows={4} placeholder="What will students learn? What are the requirements? Who is this for?"
                className={`${inputCls} resize-none`} />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category</label>
                <select value={form.catId} onChange={e => setF("catId", e.target.value)}
                  className={inputCls}>
                  <option value="">Select category…</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Price (₦) — enter 0 for Free
                </label>
                <input value={form.price} onChange={e => setF("price", e.target.value)}
                  type="number" min="0" step="100" placeholder="e.g. 15000"
                  className={inputCls} />
              </div>
            </div>

            {/* Duration + Lessons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Duration</label>
                <input value={form.duration} onChange={e => setF("duration", e.target.value)}
                  placeholder="e.g. 4 weeks / 20 hours"
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Number of Lessons</label>
                <input value={form.lessons} onChange={e => setF("lessons", e.target.value)}
                  type="number" min="0" placeholder="e.g. 24"
                  className={inputCls} />
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Course Thumbnail
              </label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-yellow-400 hover:text-foreground transition-all">
                  <Upload size={14} />
                  {form.file ? "Change Image" : "Upload Thumbnail"}
                </button>
                {form.preview && (
                  <div className="relative">
                    <img src={form.preview} alt=""
                      className="w-20 h-20 rounded-xl object-cover border border-border" />
                    <button type="button"
                      onClick={() => setForm(p => ({ ...p, file: null, preview: null }))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow">
                      <X size={9} className="text-white" />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setForm(p => ({ ...p, file: f, preview: URL.createObjectURL(f) }));
                  }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Recommended: 1280×720px (16:9). JPG, PNG or WebP.
              </p>
            </div>

            {/* DB field reminder */}
            <div className="rounded-xl p-3.5 border border-border bg-secondary/30">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <FileText size={13} style={{ color: GOLD }} /> Course fields saved to database
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-muted-foreground">
                {["title","description","category_id","instructor_id","price","duration","lessons_count","thumbnail","is_published (0)","sponsored","rating","enrolled_count"].map(f => (
                  <span key={f} className="bg-background rounded-lg px-2 py-1 border border-border font-mono">{f}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}
                className="gap-2 border-0 text-black font-bold"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                {submitting
                  ? <><RefreshCw size={13} className="animate-spin" /> Saving…</>
                  : <><Check size={13} /> {editingId ? "Save & Submit for Review" : "Submit for Approval"}</>
                }
              </Button>
              <Button type="button" variant="outline"
                onClick={() => { resetForm(); setTab("courses"); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════ STUDENTS ══════════════════════════════════════════════ */}
      {tab === "students" && (
        <div>
          <h2 className="font-heading font-bold text-base text-foreground mb-4">Students Enrolled in My Courses</h2>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} h="h-12" />)}</div>
          ) : courses.length === 0 ? (
            <div className="bg-card border border-border rounded-xl py-16 text-center">
              <Users size={28} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No courses yet — create a course to see students.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[11px] text-muted-foreground">Total Students</p>
                  <p className="font-heading font-bold text-2xl text-foreground mt-1">{totalStudents}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[11px] text-muted-foreground">Courses with Students</p>
                  <p className="font-heading font-bold text-2xl text-foreground mt-1">
                    {courses.filter(c => c.enrolled > 0).length}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[11px] text-muted-foreground">Avg per Course</p>
                  <p className="font-heading font-bold text-2xl text-foreground mt-1">
                    {courses.length ? Math.round(totalStudents / courses.length) : 0}
                  </p>
                </div>
              </div>

              {/* Per-course breakdown */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/30">
                  <h3 className="font-semibold text-sm text-foreground">Enrollment by Course</h3>
                </div>
                <div className="divide-y divide-border">
                  {[...courses].sort((a,b) => b.enrolled - a.enrolled).map(c => (
                    <div key={c.id} className="px-4 py-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {c.image
                          ? <img src={c.image} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={12} className="text-muted-foreground" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-1.5 max-w-[120px]">
                            <div className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${totalStudents > 0 ? (c.enrolled / Math.max(...courses.map(x => x.enrolled))) * 100 : 0}%`,
                                background: `linear-gradient(90deg,${GOLD},${GOLD2})`
                              }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground">{c.enrolled} students</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                        c.is_published
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}>
                        {c.is_published ? "Live" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ EARNINGS ══════════════════════════════════════════════ */}
      {tab === "earnings" && (
        <div className="space-y-5">
          <h2 className="font-heading font-bold text-base text-foreground">Earnings Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Earned",        value: `₦${totalEarnings.toLocaleString()}`,  desc: "All time estimate" },
              { label: "Avg per Course",       value: courses.length ? `₦${Math.round(totalEarnings/courses.length).toLocaleString()}` : "—", desc: "Average revenue" },
              { label: "Highest Earning",      value: courses.length ? `₦${Math.max(...courses.map(c => c.price * c.enrolled)).toLocaleString()}` : "—", desc: "Best performer" },
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
              <h3 className="font-semibold text-sm text-foreground">Revenue per Course</h3>
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
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {[...courses].sort((a,b) => (b.price*b.enrolled)-(a.price*a.enrolled)).map(c => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground line-clamp-1 max-w-[180px]">{c.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{c.is_published ? "Live" : "Pending"}</p>
                      </td>
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

          <div className="rounded-xl p-4 border border-border bg-secondary/20">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle size={13} className="shrink-0 mt-0.5 text-yellow-500" />
              Earnings shown are estimates based on enrolled students × course price.
              Actual payouts depend on payment confirmations processed by admin.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════ PROFILE ══════════════════════════════════════════════ */}
      {tab === "profile" && (
        <div className="space-y-5 max-w-xl">
          <h2 className="font-heading font-bold text-base text-foreground">My Profile</h2>

          {/* Avatar + basic info */}
          <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-extrabold text-2xl shrink-0 text-black"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize"
                style={{ background: "rgba(234,179,8,0.12)", color: GOLD, border: "1px solid rgba(234,179,8,0.25)" }}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Courses",  value: courses.length },
              { label: "Students", value: totalStudents },
              { label: "Avg Rating", value: avgRating },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="font-heading font-bold text-xl text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Read-only fields */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm text-foreground">Account Details</h3>
            {[
              { label: "Full Name",  value: user?.name },
              { label: "Email",      value: user?.email },
              { label: "Role",       value: user?.role },
              { label: "Instructor ID", value: `#${user?.id}` },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[11px] text-muted-foreground mb-1">{f.label}</p>
                <p className="text-sm font-medium text-foreground bg-secondary rounded-lg px-3 py-2">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 border border-border bg-secondary/20">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Settings size={12} className="shrink-0 mt-0.5" />
              To update your name, email, or password, please contact an admin or use the
              account settings page.
            </p>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
