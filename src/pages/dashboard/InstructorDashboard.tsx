// File: src/pages/dashboard/InstructorDashboard.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, BookOpen, PlusCircle, Users, DollarSign,
  Trash2, EyeOff, Upload, X, Star, Edit2, RefreshCw, Search,
  Check, Clock, TrendingUp, AlertCircle, ShieldCheck, Bell,
  BarChart2, ChevronRight, Loader, Info, ChevronLeft,
  ChevronDown, PlayCircle, Plus, GripVertical, Film,
  FileText, Menu, LogOut,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpeg";
import {
  getCourses, createCourse, updateCourse,
  updateCourseWithFile, deleteCourse, type Course,
} from "@/api/courses";
import { getCategories, type Category } from "@/api/categories";

// ─── Theme ───────────────────────────────────────────────────────────
const TEAL   = "#0d9488";
const TEAL2  = "#0f766e";
const NAVY   = "#0b1f3a";
const SIDEBAR_W = 240;

// ─── Types ───────────────────────────────────────────────────────────
type TabType = "overview" | "courses" | "add" | "earnings";

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}
interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
interface Part {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyLesson  = (): Lesson  => ({ id: uid(), title: "", description: "", videoUrl: "", duration: "" });
const emptyModule  = (): Module  => ({ id: uid(), title: "", description: "", lessons: [emptyLesson()] });
const emptyPart    = (): Part    => ({ id: uid(), title: "", description: "", modules: [emptyModule()] });

const emptyForm = {
  title: "", description: "", price: "", duration: "",
  lessons: "", catId: "", file: null as File | null,
  preview: null as string | null,
  parts: [emptyPart()] as Part[],
};

// ─── Small helpers ────────────────────────────────────────────────────
function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|shorts\/))([^&?/\s]{11})/);
  return match ? match[1] : null;
}

const CourseThumb = ({ image, title, size = 44 }: { image?: string | null; title?: string; size?: number }) => {
  const cols = [TEAL, "#0891b2", "#7c3aed", "#db2777", "#d97706", "#16a34a"];
  const col  = cols[(title?.charCodeAt(0) ?? 0) % cols.length];
  return image ? (
    <img src={image} alt={title} style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 10, background: col + "18", border: `1px solid ${col}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <BookOpen size={Math.round(size * 0.38)} style={{ color: col }} />
    </div>
  );
};

const UserAvatar = ({ name, size = 34 }: { name?: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${TEAL},${NAVY})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: Math.round(size * 0.38), flexShrink: 0 }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

const StatusPill = ({ published }: { published: boolean }) => (
  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: published ? "#d1fae5" : "#fef3c7", color: published ? "#065f46" : "#92400e", border: `1px solid ${published ? "#a7f3d0" : "#fde68a"}`, whiteSpace: "nowrap" }}>
    {published ? "Live" : "Pending Approval"}
  </span>
);

const SkeletonRow = () => (
  <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#e8edf2", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 13, width: "60%", background: "#e8edf2", borderRadius: 6 }} />
      <div style={{ height: 10, width: "35%", background: "#f1f5f9", borderRadius: 6 }} />
    </div>
  </div>
);

// ─── Sidebar Nav Item ─────────────────────────────────────────────────
const NavItem = ({
  icon: Icon, label, active, onClick, badge, collapsed,
}: {
  icon: any; label: string; active: boolean; onClick: () => void;
  badge?: number; collapsed: boolean;
}) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    style={{
      width: "100%", display: "flex", alignItems: "center",
      gap: collapsed ? 0 : 10,
      justifyContent: collapsed ? "center" : "flex-start",
      padding: collapsed ? "11px 0" : "11px 16px",
      border: "none", borderRadius: 12, cursor: "pointer",
      fontFamily: "inherit", fontSize: 13, fontWeight: 600,
      transition: "all .18s",
      background: active ? TEAL : "transparent",
      color: active ? "#fff" : "#64748b",
      position: "relative",
    }}
  >
    <Icon size={16} />
    {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
    {!collapsed && badge != null && badge > 0 && (
      <span style={{ background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99 }}>{badge}</span>
    )}
    {collapsed && badge != null && badge > 0 && (
      <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />
    )}
  </button>
);

// ─── Main Dashboard ───────────────────────────────────────────────────
export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [tab,          setTab]          = useState<TabType>("overview");
  const [courses,      setCourses]      = useState<Course[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [deletingId,   setDeletingId]   = useState<number | null>(null);
  const [searchQ,      setSearchQ]      = useState("");
  const [form,         setForm]         = useState(emptyForm);

  // collapsed sections in Part→Module→Lesson builder
  const [collapsedParts,   setCollapsedParts]   = useState<Record<string, boolean>>({});
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const fileRef = useRef<HTMLInputElement>(null);

  const setF = (key: keyof typeof emptyForm, val: any) => setForm(p => ({ ...p, [key]: val }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setCollapsedParts({}); setCollapsedModules({}); };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCourses({ limit: 100 });
      setCourses(res.courses.filter((c: Course) => c.instructor_id === user?.id));
    } catch { toast({ title: "Failed to load courses", variant: "destructive" }); }
    finally { setLoading(false); }
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

  const totalStudents = courses.reduce((a, c) => a + c.enrolled, 0);
  const totalEarnings = courses.reduce((a, c) => a + c.price * c.enrolled, 0);
  const avgRating     = courses.length ? (courses.reduce((a, c) => a + c.rating, 0) / courses.length).toFixed(1) : "—";
  const published     = courses.filter(c => c.is_published).length;
  const pending       = courses.filter(c => !c.is_published).length;
  const displayed     = courses.filter(c =>
    c.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  // ── Part / Module / Lesson helpers ──────────────────────────────────
  const updatePart = (pid: string, data: Partial<Part>) =>
    setF("parts", form.parts.map(p => p.id === pid ? { ...p, ...data } : p));

  const addPart = () => setF("parts", [...form.parts, emptyPart()]);
  const removePart = (pid: string) => setF("parts", form.parts.filter(p => p.id !== pid));

  const addModule = (pid: string) =>
    updatePart(pid, { modules: [...form.parts.find(p => p.id === pid)!.modules, emptyModule()] });

  const removeModule = (pid: string, mid: string) =>
    updatePart(pid, { modules: form.parts.find(p => p.id === pid)!.modules.filter(m => m.id !== mid) });

  const updateModule = (pid: string, mid: string, data: Partial<Module>) =>
    updatePart(pid, {
      modules: form.parts.find(p => p.id === pid)!.modules.map(m => m.id === mid ? { ...m, ...data } : m),
    });

  const addLesson = (pid: string, mid: string) => {
    const part = form.parts.find(p => p.id === pid)!;
    const mod  = part.modules.find(m => m.id === mid)!;
    updateModule(pid, mid, { lessons: [...mod.lessons, emptyLesson()] });
  };

  const removeLesson = (pid: string, mid: string, lid: string) => {
    const part = form.parts.find(p => p.id === pid)!;
    const mod  = part.modules.find(m => m.id === mid)!;
    updateModule(pid, mid, { lessons: mod.lessons.filter(l => l.id !== lid) });
  };

  const updateLesson = (pid: string, mid: string, lid: string, data: Partial<Lesson>) => {
    const part = form.parts.find(p => p.id === pid)!;
    const mod  = part.modules.find(m => m.id === mid)!;
    updateModule(pid, mid, { lessons: mod.lessons.map(l => l.id === lid ? { ...l, ...data } : l) });
  };

  // ── Edit / Submit ────────────────────────────────────────────────────
  const startEdit = (c: Course) => {
    setForm({
      title: c.title, description: c.description, price: String(c.price),
      duration: c.duration ?? "", lessons: String(c.lessons),
      catId: String(c.category_id ?? ""), file: null, preview: c.image,
      parts: (c as any).content?.parts ?? [emptyPart()],
    });
    setEditingId(c.id); setTab("add");
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
          fd.append("is_published", "0"); fd.append("thumbnail", form.file);
          fd.append("content", contentJSON);
          await updateCourseWithFile(editingId, fd);
        } else {
          await updateCourse(editingId, {
            title: form.title, description: form.description,
            price: parseFloat(form.price || "0"), duration: form.duration,
            lessons_count: parseInt(form.lessons || "0"),
            category_id: form.catId || null, is_published: 0,
            content: contentJSON,
          });
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
      resetForm(); fetchCourses(); setTab("courses");
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Failed to save", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const togglePublish = async (c: Course) => {
    if (!c.is_published) { toast({ title: "Only admins can publish courses.", variant: "destructive" }); return; }
    try {
      await updateCourse(c.id, { is_published: 0 });
      setCourses(prev => prev.map(x => x.id === c.id ? { ...x, is_published: false } : x));
      toast({ title: "Course unpublished" });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

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

  const navItems: { key: TabType; label: string; icon: any; badge?: number }[] = [
    { key: "overview",  label: "Overview",    icon: LayoutDashboard },
    { key: "courses",   label: "My Courses",  icon: BookOpen, badge: pending },
    { key: "add",       label: editingId ? "Edit Course" : "Add Course", icon: PlusCircle },
    { key: "earnings",  label: "Earnings",    icon: DollarSign },
  ];

  // ── Sidebar width ────────────────────────────────────────────────────
  const SW = sidebarOpen ? SIDEBAR_W : 64;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#f6f8fb", display: "flex" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .inp{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:13px;font-family:inherit;color:${NAVY};outline:none;background:#fff;transition:border-color .2s;}
        .inp:focus{border-color:${TEAL};}
        .inp::placeholder{color:#94a3b8;}
        .card{background:#fff;border-radius:16px;border:1px solid #e8edf2;}
        .btnt{background:linear-gradient(135deg,${TEAL},${TEAL2});color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .2s;}
        .btnt:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(13,148,136,.28);}
        .btnt:disabled{opacity:.6;transform:none;}
        .icn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;transition:all .15s;flex-shrink:0;}
        .icn:hover{background:#f1f5f9;}
        .icn:disabled{opacity:.4;}
        .arow{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #f8fafc;transition:background .15s;}
        .arow:hover{background:#fafcff;}
        .arow:last-child{border-bottom:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .spin{animation:spin 1s linear infinite;}
        .sidebar{transition:width .22s cubic-bezier(.4,0,.2,1);overflow:hidden;flex-shrink:0;}
        .part-block{border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:16px;background:#fff;}
        .mod-block{border:1.5px solid #f1f5f9;border-radius:10px;overflow:hidden;margin-bottom:10px;background:#fafcff;}
        .lesson-block{background:#f8fafc;border-radius:8px;padding:12px 14px;margin-bottom:8px;border:1px solid #eef2f7;}
        .lesson-block:last-child{margin-bottom:0;}
        .sec-head{display:flex;align-items:center;gap:8px;padding:12px 14px;cursor:pointer;user-select:none;}
        .sec-head:hover{background:#f8fafc;}
        .add-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border:1.5px dashed #cbd5e1;border-radius:8px;background:none;cursor:pointer;font-size:12px;font-weight:600;color:#64748b;font-family:inherit;transition:all .15s;}
        .add-btn:hover{border-color:${TEAL};color:${TEAL};background:${TEAL}08;}
        @media(max-width:700px){.hide-sm{display:none!important;}.g4{grid-template-columns:repeat(2,1fr)!important;}.g3{grid-template-columns:1fr!important;}.fgrid{grid-template-columns:1fr!important;}}
        @media(min-width:701px){.g4{grid-template-columns:repeat(4,1fr);}.g3{grid-template-columns:repeat(3,1fr);}}
      `}</style>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="sidebar" style={{ width: SW, background: "#fff", borderRight: "1px solid #e8edf2", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", zIndex: 40 }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "18px 16px 14px" : "18px 0 14px", display: "flex", alignItems: "center", gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center", borderBottom: "1px solid #f1f5f9" }}>
        
            </div>
        
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {navItems.map(({ key, label, icon, badge }) => (
            <NavItem
              key={key}
              icon={icon}
              label={label}
              active={tab === key}
              badge={badge}
              collapsed={!sidebarOpen}
              onClick={() => { setTab(key as TabType); if (key === "add") resetForm(); }}
            />
          ))}
        </nav>

        {/* User + sign out */}
        <div style={{ borderTop: "1px solid #f1f5f9", padding: sidebarOpen ? "12px 16px" : "12px 0", display: "flex", alignItems: "center", gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center", flexWrap: "wrap" }}>
          <UserAvatar name={user?.name} size={32} />
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
              <button
                onClick={() => { logout(); navigate("/"); }}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#94a3b8", fontFamily: "inherit", padding: 0 }}
              >
                <LogOut size={11} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e8edf2", position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 20px", gap: 14 }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#64748b", display: "flex" }}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: NAVY }}>
              {tab === "overview"  ? `Welcome back, ${user?.name?.split(" ")[0] ?? "Instructor"} 👋`
               : tab === "courses" ? "My Courses"
               : tab === "add"     ? (editingId ? "Edit Course" : "Add Course")
               :                     "Earnings"}
            </h1>
          </div>
          <button onClick={() => { fetchCourses(); fetchCats(); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", border: "1px solid #e2e8f0", borderRadius: 99, background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b", fontFamily: "inherit" }}>
            <RefreshCw size={11} /> Refresh
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#64748b" }}><Bell size={17} /></button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "24px 20px", maxWidth: 1080, width: "100%", margin: "0 auto" }}>

          {/* ════ OVERVIEW ════ */}
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Stat cards */}
              <div style={{ display: "grid", gap: 12 }} className="g4">
                {[
                  { label: "My Courses",       value: loading ? "—" : courses.length,                                                    icon: BookOpen,    color: TEAL,      bg: TEAL + "15" },
                  { label: "Total Students",    value: loading ? "—" : totalStudents.toLocaleString(),                                    icon: Users,       color: "#3b82f6", bg: "#3b82f615" },
                  { label: "Est. Earnings",     value: loading ? "—" : `₦${totalEarnings.toLocaleString()}`,                             icon: DollarSign,  color: "#10b981", bg: "#10b98115" },
                  { label: "Avg Rating",        value: loading ? "—" : avgRating,                                                        icon: Star,        color: "#f59e0b", bg: "#f59e0b15" },
                  { label: "Published",         value: loading ? "—" : published,                                                        icon: TrendingUp,  color: "#22c55e", bg: "#22c55e15" },
                  { label: "Pending Approval",  value: loading ? "—" : pending,                                                          icon: Clock,       color: "#f97316", bg: "#f9731615" },
                  { label: "Avg Students",      value: loading ? "—" : courses.length ? Math.round(totalStudents / courses.length) : 0,  icon: BarChart2,   color: "#8b5cf6", bg: "#8b5cf615" },
                  { label: "Categories",        value: loading ? "—" : new Set(courses.map(c => c.category)).size,                       icon: ChevronRight, color: "#ec4899", bg: "#ec489915" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={17} style={{ color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: NAVY, lineHeight: 1.1 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Approval notice */}
              <div style={{ background: TEAL + "08", border: `1px solid ${TEAL}25`, borderRadius: 14, padding: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <ShieldCheck size={16} style={{ color: TEAL, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 2 }}>Admin Approval Required</p>
                  <p style={{ fontSize: 12, color: "#64748b" }}>All new and edited courses are saved as drafts and must be approved by an admin before going live.</p>
                </div>
              </div>

              {/* Recent courses grid */}
              {loading ? (
                <div className="card" style={{ overflow: "hidden" }}>{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
              ) : courses.length === 0 ? (
                <div className="card" style={{ padding: "56px 24px", textAlign: "center" }}>
                  <BookOpen size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
                  <p style={{ color: "#94a3b8", marginBottom: 16, fontSize: 14 }}>No courses yet.</p>
                  <button onClick={() => { resetForm(); setTab("add"); }} className="btnt" style={{ padding: "10px 24px", fontSize: 13 }}>
                    <PlusCircle size={14} /> Create First Course
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
                  {courses.slice(0, 6).map(c => (
                    <div key={c.id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <CourseThumb title={c.title} image={c.image} size={46} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{c.title}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>{c.enrolled} students · ₦{c.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <StatusPill published={!!c.is_published} />
                        <button onClick={() => startEdit(c)} className="icn"><Edit2 size={13} style={{ color: "#3b82f6" }} /></button>
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
                <button onClick={() => { resetForm(); setTab("add"); }} className="btnt" style={{ padding: "9px 18px", fontSize: 12 }}>
                  <PlusCircle size={13} /> New Course
                </button>
              </div>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input className="inp" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search courses…" style={{ paddingLeft: 36 }} />
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                {loading ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) :
                  displayed.length === 0 ? (
                    <div style={{ padding: "56px 24px", textAlign: "center" }}><p style={{ color: "#94a3b8" }}>{courses.length === 0 ? "No courses yet." : "No results."}</p></div>
                  ) : displayed.map(c => (
                    <div key={c.id} className="arow">
                      <CourseThumb title={c.title} image={c.image} size={46} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8" }}>{c.category || "—"} · {c.enrolled} students · ₦{c.price.toLocaleString()}</p>
                      </div>
                      <StatusPill published={!!c.is_published} />
                      <div style={{ display: "flex", gap: 4 }}>
                        {c.is_published && <button onClick={() => togglePublish(c)} className="icn" title="Unpublish"><EyeOff size={14} style={{ color: "#64748b" }} /></button>}
                        <button onClick={() => startEdit(c)} className="icn"><Edit2 size={14} style={{ color: "#3b82f6" }} /></button>
                        <button onClick={() => handleDelete(c.id, c.title)} disabled={deletingId === c.id} className="icn"><Trash2 size={14} style={{ color: "#ef4444" }} /></button>
                      </div>
                    </div>
                  ))}
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
                    {editingId ? "Changes require admin re-approval." : "Your course will be reviewed by an admin before going live."}
                  </p>
                </div>
                {editingId && (
                  <button onClick={() => { resetForm(); setTab("courses"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
                    <X size={13} /> Cancel
                  </button>
                )}
              </div>

              {/* Approval notice */}
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 12, display: "flex", gap: 8, marginBottom: 22 }}>
                <Info size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "#92400e" }}><strong>Admin approval required.</strong> Course will be saved as a draft and won't appear publicly until approved.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

                {/* ── BASIC INFO ── */}
                <section className="card" style={{ padding: 20 }}>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: NAVY, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                    📋 Basic Information
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Course Title <span style={{ color: "#ef4444" }}>*</span></label>
                      <input className="inp" value={form.title} onChange={e => setF("title", e.target.value)} required placeholder="e.g. Complete Digital Marketing Masterclass" />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Description</label>
                      <textarea className="inp" value={form.description} onChange={e => setF("description", e.target.value)} rows={4} placeholder="What will students learn? Who is this course for?" style={{ resize: "vertical" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="fgrid">
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Category</label>
                        <select className="inp" value={form.catId} onChange={e => setF("catId", e.target.value)}>
                          <option value="">Select category…</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Price (₦) — 0 for Free</label>
                        <input className="inp" type="number" min="0" step="100" value={form.price} onChange={e => setF("price", e.target.value)} placeholder="e.g. 15000" />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="fgrid">
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Duration</label>
                        <input className="inp" value={form.duration} onChange={e => setF("duration", e.target.value)} placeholder="e.g. 4 weeks / 20 hours" />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Lessons Count</label>
                        <input className="inp" type="number" min="0" value={form.lessons} onChange={e => setF("lessons", e.target.value)} placeholder="e.g. 24" />
                      </div>
                    </div>
                    {/* Thumbnail */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Course Thumbnail</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", border: "1.5px dashed #cbd5e1", borderRadius: 12, background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748b", fontFamily: "inherit" }}>
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
                          onChange={e => { const f = e.target.files?.[0]; if (f) setForm(p => ({ ...p, file: f, preview: URL.createObjectURL(f) })); }} />
                      </div>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Recommended: 1280×720px · JPG, PNG or WebP</p>
                    </div>
                  </div>
                </section>

                {/* ── COURSE CONTENT: Parts → Modules → Lessons ── */}
                <section>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: NAVY }}>📚 Course Content</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Structure: Parts → Modules → Lessons</p>
                    </div>
                    <button type="button" onClick={addPart} className="add-btn">
                      <Plus size={13} /> Add Part
                    </button>
                  </div>

                  {form.parts.map((part, pi) => {
                    const partCollapsed = collapsedParts[part.id];
                    const totalLessons = part.modules.reduce((a, m) => a + m.lessons.length, 0);
                    return (
                      <div key={part.id} className="part-block">
                        {/* Part header */}
                        <div
                          className="sec-head"
                          style={{ background: NAVY + "06", borderBottom: partCollapsed ? "none" : "1px solid #e8edf2" }}
                          onClick={() => setCollapsedParts(p => ({ ...p, [part.id]: !p[part.id] }))}
                        >
                          <GripVertical size={14} style={{ color: "#cbd5e1" }} />
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{pi + 1}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{part.title || `Part ${pi + 1}`}</p>
                            <p style={{ fontSize: 11, color: "#94a3b8" }}>{part.modules.length} module{part.modules.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}</p>
                          </div>
                          <ChevronDown size={14} style={{ color: "#94a3b8", transform: partCollapsed ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                          {form.parts.length > 1 && (
                            <button type="button" onClick={e => { e.stopPropagation(); removePart(part.id); }} className="icn">
                              <X size={13} style={{ color: "#ef4444" }} />
                            </button>
                          )}
                        </div>

                        {!partCollapsed && (
                          <div style={{ padding: 16 }}>
                            {/* Part fields */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }} className="fgrid">
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 5, display: "block" }}>Part Title</label>
                                <input className="inp" value={part.title} onChange={e => updatePart(part.id, { title: e.target.value })} placeholder={`e.g. Part ${pi + 1}: Introduction`} style={{ fontSize: 12 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 5, display: "block" }}>Part Description</label>
                                <input className="inp" value={part.description} onChange={e => updatePart(part.id, { description: e.target.value })} placeholder="Brief overview of this part…" style={{ fontSize: 12 }} />
                              </div>
                            </div>

                            {/* Modules */}
                            {part.modules.map((mod, mi) => {
                              const modKey = `${part.id}-${mod.id}`;
                              const modCollapsed = collapsedModules[modKey];
                              return (
                                <div key={mod.id} className="mod-block">
                                  {/* Module header */}
                                  <div
                                    className="sec-head"
                                    style={{ borderBottom: modCollapsed ? "none" : "1px solid #e8edf2" }}
                                    onClick={() => setCollapsedModules(p => ({ ...p, [modKey]: !p[modKey] }))}
                                  >
                                    <div style={{ width: 20, height: 20, borderRadius: 5, background: TEAL + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <span style={{ fontSize: 9, fontWeight: 800, color: TEAL }}>{mi + 1}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontWeight: 700, fontSize: 12, color: NAVY }}>{mod.title || `Module ${mi + 1}`}</p>
                                      <p style={{ fontSize: 10, color: "#94a3b8" }}>{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</p>
                                    </div>
                                    <ChevronDown size={13} style={{ color: "#94a3b8", transform: modCollapsed ? "rotate(-90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                                    {part.modules.length > 1 && (
                                      <button type="button" onClick={e => { e.stopPropagation(); removeModule(part.id, mod.id); }} className="icn">
                                        <X size={12} style={{ color: "#ef4444" }} />
                                      </button>
                                    )}
                                  </div>

                                  {!modCollapsed && (
                                    <div style={{ padding: 14 }}>
                                      {/* Module fields */}
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }} className="fgrid">
                                        <div>
                                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>Module Title</label>
                                          <input className="inp" value={mod.title} onChange={e => updateModule(part.id, mod.id, { title: e.target.value })} placeholder={`Module ${mi + 1} title`} style={{ fontSize: 12 }} />
                                        </div>
                                        <div>
                                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>Module Description</label>
                                          <input className="inp" value={mod.description} onChange={e => updateModule(part.id, mod.id, { description: e.target.value })} placeholder="What's covered in this module…" style={{ fontSize: 12 }} />
                                        </div>
                                      </div>

                                      {/* Lessons */}
                                      {mod.lessons.map((lesson, li) => {
                                        const ytId = getYouTubeId(lesson.videoUrl);
                                        return (
                                          <div key={lesson.id} className="lesson-block">
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <PlayCircle size={13} style={{ color: TEAL }} />
                                                <span style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>Lesson {li + 1}</span>
                                              </div>
                                              {mod.lessons.length > 1 && (
                                                <button type="button" onClick={() => removeLesson(part.id, mod.id, lesson.id)} className="icn">
                                                  <X size={12} style={{ color: "#ef4444" }} />
                                                </button>
                                              )}
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }} className="fgrid">
                                              <div>
                                                <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                                  <FileText size={10} /> Lesson Title
                                                </label>
                                                <input className="inp" value={lesson.title} onChange={e => updateLesson(part.id, mod.id, lesson.id, { title: e.target.value })} placeholder="e.g. Introduction to Variables" style={{ fontSize: 12 }} />
                                              </div>
                                              <div>
                                                <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                                  <Clock size={10} /> Duration
                                                </label>
                                                <input className="inp" value={lesson.duration} onChange={e => updateLesson(part.id, mod.id, lesson.id, { duration: e.target.value })} placeholder="e.g. 12 mins" style={{ fontSize: 12 }} />
                                              </div>
                                            </div>

                                            <div style={{ marginBottom: 8 }}>
                                              <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                                <Film size={10} /> YouTube Video URL
                                              </label>
                                              <input className="inp" value={lesson.videoUrl} onChange={e => updateLesson(part.id, mod.id, lesson.id, { videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." style={{ fontSize: 12 }} />
                                            </div>

                                            {/* YouTube preview */}
                                            {ytId && (
                                              <div style={{ borderRadius: 8, overflow: "hidden", marginBottom: 8, border: "1px solid #e2e8f0" }}>
                                                <iframe
                                                  src={`https://www.youtube.com/embed/${ytId}`}
                                                  style={{ width: "100%", height: 160, border: "none", display: "block" }}
                                                  allowFullScreen
                                                  title={lesson.title || "Lesson video"}
                                                />
                                              </div>
                                            )}

                                            <div>
                                              <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                                <FileText size={10} /> Lesson Description
                                              </label>
                                              <textarea className="inp" value={lesson.description} onChange={e => updateLesson(part.id, mod.id, lesson.id, { description: e.target.value })} rows={2} placeholder="What will students learn in this lesson?" style={{ fontSize: 12, resize: "vertical" }} />
                                            </div>
                                          </div>
                                        );
                                      })}

                                      {/* Add lesson */}
                                      <button type="button" onClick={() => addLesson(part.id, mod.id)} className="add-btn" style={{ marginTop: 6 }}>
                                        <Plus size={12} /> Add Lesson
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Add module */}
                            <button type="button" onClick={() => addModule(part.id)} className="add-btn" style={{ marginTop: 4 }}>
                              <Plus size={12} /> Add Module
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add part */}
                  <button type="button" onClick={addPart} className="add-btn" style={{ width: "100%", justifyContent: "center", padding: "11px 0" }}>
                    <Plus size={13} /> Add Another Part
                  </button>
                </section>

                {/* Submit */}
                <div style={{ display: "flex", gap: 10, paddingTop: 4, flexWrap: "wrap" }}>
                  <button type="submit" disabled={submitting} className="btnt" style={{ padding: "11px 24px", fontSize: 13 }}>
                    {submitting ? <><Loader size={13} className="spin" /> Saving…</> : <><Check size={13} /> {editingId ? "Save & Submit for Review" : "Submit for Approval"}</>}
                  </button>
                  <button type="button" onClick={() => { resetForm(); setTab("courses"); }} style={{ padding: "11px 20px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, color: "#64748b" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════ EARNINGS ════ */}
          {tab === "earnings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gap: 12 }} className="g3">
                {[
                  { label: "Total Earned",   value: `₦${totalEarnings.toLocaleString()}`,                                                              desc: "All time estimate" },
                  { label: "Avg per Course", value: courses.length ? `₦${Math.round(totalEarnings / courses.length).toLocaleString()}` : "—",         desc: "Average revenue" },
                  { label: "Best Performer", value: courses.length ? `₦${Math.max(...courses.map(c => c.price * c.enrolled)).toLocaleString()}` : "—", desc: "Highest earning" },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: 20 }}>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{s.label}</p>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: NAVY, marginBottom: 4 }}>{loading ? "—" : s.value}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>Revenue per Course</h3>
                </div>
                {loading ? [1, 2, 3].map(i => <SkeletonRow key={i} />) :
                  courses.length === 0 ? <div style={{ padding: "48px 24px", textAlign: "center" }}><p style={{ color: "#94a3b8" }}>No courses yet.</p></div> :
                    [...courses].sort((a, b) => (b.price * b.enrolled) - (a.price * a.enrolled)).map((c, i, arr) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none" }}>
                        <CourseThumb title={c.title} image={c.image} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>{c.enrolled} students · {c.is_published ? "Live" : "Pending"}</p>
                        </div>
                        <p style={{ fontWeight: 800, fontSize: 15, color: NAVY, flexShrink: 0 }}>
                          {c.price === 0 ? <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 13 }}>Free</span> : `₦${(c.price * c.enrolled).toLocaleString()}`}
                        </p>
                      </div>
                    ))}
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 12, display: "flex", gap: 8 }}>
                <AlertCircle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "#92400e" }}>Earnings are estimates. Actual payouts depend on admin-confirmed bank transfer payments.</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
