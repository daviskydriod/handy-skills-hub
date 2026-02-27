// File: src/pages/dashboard/InstructorDashboard.tsx
// ── Only the nav section is updated to use HandyGidi branding ──
// ── All logic/tabs remain identical to your existing file ──
// ── Replace only the NAV block in your existing InstructorDashboard ──

/*
  CHANGE: Replace the existing <nav> block with this:

  <nav style={{ background:"#fff", borderBottom:"1px solid #e8edf2", position:"sticky", top:0, zIndex:50 }}>
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <img
          src={logo}
          alt="HandyGidi"
          style={{ width:34, height:34, borderRadius:10, objectFit:"contain", border:"2px solid #EAB30840" }}
        />
        <div>
          <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:NAVY, lineHeight:1.1 }}>HandyGidi</p>
          <p style={{ fontSize:10, fontWeight:600, color:"#CA8A04", lineHeight:1 }}>Training Centre</p>
        </div>
        <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:99, background:TEAL+"18", color:TEAL, border:`1px solid ${TEAL}30` }}>Instructor</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button style={{ background:"none", border:"none", cursor:"pointer", padding:8, borderRadius:8, color:"#64748b" }}><Bell size={18} /></button>
        <UserAvatar name={user?.name} size={34} />
        <span className="nav-name" style={{ fontSize:13, fontWeight:600, color:NAVY }}>{user?.name}</span>
        <button onClick={() => { logout(); navigate("/"); }} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#94a3b8", fontFamily:"inherit", padding:"6px 10px", borderRadius:8 }}>
          <LogOut size={13} /> <span className="nav-name">Sign out</span>
        </button>
      </div>
    </div>
  </nav>

  Also add these imports at the top:
  import logo from "@/assets/logo.jpeg";
  import { LogOut } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  const navigate = useNavigate();
  const { logout } = useAuth(); // add logout to existing destructure
*/

// ── FULL FILE BELOW (complete rewrite with HandyGidi branding) ──

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, PlusCircle, Users, DollarSign,
  Trash2, EyeOff, Upload, X, Star, Edit2, RefreshCw, Search,
  Check, Clock, TrendingUp, AlertCircle, ShieldCheck, Bell,
  BarChart2, ChevronRight, Loader, Info, LogOut,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  getCourses, createCourse, updateCourse,
  updateCourseWithFile, deleteCourse, type Course,
} from "@/api/courses";
import { getCategories, type Category } from "@/api/categories";
import logo from "@/assets/logo.jpeg";

const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";
const GOLD2 = "#CA8A04";
const BG    = "#f0f4f8";

type TabType = "overview" | "courses" | "add" | "earnings";

const emptyForm = {
  title: "", description: "", price: "", duration: "",
  lessons: "", catId: "", file: null as File | null, preview: null as string | null,
};

const CourseThumb = ({ image, title, size = 44 }: { image?: string | null; title?: string; size?: number }) => {
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

const UserAvatar = ({ name, size = 34 }: { name?: string; size?: number }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${TEAL},${NAVY})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:Math.round(size*0.38), flexShrink:0 }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

const StatusPill = ({ published }: { published: boolean }) => (
  <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:published?"#d1fae5":"#fef3c7", color:published?"#065f46":"#92400e", border:`1px solid ${published?"#a7f3d0":"#fde68a"}`, whiteSpace:"nowrap" }}>
    {published ? "Live" : "Pending Approval"}
  </span>
);

const SkeletonRow = () => (
  <div style={{ display:"flex", gap:12, padding:"14px 16px", borderBottom:"1px solid #f1f5f9", alignItems:"center" }}>
    <div style={{ width:44, height:44, borderRadius:10, background:"#e8edf2", flexShrink:0 }} />
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ height:13, width:"60%", background:"#e8edf2", borderRadius:6 }} />
      <div style={{ height:10, width:"35%", background:"#f1f5f9", borderRadius:6 }} />
    </div>
  </div>
);

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,        setTab]        = useState<TabType>("overview");
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQ,    setSearchQ]    = useState("");
  const [form,       setForm]       = useState(emptyForm);
  const [aiPrompt,   setAiPrompt]   = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setF = (key: keyof typeof emptyForm, val: any) => setForm(p => ({ ...p, [key]: val }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setAiPrompt(""); };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCourses({ limit:100 });
      setCourses(res.courses.filter(c => c.instructor_id === user?.id));
    } catch { toast({ title:"Failed to load courses", variant:"destructive" }); }
    finally { setLoading(false); }
  }, [user?.id]);

  const fetchCats = useCallback(async () => {
    try { setCategories(await getCategories()); } catch {}
  }, []);

  useEffect(() => { if (!user) return; fetchCourses(); fetchCats(); }, [user, fetchCourses, fetchCats]);
  useEffect(() => {
    const fn = () => { if (document.visibilityState==="visible" && user) fetchCourses(); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [user, fetchCourses]);

  const totalStudents = courses.reduce((a,c) => a+c.enrolled, 0);
  const totalEarnings = courses.reduce((a,c) => a+c.price*c.enrolled, 0);
  const avgRating     = courses.length ? (courses.reduce((a,c) => a+c.rating, 0)/courses.length).toFixed(1) : "—";
  const published     = courses.filter(c => c.is_published).length;
  const pending       = courses.filter(c => !c.is_published).length;
  const displayed     = courses.filter(c => c.title.toLowerCase().includes(searchQ.toLowerCase()) || (c.category||"").toLowerCase().includes(searchQ.toLowerCase()));

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:`Generate a compelling online course title and description for this idea: "${aiPrompt}". Respond ONLY with a JSON object (no markdown, no backticks): {"title":"...","description":"..."}` }],
        }),
      });
      const data = await res.json();
      const parsed = JSON.parse((data.content?.[0]?.text ?? "").replace(/```json|```/g,"").trim());
      if (parsed.title) setF("title", parsed.title);
      if (parsed.description) setF("description", parsed.description);
      setAiPrompt("");
      toast({ title:"AI generated your course content ✨" });
    } catch { toast({ title:"AI generation failed", variant:"destructive" }); }
    finally { setAiLoading(false); }
  };

  const startEdit = (c: Course) => {
    setForm({ title:c.title, description:c.description, price:String(c.price), duration:c.duration??"", lessons:String(c.lessons), catId:String(c.category_id??""), file:null, preview:c.image });
    setEditingId(c.id); setTab("add");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast({ title:"Title is required", variant:"destructive" }); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        if (form.file) {
          const fd = new FormData();
          fd.append("title",form.title); fd.append("description",form.description);
          fd.append("price",form.price||"0"); fd.append("duration",form.duration);
          fd.append("lessons_count",form.lessons||"0"); fd.append("category_id",form.catId);
          fd.append("is_published","0"); fd.append("thumbnail",form.file);
          await updateCourseWithFile(editingId, fd);
        } else {
          await updateCourse(editingId, { title:form.title, description:form.description, price:parseFloat(form.price||"0"), duration:form.duration, lessons_count:parseInt(form.lessons||"0"), category_id:form.catId||null, is_published:0 });
        }
        toast({ title:"Course updated — awaiting admin approval ✅" });
      } else {
        const fd = new FormData();
        fd.append("title",form.title); fd.append("description",form.description);
        fd.append("price",form.price||"0"); fd.append("duration",form.duration);
        fd.append("lessons_count",form.lessons||"0"); fd.append("category_id",form.catId);
        fd.append("is_published","0");
        if (form.file) fd.append("thumbnail", form.file);
        await createCourse(fd);
        toast({ title:"Course submitted for admin approval 🎉" });
      }
      resetForm(); fetchCourses(); setTab("courses");
    } catch (err: any) { toast({ title:err.response?.data?.error??"Failed to save", variant:"destructive" }); }
    finally { setSubmitting(false); }
  };

  const togglePublish = async (c: Course) => {
    if (!c.is_published) { toast({ title:"Only admins can publish courses.", variant:"destructive" }); return; }
    try {
      await updateCourse(c.id, { is_published:0 });
      setCourses(prev => prev.map(x => x.id===c.id ? { ...x, is_published:false } : x));
      toast({ title:"Course unpublished" });
    } catch { toast({ title:"Failed", variant:"destructive" }); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id!==id));
      toast({ title:"Course deleted" });
    } catch { toast({ title:"Failed to delete", variant:"destructive" }); }
    finally { setDeletingId(null); }
  };

  const tabs: { key:TabType; label:string; icon:any }[] = [
    { key:"overview",  label:"Overview",   icon:LayoutDashboard },
    { key:"courses",   label:"My Courses", icon:BookOpen },
    { key:"add",       label:editingId?"Edit Course":"Add Course", icon:PlusCircle },
    { key:"earnings",  label:"Earnings",   icon:DollarSign },
  ];

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .inp{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:13px;font-family:inherit;color:${NAVY};outline:none;background:#fff;transition:border-color .2s;}
        .inp:focus{border-color:${TEAL};}
        .inp::placeholder{color:#94a3b8;}
        .card{background:#fff;border-radius:16px;border:1px solid #e8edf2;}
        .btnt{background:linear-gradient(135deg,${TEAL},${TEAL2});color:#fff;border:none;border-radius:99px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .2s;}
        .btnt:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(13,148,136,.3);}
        .btnt:disabled{opacity:.6;transform:none;}
        .ntab{border:none;background:transparent;cursor:pointer;font-family:inherit;border-radius:10px;transition:all .15s;display:flex;align-items:center;gap:6px;font-weight:600;white-space:nowrap;padding:8px 14px;font-size:13px;}
        .ntab.on{background:${NAVY};color:#fff;}
        .ntab:not(.on){color:#64748b;}
        .ntab:not(.on):hover{background:#f1f5f9;color:#334155;}
        .arow{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #f8fafc;transition:background .15s;}
        .arow:hover{background:#fafcff;}
        .arow:last-child{border-bottom:none;}
        .icn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;transition:all .15s;flex-shrink:0;}
        .icn:hover{background:#f1f5f9;}
        .icn:disabled{opacity:.4;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .spin{animation:spin 1s linear infinite;}
        @media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr)!important;}.g3{grid-template-columns:repeat(2,1fr)!important;}.hm{display:none!important;}}
        @media(max-width:560px){.g4{grid-template-columns:repeat(2,1fr)!important;}.g3{grid-template-columns:1fr!important;}.fgrid{grid-template-columns:1fr!important;}.nav-name{display:none!important;}.tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ background:"#fff", borderBottom:"1px solid #e8edf2", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={logo} alt="HandyGidi" style={{ width:34, height:34, borderRadius:10, objectFit:"contain", border:"2px solid #EAB30840" }} />
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:NAVY, lineHeight:1.1 }}>HandyGidi</p>
              <p style={{ fontSize:10, fontWeight:600, color:GOLD2, lineHeight:1 }}>Training Centre</p>
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:99, background:TEAL+"18", color:TEAL, border:`1px solid ${TEAL}30` }}>Instructor</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", padding:8, borderRadius:8, color:"#64748b" }}><Bell size={18}/></button>
            <UserAvatar name={user?.name} size={34} />
            <span className="nav-name" style={{ fontSize:13, fontWeight:600, color:NAVY }}>{user?.name}</span>
            <button onClick={() => { logout(); navigate("/"); }} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#94a3b8", fontFamily:"inherit", padding:"6px 10px", borderRadius:8 }}>
              <LogOut size={13}/> <span className="nav-name">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px" }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:10 }}>
          <div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:NAVY, marginBottom:3 }}>
              Welcome back, {user?.name?.split(" ")[0] ?? "Instructor"} 👋
            </h1>
            <p style={{ color:"#64748b", fontSize:13 }}>Manage your courses and track performance.</p>
          </div>
          <button onClick={() => { fetchCourses(); fetchCats(); }} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:99, background:"#fff", cursor:"pointer", fontSize:12, fontWeight:600, color:"#64748b", fontFamily:"inherit" }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }} className="g4">
          {[
            { label:"My Courses",       value:loading?"—":courses.length,                                                icon:BookOpen,    color:TEAL,      bg:TEAL+"15" },
            { label:"Total Students",   value:loading?"—":totalStudents.toLocaleString(),                                icon:Users,       color:"#3b82f6", bg:"#3b82f615" },
            { label:"Est. Earnings",    value:loading?"—":`₦${totalEarnings.toLocaleString()}`,                         icon:DollarSign,  color:"#10b981", bg:"#10b98115" },
            { label:"Avg Rating",       value:loading?"—":avgRating,                                                    icon:Star,        color:"#f59e0b", bg:"#f59e0b15" },
            { label:"Published",        value:loading?"—":published,                                                    icon:TrendingUp,  color:"#22c55e", bg:"#22c55e15" },
            { label:"Pending Approval", value:loading?"—":pending,                                                      icon:Clock,       color:"#f97316", bg:"#f9731615" },
            { label:"Avg Students",     value:loading?"—":courses.length?Math.round(totalStudents/courses.length):0,    icon:BarChart2,   color:"#8b5cf6", bg:"#8b5cf615" },
            { label:"Categories",       value:loading?"—":new Set(courses.map(c=>c.category)).size,                     icon:ChevronRight,color:"#ec4899", bg:"#ec489915" },
          ].map(({ label, value, icon:Icon, color, bg }) => (
            <div key={label} className="card" style={{ padding:16, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon size={18} style={{ color }} />
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
            {tabs.map(({ key, label, icon:Icon }) => (
              <button key={key} onClick={() => { setTab(key as TabType); if (key==="add") resetForm(); }}
                className={`ntab${tab===key?" on":""}`}>
                <Icon size={13}/>{label}
                {key==="courses" && pending>0 && (
                  <span style={{ background:"#f97316", color:"#fff", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:99, marginLeft:2 }}>{pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ════════ OVERVIEW ════════ */}
        {tab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ background:TEAL+"08", border:`1px solid ${TEAL}25`, borderRadius:14, padding:16, display:"flex", alignItems:"flex-start", gap:10 }}>
              <ShieldCheck size={17} style={{ color:TEAL, flexShrink:0, marginTop:1 }} />
              <div>
                <p style={{ fontWeight:700, fontSize:13, color:NAVY, marginBottom:2 }}>Admin Approval Required</p>
                <p style={{ fontSize:12, color:"#64748b" }}>All new and edited courses are saved as drafts and must be approved by an admin before going live.</p>
              </div>
            </div>

            {loading ? (
              <div className="card" style={{ overflow:"hidden" }}>{[1,2,3].map(i => <SkeletonRow key={i}/>)}</div>
            ) : courses.length === 0 ? (
              <div className="card" style={{ padding:"56px 24px", textAlign:"center" }}>
                <BookOpen size={36} style={{ color:"#cbd5e1", margin:"0 auto 12px" }} />
                <p style={{ color:"#94a3b8", marginBottom:16, fontSize:14 }}>No courses yet.</p>
                <button onClick={() => { resetForm(); setTab("add"); }} className="btnt" style={{ padding:"10px 24px", fontSize:13 }}>
                  <PlusCircle size={14}/> Create First Course
                </button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:12 }}>
                {courses.slice(0,6).map(c => (
                  <div key={c.id} className="card" style={{ padding:16 }}>
                    <div style={{ display:"flex", gap:12, marginBottom:12 }}>
                      <CourseThumb title={c.title} image={c.image} size={46} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:700, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>{c.title}</p>
                        <p style={{ fontSize:11, color:"#94a3b8" }}>{c.enrolled} students · ₦{c.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <StatusPill published={!!c.is_published} />
                      <button onClick={() => startEdit(c)} className="icn"><Edit2 size={13} style={{ color:"#3b82f6" }}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ MY COURSES ════════ */}
        {tab === "courses" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:NAVY }}>
                My Courses <span style={{ color:"#94a3b8", fontWeight:500, fontSize:13 }}>({courses.length})</span>
              </h2>
              <button onClick={() => { resetForm(); setTab("add"); }} className="btnt" style={{ padding:"9px 18px", fontSize:12 }}>
                <PlusCircle size={13}/> New Course
              </button>
            </div>
            <div style={{ position:"relative", marginBottom:14 }}>
              <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
              <input className="inp" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search courses…" style={{ paddingLeft:36 }} />
            </div>
            <div className="card" style={{ overflow:"hidden" }}>
              {loading ? [1,2,3,4].map(i => <SkeletonRow key={i}/>) :
               displayed.length === 0 ? (
                <div style={{ padding:"56px 24px", textAlign:"center" }}><p style={{ color:"#94a3b8" }}>{courses.length===0?"No courses yet.":"No results."}</p></div>
               ) : displayed.map(c => (
                <div key={c.id} className="arow">
                  <CourseThumb title={c.title} image={c.image} size={46} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                    <p style={{ fontSize:11, color:"#94a3b8" }}>{c.category||"—"} · {c.enrolled} students · ₦{c.price.toLocaleString()}</p>
                  </div>
                  <StatusPill published={!!c.is_published} />
                  <div style={{ display:"flex", gap:4 }}>
                    {c.is_published && <button onClick={() => togglePublish(c)} className="icn" title="Unpublish"><EyeOff size={14} style={{ color:"#64748b" }}/></button>}
                    <button onClick={() => startEdit(c)} className="icn"><Edit2 size={14} style={{ color:"#3b82f6" }}/></button>
                    <button onClick={() => handleDelete(c.id, c.title)} disabled={deletingId===c.id} className="icn"><Trash2 size={14} style={{ color:"#ef4444" }}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ ADD / EDIT ════════ */}
        {tab === "add" && (
          <div style={{ maxWidth:660 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:NAVY, marginBottom:4 }}>
                  {editingId ? "Edit Course" : "Create New Course"}
                </h2>
                <p style={{ fontSize:12, color:"#64748b" }}>
                  {editingId ? "Changes require admin re-approval." : "Your course will be reviewed by an admin before going live."}
                </p>
              </div>
              {editingId && (
                <button onClick={() => { resetForm(); setTab("courses"); }} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, color:"#64748b", fontSize:12, fontFamily:"inherit", fontWeight:600 }}>
                  <X size={13}/> Cancel
                </button>
              )}
            </div>

            {/* AI Assistant */}
            <div style={{ background:`${TEAL}08`, border:`1.5px solid ${TEAL}30`, borderRadius:14, padding:16, marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:22, height:22, borderRadius:6, background:TEAL, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:12, color:"#fff", fontWeight:800 }}>✦</span>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:NAVY }}>AI Course Assistant</p>
                <span style={{ fontSize:10, fontWeight:700, padding:"1px 8px", borderRadius:99, background:TEAL, color:"#fff" }}>Claude</span>
              </div>
              <p style={{ fontSize:12, color:"#64748b", marginBottom:10 }}>Describe your idea — Claude will generate a compelling title and description instantly.</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <input className="inp" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g. Python for beginners with real-world data projects…"
                  onKeyDown={e => e.key==="Enter" && generateWithAI()}
                  style={{ flex:1, minWidth:180 }} />
                <button onClick={generateWithAI} disabled={aiLoading || !aiPrompt.trim()} className="btnt"
                  style={{ padding:"10px 18px", fontSize:12, borderRadius:12, flexShrink:0 }}>
                  {aiLoading ? <><Loader size={13} className="spin"/> Generating…</> : "✦ Generate"}
                </button>
              </div>
            </div>

            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:12, display:"flex", gap:8, marginBottom:22 }}>
              <Info size={14} style={{ color:"#f59e0b", flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:12, color:"#92400e" }}><strong>Admin approval required.</strong> Course will be saved as draft and won't appear publicly until approved.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" }}>Course Title <span style={{ color:"#ef4444" }}>*</span></label>
                <input className="inp" value={form.title} onChange={e => setF("title",e.target.value)} required placeholder="e.g. Complete Digital Marketing Masterclass" />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" }}>Description</label>
                <textarea className="inp" value={form.description} onChange={e => setF("description",e.target.value)} rows={4} placeholder="What will students learn? Who is this course for?" style={{ resize:"vertical" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="fgrid">
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" }}>Category</label>
                  <select className="inp" value={form.catId} onChange={e => setF("catId",e.target.value)}>
                    <option value="">Select category…</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" }}>Price (₦) — 0 for Free</label>
                  <input className="inp" type="number" min="0" step="100" value={form.price} onChange={e => setF("price",e.target.value)} placeholder="e.g. 15000" />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="fgrid">
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" }}>Duration</label>
                  <input className="inp" value={form.duration} onChange={e => setF("duration",e.target.value)} placeholder="e.g. 4 weeks / 20 hours" />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" }}>Number of Lessons</label>
                  <input className="inp" type="number" min="0" value={form.lessons} onChange={e => setF("lessons",e.target.value)} placeholder="e.g. 24" />
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" }}>Course Thumbnail</label>
                <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                  <button type="button" onClick={() => fileRef.current?.click()} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", border:"1.5px dashed #cbd5e1", borderRadius:12, background:"none", cursor:"pointer", fontSize:12, fontWeight:600, color:"#64748b", fontFamily:"inherit" }}>
                    <Upload size={14}/> {form.file ? "Change Image" : "Upload Thumbnail"}
                  </button>
                  {form.preview && (
                    <div style={{ position:"relative" }}>
                      <img src={form.preview} alt="" style={{ width:64, height:64, borderRadius:10, objectFit:"cover", border:"1px solid #e2e8f0" }} />
                      <button type="button" onClick={() => setForm(p => ({ ...p, file:null, preview:null }))} style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background:"#ef4444", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <X size={9} color="#fff"/>
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
                    onChange={e => { const f=e.target.files?.[0]; if(f) setForm(p => ({ ...p, file:f, preview:URL.createObjectURL(f) })); }} />
                </div>
                <p style={{ fontSize:11, color:"#94a3b8", marginTop:6 }}>Recommended: 1280×720px. JPG, PNG or WebP.</p>
              </div>
              <div style={{ display:"flex", gap:10, paddingTop:4, flexWrap:"wrap" }}>
                <button type="submit" disabled={submitting} className="btnt" style={{ padding:"11px 24px", fontSize:13, borderRadius:12 }}>
                  {submitting ? <><Loader size={13} className="spin"/> Saving…</> : <><Check size={13}/> {editingId?"Save & Submit for Review":"Submit for Approval"}</>}
                </button>
                <button type="button" onClick={() => { resetForm(); setTab("courses"); }} style={{ padding:"11px 20px", fontSize:13, border:"1px solid #e2e8f0", borderRadius:12, background:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:600, color:"#64748b" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════ EARNINGS ════════ */}
        {tab === "earnings" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:NAVY }}>Earnings Overview</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }} className="g3">
              {[
                { label:"Total Earned",   value:`₦${totalEarnings.toLocaleString()}`,                                                   desc:"All time estimate" },
                { label:"Avg per Course", value:courses.length?`₦${Math.round(totalEarnings/courses.length).toLocaleString()}`:"—",     desc:"Average revenue" },
                { label:"Best Performer", value:courses.length?`₦${Math.max(...courses.map(c=>c.price*c.enrolled)).toLocaleString()}`:"—",desc:"Highest earning" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding:20 }}>
                  <p style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>{s.label}</p>
                  <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:24, color:NAVY, marginBottom:4 }}>{loading?"—":s.value}</p>
                  <p style={{ fontSize:11, color:"#94a3b8" }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="card" style={{ overflow:"hidden" }}>
              <div style={{ padding:"13px 16px", borderBottom:"1px solid #f1f5f9" }}>
                <h3 style={{ fontWeight:700, fontSize:14, color:NAVY }}>Revenue per Course</h3>
              </div>
              {loading ? [1,2,3].map(i => <SkeletonRow key={i}/>) :
               courses.length===0 ? <div style={{ padding:"48px 24px", textAlign:"center" }}><p style={{ color:"#94a3b8" }}>No courses yet.</p></div> :
               [...courses].sort((a,b)=>(b.price*b.enrolled)-(a.price*a.enrolled)).map((c,i,arr) => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderBottom:i<arr.length-1?"1px solid #f8fafc":"none" }}>
                  <CourseThumb title={c.title} image={c.image} size={40} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                    <p style={{ fontSize:11, color:"#94a3b8" }}>{c.enrolled} students · {c.is_published?"Live":"Pending"}</p>
                  </div>
                  <p style={{ fontWeight:800, fontSize:15, color:NAVY, flexShrink:0 }}>
                    {c.price===0 ? <span style={{ color:"#94a3b8", fontWeight:500, fontSize:13 }}>Free</span> : `₦${(c.price*c.enrolled).toLocaleString()}`}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:12, display:"flex", gap:8 }}>
              <AlertCircle size={14} style={{ color:"#f59e0b", flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:12, color:"#92400e" }}>Earnings are estimates. Actual payouts depend on admin-confirmed bank transfer payments.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
