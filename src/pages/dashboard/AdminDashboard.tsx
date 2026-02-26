// File: src/pages/dashboard/AdminDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, BookOpen, CheckCircle, XCircle,
  Clock, Trash2, ToggleLeft, ToggleRight, TrendingUp,
  DollarSign, RefreshCw, Search, ShieldCheck, Eye, EyeOff, Bell,
} from "lucide-react";
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
type TabType = "overview" | "users" | "courses";

const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";
const BG    = "#f0f4f8";

/* ── helpers ── */
const CourseThumb = ({ image, title, size = 40 }: { image?: string | null; title?: string; size?: number }) => {
  const cols = ["#0d9488","#0891b2","#7c3aed","#db2777","#d97706","#16a34a"];
  const col = cols[(title?.charCodeAt(0) ?? 0) % cols.length];
  return image ? (
    <img src={image} alt={title} style={{ width:size, height:size, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
  ) : (
    <div style={{ width:size, height:size, borderRadius:10, background:col+"18", border:`1px solid ${col}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <BookOpen size={Math.round(size*0.38)} style={{ color:col }} />
    </div>
  );
};

const UserAvatar = ({ name, size = 32 }: { name?: string; size?: number }) => {
  const cols = ["#0d9488","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#10b981"];
  const col = cols[(name?.charCodeAt(0) ?? 0) % cols.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:col, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:Math.round(size*0.38), flexShrink:0 }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
};

const SkeletonRow = () => (
  <div style={{ display:"flex", gap:12, padding:"13px 16px", borderBottom:"1px solid #f1f5f9", alignItems:"center" }}>
    <div style={{ width:40, height:40, borderRadius:10, background:"#e8edf2", flexShrink:0 }} />
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ height:13, width:"55%", background:"#e8edf2", borderRadius:6 }} />
      <div style={{ height:10, width:"35%", background:"#f1f5f9", borderRadius:6 }} />
    </div>
  </div>
);

const roleStyle: Record<string,{ bg:string; color:string; border:string }> = {
  admin:      { bg:"#ede9fe", color:"#5b21b6", border:"#ddd6fe" },
  instructor: { bg:"#dbeafe", color:"#1e40af", border:"#bfdbfe" },
  student:    { bg:"#f1f5f9", color:"#475569", border:"#e2e8f0" },
};

/* ══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user } = useAuth();

  const [tab,           setTab]          = useState<TabType>("overview");
  const [users,         setUsers]        = useState<ApiUser[]>([]);
  const [courses,       setCourses]      = useState<Course[]>([]);
  const [loadingUsers,  setLU]           = useState(true);
  const [loadingCourses,setLC]           = useState(true);
  const [userSearch,    setUserSearch]   = useState("");
  const [roleFilter,    setRoleFilter]   = useState("all");
  const [courseSearch,  setCourseSearch] = useState("");
  const [deletingId,    setDeletingId]   = useState<number | null>(null);

  /* ── fetch courses ── */
  const fetchCourses = useCallback(async () => {
    setLC(true);
    try {
      const res = await client.get<{ courses: Course[]; total: number }>("/courses", {
        params: { limit:200, all:1 },
      });
      setCourses(res.data.courses ?? []);
    } catch {
      toast({ title:"Failed to load courses", variant:"destructive" });
    } finally { setLC(false); }
  }, []);

  /* ── fetch users ── */
  const fetchUsers = useCallback(async () => {
    setLU(true);
    try {
      const res = await client.get<{ users: ApiUser[] }>("/users");
      setUsers(res.data.users ?? []);
    } catch {
      toast({ title:"Failed to load users", variant:"destructive" });
    } finally { setLU(false); }
  }, []);

  useEffect(() => { fetchUsers(); fetchCourses(); }, [fetchUsers, fetchCourses]);

  /* ── stats ── */
  const stats = {
    totalUsers:   users.length,
    activeUsers:  users.filter(u => u.is_active).length,
    instructors:  users.filter(u => u.role==="instructor").length,
    totalCourses: courses.length,
    published:    courses.filter(c => c.is_published).length,
    pending:      courses.filter(c => !c.is_published).length,
    enrollments:  courses.reduce((a,c) => a+c.enrolled, 0),
    revenue:      courses.reduce((a,c) => a+c.price*c.enrolled, 0),
  };

  /* ── approve / reject ── */
  const handleCourseAction = async (courseId: number, action: "approved"|"rejected") => {
    try {
      await updateCourse(courseId, { is_published: action==="approved" ? 1 : 0 });
      setCourses(prev => prev.map(c => c.id===courseId ? { ...c, is_published:action==="approved" } : c));
      toast({ title: action==="approved" ? "Course approved ✅ — now live!" : "Course rejected ❌" });
    } catch { toast({ title:"Action failed", variant:"destructive" }); }
  };

  /* ── delete course ── */
  const handleDeleteCourse = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id!==id));
      toast({ title:"Course deleted" });
    } catch { toast({ title:"Failed to delete", variant:"destructive" }); }
    finally { setDeletingId(null); }
  };

  /* ── toggle user ── */
  const toggleUserActive = async (u: ApiUser) => {
    try {
      await client.put(`/users/${u.id}`, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id===u.id ? { ...x, is_active:!u.is_active } : x));
      toast({ title: u.is_active ? "User deactivated" : "User activated" });
    } catch { toast({ title:"Failed", variant:"destructive" }); }
  };

  /* ── change role ── */
  const changeRole = async (userId: number, role: ApiUser["role"]) => {
    try {
      await client.put(`/users/${userId}`, { role });
      setUsers(prev => prev.map(u => u.id===userId ? { ...u, role } : u));
      toast({ title:`Role changed to ${role}` });
    } catch { toast({ title:"Failed to update role", variant:"destructive" }); }
  };

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (roleFilter==="all" || u.role===roleFilter);
  });

  const filteredCourses = courses.filter(c =>
    (c.title??"").toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.instructor??"").toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.category??"").toLowerCase().includes(courseSearch.toLowerCase())
  );

  const pendingCourses = courses.filter(c => !c.is_published);
  const loading = loadingUsers || loadingCourses;

  /* ══ RENDER ══ */
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .card{background:#fff;border-radius:16px;border:1px solid #e8edf2;}
        .btna{background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;border-radius:99px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:5px;font-size:11px;padding:5px 12px;transition:all .15s;white-space:nowrap;}
        .btna:hover{background:#a7f3d0;}
        .btnr{background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:99px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:5px;font-size:11px;padding:5px 12px;transition:all .15s;white-space:nowrap;}
        .btnr:hover{background:#fecaca;}
        .ntab{border:none;background:transparent;cursor:pointer;font-family:inherit;border-radius:10px;transition:all .15s;display:flex;align-items:center;gap:6px;font-weight:600;white-space:nowrap;padding:8px 14px;font-size:13px;}
        .ntab.on{background:${TEAL};color:#fff;}
        .ntab:not(.on){color:#64748b;}
        .ntab:not(.on):hover{background:#f1f5f9;color:#334155;}
        .inp{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:13px;font-family:inherit;color:${NAVY};outline:none;background:#fff;transition:border-color .2s;}
        .inp:focus{border-color:${TEAL};}
        .inp::placeholder{color:#94a3b8;}
        .arow{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #f8fafc;transition:background .15s;}
        .arow:hover{background:#fafcff;}
        .arow:last-child{border-bottom:none;}
        .icn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;transition:all .15s;flex-shrink:0;}
        .icn:hover{background:#f1f5f9;}
        .icn:disabled{opacity:.4;}
        @media(max-width:900px){
          .g4{grid-template-columns:repeat(2,1fr)!important;}
          .g2{grid-template-columns:1fr!important;}
          .hm{display:none!important;}
        }
        @media(max-width:560px){
          .nav-name{display:none!important;}
          .tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
          .pending-price{display:none!important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ background:"#fff", borderBottom:"1px solid #e8edf2", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${TEAL},${NAVY})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BookOpen size={17} color="#fff" />
            </div>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:NAVY }}>LearnHub</span>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:99, background:"#fef3c715", color:"#92400e", border:"1px solid #fde68a" }}>Admin</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", padding:8, borderRadius:8, color:"#64748b" }}><Bell size={18}/></button>
            <UserAvatar name={user?.name} size={34} />
            <span className="nav-name" style={{ fontSize:13, fontWeight:600, color:NAVY }}>{user?.name}</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px" }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:10 }}>
          <div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:NAVY, marginBottom:3 }}>Admin Dashboard</h1>
            <p style={{ color:"#64748b", fontSize:13 }}>Full control over users, courses & platform.</p>
          </div>
          <button onClick={() => { fetchUsers(); fetchCourses(); }} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:99, background:"#fff", cursor:"pointer", fontSize:12, fontWeight:600, color:"#64748b", fontFamily:"inherit" }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }} className="g4">
          {[
            { label:"Total Users",    value:loading?"—":stats.totalUsers,                              icon:Users,       color:"#3b82f6", bg:"#3b82f615" },
            { label:"Total Courses",  value:loading?"—":stats.totalCourses,                            icon:BookOpen,    color:TEAL,      bg:TEAL+"15" },
            { label:"Enrollments",    value:loading?"—":stats.enrollments.toLocaleString(),             icon:TrendingUp,  color:"#10b981", bg:"#10b98115" },
            { label:"Est. Revenue",   value:loading?"—":`₦${stats.revenue.toLocaleString()}`,           icon:DollarSign,  color:"#8b5cf6", bg:"#8b5cf615" },
            { label:"Active Users",   value:loading?"—":stats.activeUsers,                             icon:CheckCircle, color:"#14b8a6", bg:"#14b8a615" },
            { label:"Instructors",    value:loading?"—":stats.instructors,                             icon:ShieldCheck, color:"#6366f1", bg:"#6366f115" },
            { label:"Published",      value:loading?"—":stats.published,                               icon:Eye,         color:"#22c55e", bg:"#22c55e15" },
            { label:"Pending Review", value:loading?"—":stats.pending,                                 icon:Clock,       color:"#f97316", bg:"#f9731615" },
          ].map(({ label, value, icon:Icon, color, bg }) => (
            <div key={label} className="card" style={{ padding:16, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize:11, color:"#94a3b8", fontWeight:500, marginBottom:2 }}>{label}</p>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:NAVY, lineHeight:1.1 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="tab-scroll" style={{ marginBottom:24 }}>
          <div style={{ display:"flex", gap:4, background:"#fff", border:"1px solid #e8edf2", borderRadius:14, padding:5, width:"fit-content" }}>
            {(["overview","users","courses"] as TabType[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`ntab${tab===t?" on":""}`}>
                {t === "overview" ? <LayoutDashboard size={13}/> : t==="users" ? <Users size={13}/> : <BookOpen size={13}/>}
                {t.charAt(0).toUpperCase()+t.slice(1)}
                {t === "courses" && stats.pending > 0 && (
                  <span style={{ background:"#f97316", color:"#fff", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:99, marginLeft:2 }}>{stats.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ════════ OVERVIEW ════════ */}
        {tab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

            {/* pending */}
            {pendingCourses.length > 0 && (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <Clock size={15} style={{ color:"#f97316" }} />
                  <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:NAVY }}>Pending Approval</h2>
                  <span style={{ background:"#fef3c7", color:"#92400e", border:"1px solid #fde68a", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>{pendingCourses.length}</span>
                </div>
                <div className="card" style={{ overflow:"hidden", borderColor:"#fed7aa" }}>
                  <div style={{ background:"#fff7ed", padding:"10px 16px", borderBottom:"1px solid #fed7aa", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8 }}>
                    {["COURSE","INSTRUCTOR","PRICE","ACTIONS"].map(h => (
                      <p key={h} style={{ fontSize:11, fontWeight:700, color:"#92400e", textAlign:h==="ACTIONS"?"right":"left" }} className={h!=="COURSE"&&h!=="ACTIONS"?"hm":undefined}>{h}</p>
                    ))}
                  </div>
                  {pendingCourses.map(c => (
                    <div key={c.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8, alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #fff7ed" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                        <CourseThumb title={c.title} image={c.image} size={38} />
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontWeight:700, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title ?? "No title"}</p>
                          <p style={{ fontSize:10, color:"#94a3b8" }}>{c.category || "Uncategorised"}</p>
                        </div>
                      </div>
                      <p style={{ fontSize:12, color:"#64748b" }} className="hm">{c.instructor || "—"}</p>
                      <p style={{ fontSize:12, fontWeight:700, color:c.price===0?"#10b981":NAVY }} className="pending-price hm">
                        {c.price===0 ? "Free" : `₦${c.price.toLocaleString()}`}
                      </p>
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                        <button onClick={() => handleCourseAction(c.id,"approved")} className="btna">
                          <CheckCircle size={10}/> Approve
                        </button>
                        <button onClick={() => handleDeleteCourse(c.id, c.title ?? "this course")} disabled={deletingId===c.id} className="btnr">
                          <XCircle size={10}/> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* live courses */}
            <div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:NAVY, marginBottom:14 }}>Live Courses</h2>
              <div className="card" style={{ overflow:"hidden" }}>
                {loadingCourses ? [1,2,3].map(i => <SkeletonRow key={i} />) :
                 courses.filter(c => c.is_published).length === 0 ? (
                  <div style={{ padding:"48px 24px", textAlign:"center" }}><p style={{ color:"#94a3b8", fontSize:13 }}>No published courses yet.</p></div>
                ) : courses.filter(c => c.is_published).slice(0,8).map(c => (
                  <div key={c.id} className="arow">
                    <CourseThumb title={c.title} image={c.image} size={40} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                      <p style={{ fontSize:11, color:"#94a3b8" }}>{c.instructor} · {c.enrolled} students</p>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={() => handleCourseAction(c.id,"rejected")} className="icn" title="Unpublish"><EyeOff size={13} style={{ color:"#64748b" }}/></button>
                      <button onClick={() => handleDeleteCourse(c.id, c.title)} disabled={deletingId===c.id} className="icn"><Trash2 size={13} style={{ color:"#ef4444" }}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* recent signups + top enrollment */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="g2">
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:NAVY, marginBottom:14 }}>Recent Signups</h2>
                <div className="card" style={{ overflow:"hidden" }}>
                  {loadingUsers ? [1,2,3,4,5].map(i => <SkeletonRow key={i}/>) :
                   users.slice(0,6).map((u, i, arr) => (
                    <div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderBottom:i<arr.length-1?"1px solid #f8fafc":"none" }}>
                      <UserAvatar name={u.name} size={32} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</p>
                        <p style={{ fontSize:11, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:roleStyle[u.role]?.bg, color:roleStyle[u.role]?.color, border:`1px solid ${roleStyle[u.role]?.border}`, textTransform:"capitalize", flexShrink:0 }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:NAVY, marginBottom:14 }}>Top by Enrollment</h2>
                <div className="card" style={{ overflow:"hidden" }}>
                  {loadingCourses ? [1,2,3,4,5].map(i => <SkeletonRow key={i}/>) :
                   [...courses].sort((a,b) => b.enrolled-a.enrolled).slice(0,6).map((c,i,arr) => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderBottom:i<arr.length-1?"1px solid #f8fafc":"none" }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:c.is_published?"#10b981":"#f59e0b", flexShrink:0 }}/>
                      <p style={{ fontSize:13, color:NAVY, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:500 }}>{c.title ?? "Untitled"}</p>
                      <span style={{ fontSize:11, color:"#94a3b8", flexShrink:0 }}>{c.enrolled}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ USERS ════════ */}
        {tab === "users" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ flex:1, minWidth:200, position:"relative" }}>
                <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
                <input className="inp" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email…" style={{ paddingLeft:36 }} />
              </div>
              <select className="inp" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width:"auto", minWidth:130 }}>
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>
              <p style={{ fontSize:12, color:"#94a3b8", flexShrink:0 }}>{filteredUsers.length}/{users.length}</p>
            </div>

            <div className="card" style={{ overflow:"hidden" }}>
              {/* thead */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 40px", gap:8, padding:"10px 16px", background:"#f8fafc", borderBottom:"1px solid #e8edf2" }}>
                {["USER","JOINED","ROLE","STATUS",""].map((h,i) => (
                  <p key={i} style={{ fontSize:11, fontWeight:700, color:"#94a3b8" }} className={h==="JOINED"?"hm":undefined}>{h}</p>
                ))}
              </div>
              {loadingUsers ? [1,2,3,4,5].map(i => <SkeletonRow key={i}/>) :
               filteredUsers.length === 0 ? (
                <div style={{ padding:"56px 24px", textAlign:"center" }}><p style={{ color:"#94a3b8" }}>No users found.</p></div>
               ) : filteredUsers.map(u => (
                <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 40px", gap:8, alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #f8fafc", transition:"background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background="#fafcff")}
                  onMouseLeave={e => (e.currentTarget.style.background="")}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                    <UserAvatar name={u.name} size={32} />
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:600, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</p>
                      <p style={{ fontSize:11, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:"#94a3b8" }} className="hm">
                    {new Date(u.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"})}
                  </p>
                  <div>
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value as ApiUser["role"])}
                      style={{ fontSize:12, border:"1px solid #e2e8f0", borderRadius:8, padding:"4px 8px", background:"#fff", color:NAVY, fontFamily:"inherit", cursor:"pointer", outline:"none" }}>
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:99, background:u.is_active?"#d1fae5":"#fee2e2", color:u.is_active?"#065f46":"#991b1b", border:`1px solid ${u.is_active?"#a7f3d0":"#fecaca"}` }}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <button onClick={() => toggleUserActive(u)} className="icn">
                    {u.is_active
                      ? <ToggleRight size={20} style={{ color:"#10b981" }}/>
                      : <ToggleLeft  size={20} style={{ color:"#cbd5e1" }}/>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ COURSES ════════ */}
        {tab === "courses" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ flex:1, minWidth:200, position:"relative" }}>
                <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
                <input className="inp" value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder="Search by course, instructor or category…" style={{ paddingLeft:36 }} />
              </div>
              <p style={{ fontSize:12, color:"#94a3b8", flexShrink:0 }}>{filteredCourses.length}/{courses.length}</p>
            </div>

            <div className="card" style={{ overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 80px 90px 80px", gap:8, padding:"10px 16px", background:"#f8fafc", borderBottom:"1px solid #e8edf2" }}>
                {["COURSE","INSTRUCTOR","PRICE","STUDENTS","STATUS","ACTIONS"].map((h,i) => (
                  <p key={i} style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textAlign:h==="ACTIONS"?"right":"left" }} className={h==="INSTRUCTOR"||h==="STUDENTS"?"hm":undefined}>{h}</p>
                ))}
              </div>
              {loadingCourses ? [1,2,3,4].map(i => <SkeletonRow key={i}/>) :
               filteredCourses.length === 0 ? (
                <div style={{ padding:"56px 24px", textAlign:"center" }}><p style={{ color:"#94a3b8" }}>No courses found.</p></div>
               ) : filteredCourses.map(c => (
                <div key={c.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 80px 90px 80px", gap:8, alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #f8fafc", transition:"background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background="#fafcff")}
                  onMouseLeave={e => (e.currentTarget.style.background="")}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                    <CourseThumb title={c.title} image={c.image} size={40} />
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title ?? "No title"}</p>
                      <p style={{ fontSize:11, color:"#94a3b8" }}>{c.category || "—"}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:"#64748b" }} className="hm">{c.instructor || "—"}</p>
                  <p style={{ fontSize:13, fontWeight:700, color:c.price===0?"#10b981":NAVY }}>
                    {c.price===0 ? "Free" : `₦${c.price.toLocaleString()}`}
                  </p>
                  <p style={{ fontSize:12, color:"#64748b" }} className="hm">{c.enrolled}</p>
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:c.is_published?"#d1fae5":"#fef3c7", color:c.is_published?"#065f46":"#92400e", border:`1px solid ${c.is_published?"#a7f3d0":"#fde68a"}`, whiteSpace:"nowrap" }}>
                    {c.is_published ? "Live" : "Pending"}
                  </span>
                  <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                    <button onClick={() => handleCourseAction(c.id, c.is_published?"rejected":"approved")} className="icn" title={c.is_published?"Unpublish":"Approve"}>
                      {c.is_published ? <Eye size={13} style={{ color:"#10b981" }}/> : <EyeOff size={13} style={{ color:"#64748b" }}/>}
                    </button>
                    <button onClick={() => handleDeleteCourse(c.id, c.title??"")} disabled={deletingId===c.id} className="icn">
                      <Trash2 size={13} style={{ color:"#ef4444" }}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
