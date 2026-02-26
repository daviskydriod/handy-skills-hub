// File: src/pages/dashboard/AdminDashboard.tsx
// Full admin dashboard — manage users, approve/reject courses, view all stats.

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, BookOpen, FileText, Briefcase, Settings,
  CheckCircle, XCircle, Clock, Trash2, ToggleLeft, ToggleRight,
  TrendingUp, DollarSign, RefreshCw, Search, ShieldCheck, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";
import { deleteCourse, updateCourse, type Course } from "@/api/courses";

interface ApiUser {
  id: number; name: string; email: string;
  role: "student" | "instructor" | "admin";
  is_active: boolean; created_at: string;
}
type CourseStatus = "pending" | "approved" | "rejected";

const sidebarItems = [
  { label: "Dashboard",    to: "/dashboard/admin",              icon: <LayoutDashboard size={18} /> },
  { label: "Users",        to: "/dashboard/admin/users",        icon: <Users size={18} /> },
  { label: "Courses",      to: "/dashboard/admin/courses",      icon: <BookOpen size={18} /> },
  { label: "Blog",         to: "/dashboard/admin/blog",         icon: <FileText size={18} /> },
  { label: "Applications", to: "/dashboard/admin/applications", icon: <Briefcase size={18} /> },
  { label: "Settings",     to: "/dashboard/admin/settings",     icon: <Settings size={18} /> },
];

const Skeleton = ({ h = "h-8" }: { h?: string }) => (
  <div className={`${h} w-full rounded-xl bg-border/60 animate-pulse`} />
);

const StatusBadge = ({ status }: { status: CourseStatus }) => {
  const map = {
    pending:  { cls: "bg-yellow-50 text-yellow-700 border-yellow-200",    Icon: Clock },
    approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle },
    rejected: { cls: "bg-red-50 text-red-600 border-red-200",             Icon: XCircle },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${map.cls}`}>
      <map.Icon size={11} /> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const cls = {
    admin:      "bg-purple-50 text-purple-700 border-purple-200",
    instructor: "bg-blue-50 text-blue-700 border-blue-200",
    student:    "bg-slate-50 text-slate-600 border-slate-200",
  }[role] ?? "bg-slate-50 text-slate-600 border-slate-200";
  return <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize border ${cls}`}>{role}</span>;
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const [tab,            setTab]            = useState<"overview" | "users" | "courses">("overview");
  const [users,          setUsers]          = useState<ApiUser[]>([]);
  const [courses,        setCourses]        = useState<Course[]>([]);
  const [loadingUsers,   setLU]             = useState(true);
  const [loadingCourses, setLC]             = useState(true);
  const [userSearch,     setUserSearch]     = useState("");
  const [roleFilter,     setRoleFilter]     = useState("all");
  const [courseSearch,   setCourseSearch]   = useState("");
  const [deletingId,     setDeletingId]     = useState<number | null>(null);

  // ── Fetch ALL courses including unpublished ──────────────────────────────────
  // Tries admin endpoint first, falls back to regular + unpublished param
  const fetchCourses = useCallback(async () => {
    setLC(true);
    try {
      // ✅ Pass all=1 so PHP backend skips the is_published = 1 filter
      const res = await client.get<{ courses: Course[]; total: number }>("/courses", {
        params: { limit: 200, all: 1 },
      });
      const list = res.data.courses ?? [];
      setCourses(list);
    } catch {
      toast({ title: "Failed to load courses", variant: "destructive" });
    } finally { setLC(false); }
  }, []);

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLU(true);
    try {
      const res = await client.get<{ users: ApiUser[] }>("/users");
      setUsers(res.data.users ?? []);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally { setLU(false); }
  }, []);

  useEffect(() => { fetchUsers(); fetchCourses(); }, [fetchUsers, fetchCourses]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    totalUsers:       users.length,
    activeUsers:      users.filter(u => u.is_active).length,
    instructors:      users.filter(u => u.role === "instructor").length,
    totalCourses:     courses.length,
    publishedCourses: courses.filter(c => c.is_published).length,
    pendingCourses:   courses.filter(c => !c.is_published).length,
    totalEnrollments: courses.reduce((a, c) => a + c.enrolled, 0),
    totalRevenue:     courses.reduce((a, c) => a + c.price * c.enrolled, 0),
  };

  // ── Approve / Reject ─────────────────────────────────────────────────────────
  const handleCourseAction = async (courseId: number, action: "approved" | "rejected") => {
    try {
      await updateCourse(courseId, { is_published: action === "approved" ? 1 : 0 });
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, is_published: action === "approved" } : c
      ));
      toast({ title: action === "approved" ? "Course approved ✅ — now live!" : "Course rejected ❌" });
    } catch { toast({ title: "Action failed", variant: "destructive" }); }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteCourse = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast({ title: "Course deleted" });
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
    finally { setDeletingId(null); }
  };

  // ── Toggle user active ───────────────────────────────────────────────────────
  const toggleUserActive = async (u: ApiUser) => {
    try {
      await client.put(`/users/${u.id}`, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x));
      toast({ title: u.is_active ? "User deactivated" : "User activated" });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  // ── Change role ──────────────────────────────────────────────────────────────
  const changeRole = async (userId: number, role: ApiUser["role"]) => {
    try {
      await client.put(`/users/${userId}`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast({ title: `Role changed to ${role}` });
    } catch { toast({ title: "Failed to update role", variant: "destructive" }); }
  };

  // ── Filtered ─────────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (roleFilter === "all" || u.role === roleFilter);
  });

  const filteredCourses = courses.filter(c =>
    (c.title ?? "").toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.instructor ?? "").toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.category ?? "").toLowerCase().includes(courseSearch.toLowerCase())
  );

  const courseStatus = (c: Course): CourseStatus => c.is_published ? "approved" : "pending";

  const inputCls = "w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400 transition-colors";

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout items={sidebarItems} title="Admin Panel" userName={user?.name ?? "Admin"}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-xl md:text-2xl text-foreground">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Full control over users, courses & platform</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => { fetchUsers(); fetchCourses(); }}
          className="gap-1.5 text-xs">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users",       value: stats.totalUsers,                          icon: Users,       color: "bg-blue-500" },
          { label: "Total Courses",     value: stats.totalCourses,                        icon: BookOpen,    color: "bg-yellow-500" },
          { label: "Total Enrollments", value: stats.totalEnrollments.toLocaleString(),   icon: TrendingUp,  color: "bg-emerald-500" },
          { label: "Est. Revenue",      value: `₦${stats.totalRevenue.toLocaleString()}`, icon: DollarSign,  color: "bg-purple-500" },
          { label: "Active Users",      value: stats.activeUsers,                         icon: CheckCircle, color: "bg-teal-500" },
          { label: "Instructors",       value: stats.instructors,                         icon: ShieldCheck, color: "bg-indigo-500" },
          { label: "Published",         value: stats.publishedCourses,                    icon: Eye,         color: "bg-green-500" },
          { label: "Pending Review",    value: stats.pendingCourses,                      icon: Clock,       color: "bg-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">{label}</p>
              <p className="font-heading font-bold text-lg text-foreground leading-none mt-0.5">
                {loadingUsers || loadingCourses ? "—" : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary/50 rounded-xl p-1 w-fit">
        {(["overview", "users", "courses"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t}
            {t === "courses" && stats.pendingCourses > 0 && (
              <span className="ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-500 text-white">
                {stats.pendingCourses}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW ══════════════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="space-y-6">

          {/* Pending approvals — prominent section */}
          {courses.filter(c => !c.is_published).length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-base mb-3 text-foreground flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                Pending Approval
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {courses.filter(c => !c.is_published).length}
                </span>
              </h2>
              <div className="bg-card border border-orange-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-orange-50 border-b border-orange-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-orange-700 text-xs">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-orange-700 text-xs hidden sm:table-cell">Instructor</th>
                      <th className="px-4 py-3 text-left font-semibold text-orange-700 text-xs hidden md:table-cell">Price</th>
                      <th className="px-4 py-3 text-right font-semibold text-orange-700 text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.filter(c => !c.is_published).map(c => (
                      <tr key={c.id} className="border-b border-orange-100 last:border-0 hover:bg-orange-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {c.image
                              ? <img src={c.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                              : <div className="w-9 h-9 rounded-lg bg-secondary shrink-0 flex items-center justify-center">
                                  <BookOpen size={12} className="text-muted-foreground" />
                                </div>
                            }
                            <div className="min-w-0">
                              <p className="font-medium text-foreground line-clamp-1 max-w-[160px]">
                                {c.title ?? <span className="text-muted-foreground italic">No title</span>}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{c.category || "Uncategorised"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {c.instructor || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium hidden md:table-cell">
                          {c.price === 0 ? <span className="text-emerald-600">Free</span> : `₦${c.price.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm"
                              onClick={() => handleCourseAction(c.id, "approved")}
                              className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0 px-3 gap-1">
                              <CheckCircle size={11} /> Approve
                            </Button>
                            <Button size="sm"
                              onClick={() => handleDeleteCourse(c.id, c.title ?? "this course")}
                              disabled={deletingId === c.id}
                              className="h-7 text-xs bg-red-500 hover:bg-red-600 text-white border-0 px-3 gap-1">
                              <XCircle size={11} /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Published courses */}
          <div>
            <h2 className="font-heading font-semibold text-base mb-3 text-foreground">Live Courses</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {loadingCourses ? (
                <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} h="h-12" />)}</div>
              ) : courses.filter(c => c.is_published).length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">No published courses yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden sm:table-cell">Instructor</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden md:table-cell">Students</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.filter(c => c.is_published).slice(0, 8).map(c => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {c.image
                              ? <img src={c.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                              : <div className="w-8 h-8 rounded-lg bg-secondary shrink-0" />
                            }
                            <span className="font-medium text-foreground line-clamp-1 max-w-[160px]">{c.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{c.instructor}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{c.enrolled}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleCourseAction(c.id, "rejected")}
                              title="Unpublish"
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                              <EyeOff size={14} className="text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDeleteCourse(c.id, c.title)}
                              disabled={deletingId === c.id}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50">
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent signups */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div>
              <h2 className="font-heading font-semibold text-base mb-3 text-foreground">Recent Signups</h2>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {loadingUsers
                  ? [1,2,3,4,5].map(i => <div key={i} className="p-3"><Skeleton h="h-9" /></div>)
                  : users.slice(0, 6).map(u => (
                    <div key={u.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <RoleBadge role={u.role} />
                    </div>
                  ))
                }
              </div>
            </div>

            <div>
              <h2 className="font-heading font-semibold text-base mb-3 text-foreground">Top by Enrollment</h2>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {loadingCourses
                  ? [1,2,3,4,5].map(i => <div key={i} className="p-3"><Skeleton h="h-9" /></div>)
                  : [...courses].sort((a,b) => b.enrolled - a.enrolled).slice(0, 6).map(c => (
                    <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${c.is_published ? "bg-emerald-400" : "bg-yellow-400"}`} />
                        <p className="text-sm text-foreground truncate">{c.title ?? "Untitled"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{c.enrolled} students</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ USERS TAB ═══════════════════════════════════════════ */}
      {tab === "users" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name or email…" className={inputCls} />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-yellow-400 transition-colors">
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>
            <p className="text-xs text-muted-foreground self-center shrink-0">
              {filteredUsers.length} / {users.length} users
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loadingUsers ? (
              <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} h="h-12" />)}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">User</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden md:table-cell">Joined</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Role</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-white">{u.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          {new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <select value={u.role} onChange={e => changeRole(u.id, e.target.value as ApiUser["role"])}
                            className="text-xs border border-border rounded-lg px-2 py-1 bg-card text-foreground focus:outline-none focus:border-yellow-400 transition-colors">
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                            u.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => toggleUserActive(u)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors ml-auto">
                            {u.is_active
                              ? <ToggleRight size={20} className="text-emerald-500" />
                              : <ToggleLeft  size={20} className="text-muted-foreground" />}
                          </button>
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

      {/* ══════════════ COURSES TAB ═══════════════════════════════════════════ */}
      {tab === "courses" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={courseSearch} onChange={e => setCourseSearch(e.target.value)}
                placeholder="Search by course, instructor or category…" className={inputCls} />
            </div>
            <p className="text-xs text-muted-foreground self-center shrink-0">
              {filteredCourses.length} / {courses.length} courses
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loadingCourses ? (
              <div className="p-4 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} h="h-14" />)}</div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">No courses found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden sm:table-cell">Instructor</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs hidden md:table-cell">Students</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map(c => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {c.image
                              ? <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              : <div className="w-10 h-10 rounded-lg bg-secondary shrink-0 flex items-center justify-center">
                                  <BookOpen size={12} className="text-muted-foreground" />
                                </div>
                            }
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate max-w-[160px]">
                                {c.title ?? <span className="italic text-muted-foreground">No title</span>}
                              </p>
                              <p className="text-[11px] text-muted-foreground">{c.category || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{c.instructor || "—"}</td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {c.price === 0 ? <span className="text-emerald-600 font-semibold text-xs">Free</span> : `₦${c.price.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{c.enrolled}</td>
                        <td className="px-4 py-3"><StatusBadge status={courseStatus(c)} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleCourseAction(c.id, c.is_published ? "rejected" : "approved")}
                              title={c.is_published ? "Unpublish" : "Approve & Publish"}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                              {c.is_published
                                ? <Eye size={14} className="text-emerald-500" />
                                : <EyeOff size={14} className="text-muted-foreground" />}
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id, c.title ?? "this course")}
                              disabled={deletingId === c.id}
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

    </DashboardLayout>
  );
}
