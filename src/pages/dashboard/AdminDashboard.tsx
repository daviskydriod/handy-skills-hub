// File: src/pages/dashboard/AdminDashboard.tsx
// ── Uses shared: DashboardLayout, StatCard, CourseThumb, SkeletonRow,
//                CourseStatusBadge, StatusBadge, RoleBadge, Avatar,
//                ContentBuilder, ContentViewer
// ── Theme: NAVY/GOLD (canonical source)
// ── Mobile: Student-approved mobile layout via DashboardLayout

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, BookOpen, Users, DollarSign, ShieldCheck,
  CheckCircle, XCircle, Clock, Eye, Trash2, Edit2, PlusCircle,
  Search, RefreshCw, Star, Upload, X, Check, Loader,
  ChevronLeft, Bell, EyeOff, UserCheck, UserX, BadgeCheck, Ban,
  CreditCard, ExternalLink, FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getCourses, createCourse, updateCourse,
  updateCourseWithFile, deleteCourse, type Course,
} from "@/api/courses";
import { getCategories, type Category } from "@/api/categories";
import client from "@/api/client";

import { DashboardLayout, useMobile } from "../../components/layout/DashboardLayout";
import {
  StatCard, CourseThumb, SkeletonRow,
  CourseStatusBadge, StatusBadge, RoleBadge, Avatar,
} from "../../components/shared/UIAtoms";
import {
  ContentBuilder, ContentViewer,
  parseCourseContent, mkPart, type Part,
} from "../../components/course/ContentBuilder";
import { NAVY, GOLD, GOLD2 } from "../../theme";

// ── Types ──────────────────────────────────────────────────────────────
type TabType = "overview" | "courses" | "add" | "users" | "payments";

interface AdminUser {
  id: number; name: string; email: string;
  role: "student" | "instructor" | "admin";
  is_active: number; created_at: string;
  phone?: string; enrollments_count?: number;
}

interface Payment {
  id: number; user_id: number; course_id: number;
  amount: number; status: "pending" | "approved" | "rejected";
  payment_method?: string; reference?: string;
  proof?: string; proof_image?: string;
  created_at: string; updated_at?: string;
  user?: { name: string; email: string };
  course?: { title: string; image?: string };
  user_name?: string; user_email?: string;
  course_title?: string; course_image?: string;
}

const makeEmptyForm = () => ({
  title: "", description: "", price: "", duration: "",
  lessons: "", catId: "", file: null as File | null,
  preview: null as string | null, parts: [mkPart()] as Part[],
});

const fmt = (n: number) => `₦${(n ?? 0).toLocaleString()}`;

function getProofUrl(p: Payment): string | null {
  return p.proof_image ?? p.proof ?? null;
}

const normalizeCourse = (c: any): Course => ({
  ...c,
  is_published: Number(c.is_published) === 1,
  enrolled:     c.enrolled     ?? c.enrolled_count     ?? c.enrollments_count ?? 0,
  lessons:      c.lessons      ?? c.lessons_count      ?? 0,
  rating:       c.rating       ?? c.average_rating     ?? 0,
  content:      c.content,
  // Resolve creator name from whichever field the API returns
  instructor:   c.instructor   ?? c.instructor_name    ?? c.creator_name
                ?? c.created_by_name ?? c.user_name    ?? c.author
                ?? c.user?.name ?? null,
});

// Payment status badge (separate from generic StatusBadge for consistency)
const PayBadge = ({ status }: { status: string }) => {
  const m: Record<string, [string, string, string]> = {
    approved: ["#d1fae5", "#065f46", "#a7f3d0"],
    pending:  ["#fef3c7", "#92400e", "#fde68a"],
    rejected: ["#fee2e2", "#991b1b", "#fecaca"],
  };
  const [bg, color, border] = m[status] ?? m.pending;
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap", background: bg, color, border: `1px solid ${border}` }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const mobile   = useMobile();

  const [tab,          setTab]          = useState<TabType>("overview");
  const [courses,      setCourses]      = useState<Course[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [editId,       setEditId]       = useState<number | null>(null);
  const [delId,        setDelId]        = useState<number | null>(null);
  const [searchQ,      setSearchQ]      = useState("");
  const [form,         setForm]         = useState(makeEmptyForm);
  const [viewCourse,   setViewCourse]   = useState<Course | null>(null);
  const [statusF,      setStatusF]      = useState<"all" | "pending" | "live">("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [usersLoad,    setUsersLoad]    = useState(false);
  const [userQ,        setUserQ]        = useState("");
  const [roleFilter,   setRoleFilter]   = useState<"all" | "student" | "instructor" | "admin">("all");
  const [viewUser,     setViewUser]     = useState<AdminUser | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);

  const [payments,     setPayments]     = useState<Payment[]>([]);
  const [payLoad,      setPayLoad]      = useState(false);
  const [payFilter,    setPayFilter]    = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [payQ,         setPayQ]         = useState("");
  const [viewPayment,  setViewPayment]  = useState<Payment | null>(null);
  const [payActing,    setPayActing]    = useState<number | null>(null);

  const sf = (k: keyof ReturnType<typeof makeEmptyForm>, v: any) => setForm(p => ({ ...p, [k]: v }));
  const resetForm = () => { setForm(makeEmptyForm()); setEditId(null); };

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getCourses({ limit: 200, admin: true });
      const raw = r.courses ?? r.data ?? r ?? [];
      setCourses(Array.isArray(raw) ? raw.map(normalizeCourse) : []);
    } catch { toast({ title: "Failed to load courses", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoad(true);
    try {
      const r = await client.get("/users");
      const raw = r.data?.users ?? r.data?.data ?? r.data ?? [];
      setUsers(Array.isArray(raw) ? raw : []);
    } catch { toast({ title: "Failed to load users", variant: "destructive" }); }
    finally { setUsersLoad(false); }
  }, []);

  const loadPayments = useCallback(async () => {
    setPayLoad(true);
    try {
      const r = await client.get("/payments");
      const raw = r.data?.payments ?? r.data?.data ?? r.data ?? [];
      setPayments(Array.isArray(raw) ? raw : []);
    } catch { toast({ title: "Failed to load payments", variant: "destructive" }); }
    finally { setPayLoad(false); }
  }, []);

  const loadCats = useCallback(async () => {
    try { setCategories(await getCategories()); } catch {}
  }, []);

  useEffect(() => { loadCourses(); loadCats(); }, [loadCourses, loadCats]);
  useEffect(() => { if (tab === "users") loadUsers(); }, [tab, loadUsers]);
  useEffect(() => { if (tab === "payments") loadPayments(); }, [tab, loadPayments]);

  const pending    = courses.filter(c => !c.is_published).length;
  const live       = courses.filter(c => c.is_published).length;
  const totalEnrl  = courses.reduce((a, c) => a + (c.enrolled ?? 0), 0);
  const totalRev   = courses.reduce((a, c) => a + ((c.price ?? 0) * (c.enrolled ?? 0)), 0);
  const avgRating  = courses.length ? (courses.reduce((a, c) => a + (c.rating ?? 0), 0) / courses.length).toFixed(1) : "—";
  const pendingPay = payments.filter(p => p.status === "pending").length;

  const shownCourses = courses.filter(c => {
    const q = (c.title ?? "").toLowerCase().includes(searchQ.toLowerCase()) || (c.category ?? "").toLowerCase().includes(searchQ.toLowerCase());
    const s = statusF === "all" || (statusF === "live" ? !!c.is_published : !c.is_published);
    return q && s;
  });
  const shownUsers = users.filter(u => {
    const q = (u.name ?? "").toLowerCase().includes(userQ.toLowerCase()) || (u.email ?? "").toLowerCase().includes(userQ.toLowerCase());
    const r = roleFilter === "all" || u.role === roleFilter;
    return q && r;
  });
  const shownPayments = payments.filter(p => {
    const name  = p.user?.name  ?? p.user_name  ?? "";
    const title = p.course?.title ?? p.course_title ?? "";
    const q = name.toLowerCase().includes(payQ.toLowerCase()) || title.toLowerCase().includes(payQ.toLowerCase()) || (p.reference ?? "").toLowerCase().includes(payQ.toLowerCase());
    const s = payFilter === "all" || p.status === payFilter;
    return q && s;
  });

  // ── Course actions ─────────────────────────────────────────────────
  const approve = async (c: Course) => {
    try {
      await updateCourse(c.id, { is_published: 1 });
      const u = normalizeCourse({ ...c, is_published: 1 });
      setCourses(p => p.map(x => x.id === c.id ? u : x));
      if (viewCourse?.id === c.id) setViewCourse(u);
      toast({ title: `"${c.title}" is now live ✅` });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };
  const unpublish = async (c: Course) => {
    try {
      await updateCourse(c.id, { is_published: 0 });
      const u = normalizeCourse({ ...c, is_published: 0 });
      setCourses(p => p.map(x => x.id === c.id ? u : x));
      if (viewCourse?.id === c.id) setViewCourse(u);
      toast({ title: "Course unpublished" });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDelId(id);
    try {
      await deleteCourse(id);
      setCourses(p => p.filter(c => c.id !== id));
      if (viewCourse?.id === id) setViewCourse(null);
      toast({ title: "Course deleted" });
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
    finally { setDelId(null); }
  };
  const startEdit = (c: Course) => {
    const parsed = parseCourseContent(c.content);
    setForm({
      title: c.title ?? "", description: c.description ?? "",
      price: String(c.price ?? ""), duration: c.duration ?? "",
      lessons: String((c as any).lessons_count ?? c.lessons ?? ""),
      catId: String(c.category_id ?? ""), file: null, preview: c.image ?? null,
      parts: parsed?.parts?.length ? parsed.parts : [mkPart()],
    });
    setEditId(c.id); setViewCourse(null); setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Payment actions ─────────────────────────────────────────────────
  const handlePayment = async (payment: Payment, action: "approved" | "rejected") => {
    setPayActing(payment.id);
    try {
      await client.put(`/payments/${payment.id}`, { status: action });
      const updated = { ...payment, status: action as Payment["status"] };
      setPayments(p => p.map(x => x.id === payment.id ? updated : x));
      if (viewPayment?.id === payment.id) setViewPayment(updated);
      toast({ title: action === "approved" ? "Payment approved ✅" : "Payment rejected ❌" });
    } catch (err: any) {
      toast({ title: "Action failed", description: err?.response?.data?.error ?? "Could not update payment status", variant: "destructive" });
    } finally { setPayActing(null); }
  };

  // ── User actions ─────────────────────────────────────────────────
  const handleUpdateRole = async (u: AdminUser, role: "student" | "instructor" | "admin") => {
    setRoleUpdating(u.id);
    try {
      await client.put(`/users/${u.id}`, { role });
      const updated = { ...u, role };
      setUsers(p => p.map(x => x.id === u.id ? updated : x));
      if (viewUser?.id === u.id) setViewUser(updated);
      toast({ title: `Role updated to ${role}` });
    } catch { toast({ title: "Failed to update role", variant: "destructive" }); }
    finally { setRoleUpdating(null); }
  };
  const handleToggleActive = async (u: AdminUser) => {
    const newVal = u.is_active ? 0 : 1;
    try {
      await client.put(`/users/${u.id}`, { is_active: newVal });
      const updated = { ...u, is_active: newVal };
      setUsers(p => p.map(x => x.id === u.id ? updated : x));
      if (viewUser?.id === u.id) setViewUser(updated);
      toast({ title: newVal ? "User activated" : "User deactivated" });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };
  const handleDeleteUser = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    setDeletingUser(u.id);
    try {
      await client.delete(`/users/${u.id}`);
      setUsers(p => p.filter(x => x.id !== u.id));
      if (viewUser?.id === u.id) setViewUser(null);
      toast({ title: "User deleted" });
    } catch { toast({ title: "Failed to delete user", variant: "destructive" }); }
    finally { setDeletingUser(null); }
  };

  // ── Submit course ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    const contentJSON = JSON.stringify({ parts: form.parts });
    try {
      if (editId) {
        if (form.file) {
          const fd = new FormData();
          fd.append("title", form.title); fd.append("description", form.description);
          fd.append("price", form.price || "0"); fd.append("duration", form.duration);
          fd.append("lessons_count", form.lessons || "0"); fd.append("category_id", form.catId);
          fd.append("is_published", "1"); fd.append("thumbnail", form.file); fd.append("content", contentJSON);
          await updateCourseWithFile(editId, fd);
        } else {
          await updateCourse(editId, { title: form.title, description: form.description, price: parseFloat(form.price || "0"), duration: form.duration, lessons_count: parseInt(form.lessons || "0"), category_id: form.catId || null, is_published: 1, content: contentJSON });
        }
        toast({ title: "Course updated & published ✅" });
      } else {
        const fd = new FormData();
        fd.append("title", form.title); fd.append("description", form.description);
        fd.append("price", form.price || "0"); fd.append("duration", form.duration);
        fd.append("lessons_count", form.lessons || "0"); fd.append("category_id", form.catId);
        fd.append("is_published", "1"); fd.append("content", contentJSON);
        if (form.file) fd.append("thumbnail", form.file);
        await createCourse(fd);
        toast({ title: "Course created & published 🎉" });
      }
      resetForm(); loadCourses(); setTab("courses");
    } catch (err: any) {
      toast({ title: err?.response?.data?.error ?? "Failed to save", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const navItems = [
    { key: "overview",  label: "Overview",        icon: LayoutDashboard, badge: 0         },
    { key: "courses",   label: "All Courses",      icon: BookOpen,        badge: pending   },
    { key: "add",       label: editId ? "Edit Course" : "Add Course", icon: PlusCircle, badge: 0 },
    { key: "users",     label: "Users",            icon: Users,           badge: 0         },
    { key: "payments",  label: "Payments",         icon: DollarSign,      badge: pendingPay },
  ];

  const pageTitle = (() => {
    if (tab === "overview")  return "Admin Dashboard 👑";
    if (tab === "courses")   return viewCourse ? `Course: ${viewCourse.title}` : "Course Management";
    if (tab === "add")       return editId ? "Edit Course" : "Create New Course";
    if (tab === "users")     return viewUser ? `User: ${viewUser.name}` : "User Management";
    if (tab === "payments")  return viewPayment ? `Payment #${viewPayment.id}` : "Payment Management";
    return "";
  })();

  const mobileSubtitle = { overview: "Admin Panel 👑", courses: "Courses", add: "Course Builder", users: "Users", payments: "Payments" }[tab] ?? "";
  const mobileTitle    = { overview: user?.name?.split(" ")[0] ?? "Admin", courses: `${courses.length} courses`, add: editId ? "Editing" : "New Course", users: `${users.length} users`, payments: `${payments.length} records` }[tab] ?? "";

  const alertChips = [
    ...(pending > 0 ? [{
      label: `${pending} pending`, bg: "#fef3c7", color: "#92400e", border: "#fde68a", icon: Clock,
      onClick: () => { setTab("courses"); setStatusF("pending"); setViewCourse(null); },
    }] : []),
    ...(pendingPay > 0 ? [{
      label: `${pendingPay} payments`, bg: "#fce7f3", color: "#9d174d", border: "#fbcfe8", icon: CreditCard,
      onClick: () => { setTab("payments"); setPayFilter("pending"); setViewPayment(null); },
    }] : []),
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      activeTab={tab}
      onTabChange={key => {
        setTab(key as TabType);
        if (key === "add" && !editId) resetForm();
        if (key !== "add" && key !== "courses") setViewCourse(null);
        if (key !== "users") setViewUser(null);
        if (key !== "payments") setViewPayment(null);
      }}
      pageTitle={pageTitle}
      mobileSubtitle={mobileSubtitle}
      mobileTitleText={mobileTitle}
      user={user}
      onLogout={() => { logout(); navigate("/"); }}
      onRefresh={() => { loadCourses(); loadCats(); if (tab === "users") loadUsers(); if (tab === "payments") loadPayments(); }}
      alertChips={alertChips}
      hasMobileBadge={(pending + pendingPay) > 0}
      sidebarWidth={250}
    >

      {/* ═══ OVERVIEW ═══ */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gap: 12 }} className="g4">
            <StatCard label="Total Courses"    value={loading ? "—" : courses.length}            icon={BookOpen}    color={NAVY}    bg={NAVY + "12"} />
            <StatCard label="Live Courses"     value={loading ? "—" : live}                      icon={CheckCircle} color="#22c55e" bg="#22c55e12"    />
            <StatCard label="Pending Courses"  value={loading ? "—" : pending}                   icon={Clock}       color="#f59e0b" bg="#f59e0b12"    />
            <StatCard label="Total Students"   value={loading ? "—" : totalEnrl.toLocaleString()} icon={Users}      color="#3b82f6" bg="#3b82f612"    />
            <StatCard label="Est. Revenue"     value={loading ? "—" : fmt(totalRev)}              icon={DollarSign} color="#10b981" bg="#10b98112"    />
            <StatCard label="Avg Rating"       value={loading ? "—" : avgRating}                  icon={Star}       color={GOLD2}   bg={GOLD + "15"} />
            <StatCard label="Pending Payments" value={payLoad ? "—" : pendingPay}                 icon={CreditCard} color="#ec4899" bg="#ec489912"    />
            <StatCard label="Registered Users" value={usersLoad ? "—" : (users.length || "—")}    icon={UserCheck}  color="#8b5cf6" bg="#8b5cf612"    />
          </div>

          {pending > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: NAVY }}>⏳ Courses Awaiting Approval ({pending})</h3>
                <button onClick={() => { setTab("courses"); setStatusF("pending"); }} style={{ fontSize: 12, fontWeight: 700, color: GOLD2, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
              </div>
              <div className="dash-card" style={{ overflow: "hidden" }}>
                {courses.filter(c => !c.is_published).slice(0, 5).map(c => (
                  <div key={c.id} className="dash-row">
                    <CourseThumb title={c.title} image={c.image} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>by {c.instructor || "—"} · {c.category || "—"} · {fmt(c.price ?? 0)}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setViewCourse(c); setTab("courses"); }} className="btn-icon"><Eye size={14} style={{ color: "#3b82f6" }} /></button>
                      <button onClick={() => approve(c)} className="btn-green"><CheckCircle size={12} /> Approve</button>
                      <button onClick={() => handleDelete(c.id, c.title)} className="btn-red"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingPay > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: NAVY }}>💳 Payments Awaiting Approval ({pendingPay})</h3>
                <button onClick={() => { setTab("payments"); setPayFilter("pending"); }} style={{ fontSize: 12, fontWeight: 700, color: GOLD2, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
              </div>
              <div className="dash-card" style={{ overflow: "hidden" }}>
                {payments.filter(p => p.status === "pending").slice(0, 5).map(p => (
                  <div key={p.id} className="dash-row">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CreditCard size={16} style={{ color: "#d97706" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{p.user?.name ?? p.user_name ?? `User #${p.user_id}`}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.course?.title ?? p.course_title ?? `Course #${p.course_id}`} · {fmt(p.amount)}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setViewPayment(p); setTab("payments"); }} className="btn-icon"><Eye size={14} style={{ color: "#3b82f6" }} /></button>
                      <button onClick={() => handlePayment(p, "approved")} disabled={payActing === p.id} className="btn-green"><CheckCircle size={12} /> Approve</button>
                      <button onClick={() => handlePayment(p, "rejected")} disabled={payActing === p.id} className="btn-red"><XCircle size={12} /> Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: NAVY, marginBottom: 12 }}>📚 Recent Courses</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
              {loading ? [1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ height: 98, borderRadius: 16, background: "#e8edf2" }} />) :
                courses.slice(0, 6).map(c => (
                  <div key={c.id} className="dash-card" style={{ padding: 14, cursor: "pointer" }} onClick={() => { setViewCourse(c); setTab("courses"); }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <CourseThumb title={c.title} image={c.image} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 12, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>by {c.instructor || "—"} · {c.enrolled ?? 0} students</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <CourseStatusBadge published={!!c.is_published} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{fmt(c.price ?? 0)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ═══ COURSES LIST ═══ */}
      {tab === "courses" && !viewCourse && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>
              Courses <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 13 }}>({courses.length})</span>
            </h2>
            <button onClick={() => { resetForm(); setTab("add"); }} className="btn-gold" style={{ padding: "9px 18px", fontSize: 12 }}>
              <PlusCircle size={13} /> New Course
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input className="dash-inp" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search courses…" style={{ paddingLeft: 36 }} />
            </div>
            {(["all", "live", "pending"] as const).map(s => (
              <button key={s} onClick={() => setStatusF(s)} className="pill" style={{ borderColor: statusF === s ? GOLD : "#e2e8f0", background: statusF === s ? GOLD + "15" : "#fff", color: statusF === s ? GOLD2 : "#64748b" }}>
                {s === "all" ? `All (${courses.length})` : s === "live" ? `Live (${live})` : `Pending (${pending})`}
              </button>
            ))}
          </div>
          <div className="dash-card" style={{ overflow: "hidden" }}>
            {loading ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) :
              shownCourses.length === 0 ? (
                <div style={{ padding: "56px 24px", textAlign: "center" }}><p style={{ color: "#94a3b8" }}>No courses found.</p></div>
              ) : shownCourses.map(c => (
                <div key={c.id} className="dash-row">
                  <CourseThumb title={c.title} image={c.image} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>by {c.instructor || "—"} · {c.category || "—"} · {c.enrolled ?? 0} students · {fmt(c.price ?? 0)}</p>
                  </div>
                  <CourseStatusBadge published={!!c.is_published} />
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setViewCourse(c)} className="btn-icon"><Eye size={14} style={{ color: "#3b82f6" }} /></button>
                    {!c.is_published && <button onClick={() => approve(c)} className="btn-icon"><CheckCircle size={14} style={{ color: "#22c55e" }} /></button>}
                    {c.is_published  && <button onClick={() => unpublish(c)} className="btn-icon"><EyeOff size={14} style={{ color: "#f59e0b" }} /></button>}
                    <button onClick={() => startEdit(c)} className="btn-icon"><Edit2 size={14} style={{ color: GOLD2 }} /></button>
                    <button onClick={() => handleDelete(c.id, c.title)} disabled={delId === c.id} className="btn-icon"><Trash2 size={14} style={{ color: "#ef4444" }} /></button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ═══ COURSE DETAIL ═══ */}
      {tab === "courses" && viewCourse && (
        <div>
          <button onClick={() => setViewCourse(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontFamily: "inherit", fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
            <ChevronLeft size={16} /> Back to All Courses
          </button>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 320px", gap: 18, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="dash-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  <CourseThumb title={viewCourse.title} image={viewCourse.image} size={72} />
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: NAVY, marginBottom: 6, lineHeight: 1.3 }}>{viewCourse.title}</h2>
                    {viewCourse.instructor && (
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>
                        by <span style={{ color: NAVY }}>{viewCourse.instructor}</span>
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <CourseStatusBadge published={!!viewCourse.is_published} />
                      {viewCourse.category && <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: NAVY + "0e", color: NAVY, fontWeight: 700, border: `1px solid ${NAVY}18` }}>{viewCourse.category}</span>}
                    </div>
                  </div>
                </div>
                {viewCourse.description && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75, marginBottom: 18 }}>{viewCourse.description}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {[{ label: "Price", value: viewCourse.price === 0 ? "Free" : fmt(viewCourse.price ?? 0) }, { label: "Students", value: viewCourse.enrolled ?? 0 }, { label: "Lessons", value: viewCourse.lessons ?? 0 }, { label: "Rating", value: viewCourse.rating || "—" }].map(s => (
                    <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                      <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{s.label}</p>
                      <p style={{ fontWeight: 800, fontSize: 15, color: NAVY }}>{String(s.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dash-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: NAVY }}>📚 Course Content</h3>
                  <button onClick={() => startEdit(viewCourse)} className="btn-gold" style={{ padding: "7px 14px", fontSize: 11 }}><Edit2 size={11} /> Edit Content</button>
                </div>
                <ContentViewer rawContent={viewCourse.content} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="dash-card" style={{ padding: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Admin Actions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {!viewCourse.is_published && <button onClick={() => approve(viewCourse)} className="btn-green" style={{ width: "100%", justifyContent: "center", padding: "11px" }}><CheckCircle size={14} /> Approve & Publish</button>}
                  {viewCourse.is_published  && <button onClick={() => unpublish(viewCourse)} style={{ width: "100%", justifyContent: "center", padding: "11px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, color: "#92400e", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}><EyeOff size={14} /> Unpublish</button>}
                  <button onClick={() => startEdit(viewCourse)} className="btn-gold" style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 12 }}><Edit2 size={13} /> Edit Course</button>
                  <button onClick={() => handleDelete(viewCourse.id, viewCourse.title)} className="btn-red" style={{ width: "100%", justifyContent: "center", padding: "11px" }}><Trash2 size={13} /> Delete Course</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD / EDIT ═══ */}
      {tab === "add" && (
        <div style={{ maxWidth: 820 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: NAVY, marginBottom: 4 }}>{editId ? "Edit Course" : "Create New Course"}</h2>
              <p style={{ fontSize: 12, color: "#64748b" }}>{editId ? "Changes published immediately (admin override)." : "Course published immediately without approval."}</p>
            </div>
            {editId && <button onClick={() => { resetForm(); setTab("courses"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}><X size={13} /> Cancel Edit</button>}
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "11px 14px", display: "flex", gap: 8, marginBottom: 22, alignItems: "flex-start" }}>
            <ShieldCheck size={14} style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#166534" }}><strong>Admin override active.</strong> Courses you create or edit go live immediately.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <section className="dash-card" style={{ padding: 20 }}>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: NAVY, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>📋 Basic Information</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Course Title <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="dash-inp" value={form.title} onChange={e => sf("title", e.target.value)} required placeholder="e.g. Complete Digital Marketing Masterclass" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Description</label>
                  <textarea className="dash-inp" value={form.description} onChange={e => sf("description", e.target.value)} rows={4} placeholder="What will students learn?" style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="fgrid">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Category</label>
                    <select className="dash-inp" value={form.catId} onChange={e => sf("catId", e.target.value)}>
                      <option value="">Select category…</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Price (₦) — 0 for Free</label>
                    <input className="dash-inp" type="number" min="0" step="100" value={form.price} onChange={e => sf("price", e.target.value)} placeholder="e.g. 45000" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="fgrid">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Duration</label>
                    <input className="dash-inp" value={form.duration} onChange={e => sf("duration", e.target.value)} placeholder="e.g. 4 weeks" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Lessons Count</label>
                    <input className="dash-inp" type="number" min="0" value={form.lessons} onChange={e => sf("lessons", e.target.value)} placeholder="e.g. 24" />
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

            <ContentBuilder parts={form.parts} onChange={parts => sf("parts", parts)} />

            <div style={{ display: "flex", gap: 10, paddingTop: 4, flexWrap: "wrap" }}>
              <button type="submit" disabled={saving} className="btn-gold" style={{ padding: "11px 24px", fontSize: 13 }}>
                {saving ? <><Loader size={13} className="spin" /> Saving…</> : <><Check size={13} /> {editId ? "Save Changes" : "Publish Course"}</>}
              </button>
              <button type="button" onClick={() => { resetForm(); setTab("courses"); }} style={{ padding: "11px 20px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, color: "#64748b" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ USERS LIST ═══ */}
      {tab === "users" && !viewUser && (
        <div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY, marginBottom: 16 }}>
            Users <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 13 }}>({users.length})</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
            {[{ label: "Students", v: users.filter(u => u.role === "student").length }, { label: "Instructors", v: users.filter(u => u.role === "instructor").length }, { label: "Admins", v: users.filter(u => u.role === "admin").length }].map(s => (
              <div key={s.label} className="dash-card" style={{ padding: 14, textAlign: "center" }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: NAVY }}>{usersLoad ? "—" : s.v}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input className="dash-inp" value={userQ} onChange={e => setUserQ(e.target.value)} placeholder="Search by name or email…" style={{ paddingLeft: 36 }} />
            </div>
            {(["all", "student", "instructor", "admin"] as const).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className="pill" style={{ borderColor: roleFilter === r ? GOLD : "#e2e8f0", background: roleFilter === r ? GOLD + "15" : "#fff", color: roleFilter === r ? GOLD2 : "#64748b" }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <div className="dash-card" style={{ overflow: "hidden" }}>
            {usersLoad ? [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />) :
              shownUsers.length === 0 ? (
                <div style={{ padding: "56px 24px", textAlign: "center" }}><p style={{ color: "#94a3b8" }}>No users found.</p></div>
              ) : shownUsers.map(u => (
                <div key={u.id} className="dash-row">
                  <Avatar name={u.name} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{u.name}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: u.is_active ? "#d1fae5" : "#fee2e2", color: u.is_active ? "#065f46" : "#991b1b", border: `1px solid ${u.is_active ? "#a7f3d0" : "#fecaca"}` }} className="hide-sm">
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setViewUser(u)} className="btn-icon"><Eye size={14} style={{ color: "#3b82f6" }} /></button>
                    <button onClick={() => handleToggleActive(u)} className="btn-icon">
                      {u.is_active ? <UserX size={14} style={{ color: "#f59e0b" }} /> : <UserCheck size={14} style={{ color: "#22c55e" }} />}
                    </button>
                    <button onClick={() => handleDeleteUser(u)} disabled={deletingUser === u.id} className="btn-icon"><Trash2 size={14} style={{ color: "#ef4444" }} /></button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ═══ USER DETAIL ═══ */}
      {tab === "users" && viewUser && (
        <div>
          <button onClick={() => setViewUser(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontFamily: "inherit", fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
            <ChevronLeft size={16} /> Back to All Users
          </button>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 300px", gap: 18, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="dash-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                  <Avatar name={viewUser.name} size={64} />
                  <div>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: NAVY, marginBottom: 6 }}>{viewUser.name}</h2>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <RoleBadge role={viewUser.role} />
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: viewUser.is_active ? "#d1fae5" : "#fee2e2", color: viewUser.is_active ? "#065f46" : "#991b1b", border: `1px solid ${viewUser.is_active ? "#a7f3d0" : "#fecaca"}` }}>
                        {viewUser.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                {[{ label: "Email", value: viewUser.email }, { label: "Phone", value: viewUser.phone || "—" }, { label: "User ID", value: `#${viewUser.id}` }, { label: "Joined", value: new Date(viewUser.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) }, { label: "Enrollments", value: String(viewUser.enrollments_count ?? "—") }].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="dash-card" style={{ padding: 20 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 14 }}>🔑 Change Role</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["student", "instructor", "admin"] as const).map(r => (
                    <button key={r} onClick={() => handleUpdateRole(viewUser, r)} disabled={viewUser.role === r || roleUpdating === viewUser.id}
                      style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid", cursor: viewUser.role === r ? "default" : "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, transition: "all .15s", borderColor: viewUser.role === r ? GOLD : "#e2e8f0", background: viewUser.role === r ? `linear-gradient(135deg,${GOLD},${GOLD2})` : "#fff", color: viewUser.role === r ? NAVY : "#64748b" }}>
                      {roleUpdating === viewUser.id ? <Loader size={12} className="spin" /> : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="dash-card" style={{ padding: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Admin Actions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => handleToggleActive(viewUser)} style={{ width: "100%", justifyContent: "center", padding: "11px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6, background: viewUser.is_active ? "#fef3c7" : "#d1fae5", color: viewUser.is_active ? "#92400e" : "#065f46" }}>
                  {viewUser.is_active ? <><UserX size={14} /> Deactivate Account</> : <><UserCheck size={14} /> Activate Account</>}
                </button>
                <button onClick={() => handleDeleteUser(viewUser)} disabled={deletingUser === viewUser.id} className="btn-red" style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
                  {deletingUser === viewUser.id ? <><Loader size={13} className="spin" /> Deleting…</> : <><Trash2 size={13} /> Delete User</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAYMENTS LIST ═══ */}
      {tab === "payments" && !viewPayment && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: NAVY }}>
              Payments <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 13 }}>({payments.length})</span>
            </h2>
            <button onClick={loadPayments} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: 99, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748b", fontFamily: "inherit" }}>
              <RefreshCw size={11} /> Reload
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
            {[{ label: "Pending", v: payments.filter(p => p.status === "pending").length, color: "#f59e0b" }, { label: "Approved", v: payments.filter(p => p.status === "approved").length, color: "#22c55e" }, { label: "Rejected", v: payments.filter(p => p.status === "rejected").length, color: "#ef4444" }].map(s => (
              <div key={s.label} className="dash-card" style={{ padding: 14, textAlign: "center" }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: s.color }}>{payLoad ? "—" : s.v}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
          {/* Revenue banner */}
          <div style={{ background: `linear-gradient(135deg,${NAVY},${NAVY})`, borderRadius: 14, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: GOLD + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={20} style={{ color: GOLD }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 500, marginBottom: 3 }}>Total Approved Revenue</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                {fmt(payments.filter(p => p.status === "approved").reduce((a, p) => a + parseFloat(String(p.amount ?? 0)), 0))}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input className="dash-inp" value={payQ} onChange={e => setPayQ(e.target.value)} placeholder="Search by name, course, reference…" style={{ paddingLeft: 36 }} />
            </div>
            {(["all", "pending", "approved", "rejected"] as const).map(s => (
              <button key={s} onClick={() => setPayFilter(s)} className="pill" style={{ borderColor: payFilter === s ? GOLD : "#e2e8f0", background: payFilter === s ? GOLD + "15" : "#fff", color: payFilter === s ? GOLD2 : "#64748b" }}>
                {s.charAt(0).toUpperCase() + s.slice(1)} ({s === "all" ? payments.length : payments.filter(p => p.status === s).length})
              </button>
            ))}
          </div>
          <div className="dash-card" style={{ overflow: "hidden" }}>
            {payLoad ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) :
              shownPayments.length === 0 ? (
                <div style={{ padding: "56px 24px", textAlign: "center" }}>
                  <CreditCard size={32} style={{ color: "#cbd5e1", margin: "0 auto 10px" }} />
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No payments found.</p>
                </div>
              ) : shownPayments.map(p => (
                <div key={p.id} className="dash-row">
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: p.status === "approved" ? "#d1fae5" : p.status === "rejected" ? "#fee2e2" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CreditCard size={16} style={{ color: p.status === "approved" ? "#16a34a" : p.status === "rejected" ? "#dc2626" : "#d97706" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{p.user?.name ?? p.user_name ?? `User #${p.user_id}`}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.course?.title ?? p.course_title ?? `Course #${p.course_id}`}{p.reference ? ` · Ref: ${p.reference}` : ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: NAVY }}>{fmt(p.amount)}</p>
                    <p style={{ fontSize: 10, color: "#94a3b8" }}>{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <PayBadge status={p.status} />
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setViewPayment(p)} className="btn-icon"><Eye size={14} style={{ color: "#3b82f6" }} /></button>
                    {p.status === "pending" && (
                      <>
                        <button onClick={() => handlePayment(p, "approved")} disabled={payActing === p.id} className="btn-icon"><CheckCircle size={14} style={{ color: "#22c55e" }} /></button>
                        <button onClick={() => handlePayment(p, "rejected")} disabled={payActing === p.id} className="btn-icon"><XCircle size={14} style={{ color: "#ef4444" }} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ═══ PAYMENT DETAIL ═══ */}
      {tab === "payments" && viewPayment && (
        <div>
          <button onClick={() => setViewPayment(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontFamily: "inherit", fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
            <ChevronLeft size={16} /> Back to All Payments
          </button>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 300px", gap: 18, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="dash-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Payment #{viewPayment.id}</p>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, color: NAVY }}>{fmt(viewPayment.amount)}</h2>
                  </div>
                  <PayBadge status={viewPayment.status} />
                </div>
                {[
                  { label: "Student",        value: viewPayment.user?.name ?? viewPayment.user_name ?? `User #${viewPayment.user_id}` },
                  { label: "Email",          value: viewPayment.user?.email ?? viewPayment.user_email ?? "—" },
                  { label: "Course",         value: viewPayment.course?.title ?? viewPayment.course_title ?? `Course #${viewPayment.course_id}` },
                  { label: "Amount",         value: fmt(viewPayment.amount) },
                  { label: "Payment Method", value: viewPayment.payment_method ?? "—" },
                  { label: "Reference",      value: viewPayment.reference ?? "—" },
                  { label: "Submitted",      value: new Date(viewPayment.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, textAlign: "right", maxWidth: "60%" }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Proof image */}
              {(() => {
                const proofUrl = getProofUrl(viewPayment);
                if (!proofUrl) return (
                  <div className="dash-card" style={{ padding: 20 }}>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 12 }}>📎 Payment Proof</p>
                    <div style={{ background: "#f8fafc", border: "1.5px dashed #e2e8f0", borderRadius: 10, padding: "32px 20px", textAlign: "center" }}>
                      <FileText size={28} style={{ color: "#cbd5e1", margin: "0 auto 8px" }} />
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>No proof image uploaded</p>
                    </div>
                  </div>
                );
                const fullUrl = proofUrl.startsWith("http") ? proofUrl : `https://api.handygiditrainingcentre.com${proofUrl}`;
                return (
                  <div className="dash-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: NAVY }}>📎 Payment Proof</p>
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: GOLD2, textDecoration: "none", padding: "5px 12px", border: `1px solid ${GOLD}50`, borderRadius: 8, background: GOLD + "10" }}>
                        <ExternalLink size={11} /> Open Full Image
                      </a>
                    </div>
                    <img src={fullUrl} alt="Payment proof" style={{ width: "100%", borderRadius: 10, border: "1px solid #e2e8f0", objectFit: "contain", maxHeight: 450, background: "#f8fafc" }}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const msg = document.createElement("p");
                        msg.style.cssText = "font-size:12px;color:#94a3b8;padding:20px;text-align:center";
                        msg.textContent = "Image could not be loaded. Click 'Open Full Image' to view.";
                        (e.target as HTMLImageElement).parentNode?.appendChild(msg);
                      }}
                    />
                  </div>
                );
              })()}
            </div>

            <div className="dash-card" style={{ padding: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Admin Actions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {viewPayment.status !== "approved" && (
                  <button onClick={() => handlePayment(viewPayment, "approved")} disabled={payActing === viewPayment.id} className="btn-green" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                    {payActing === viewPayment.id ? <><Loader size={13} className="spin" /> Processing…</> : <><BadgeCheck size={14} /> Approve Payment</>}
                  </button>
                )}
                {viewPayment.status !== "rejected" && (
                  <button onClick={() => handlePayment(viewPayment, "rejected")} disabled={payActing === viewPayment.id} className="btn-red" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                    {payActing === viewPayment.id ? <><Loader size={13} className="spin" /> Processing…</> : <><Ban size={14} /> Reject Payment</>}
                  </button>
                )}
              </div>
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                  {viewPayment.status === "approved" ? "✅ Payment approved. Student has access to the course." : viewPayment.status === "rejected" ? "❌ Payment rejected." : "⏳ Pending review. Verify the proof then approve or reject."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
