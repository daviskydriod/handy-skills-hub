// File: src/pages/dashboard/StudentDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Search, Award, CheckCircle,
  TrendingUp, Star, ArrowRight, RefreshCw, Play, Clock,
  Users, Bell, BarChart2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, enrollInCourse, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";

const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";
const BG    = "#f0f4f8";

type TabType = "overview" | "my-courses" | "explore";

/* ── helpers ── */
const UserAvatar = ({ name, size = 34 }: { name?: string; size?: number }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${TEAL},${NAVY})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:Math.round(size*0.38), flexShrink:0 }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

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

const ProgressBar = ({ pct }: { pct: number }) => (
  <div style={{ width:"100%", background:"#e2e8f0", borderRadius:99, height:6, overflow:"hidden" }}>
    <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${TEAL},${TEAL2})`, width:`${pct}%`, transition:"width .5s ease" }} />
  </div>
);

const SkeletonCard = () => (
  <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e8edf2", padding:16 }}>
    <div style={{ display:"flex", gap:12 }}>
      <div style={{ width:52, height:52, borderRadius:10, background:"#e8edf2", flexShrink:0 }} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ height:13, width:"70%", background:"#e8edf2", borderRadius:6 }} />
        <div style={{ height:10, width:"45%", background:"#f1f5f9", borderRadius:6 }} />
        <div style={{ height:6, width:"100%", background:"#f1f5f9", borderRadius:99, marginTop:4 }} />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
interface Props { defaultTab?: TabType; }

export default function StudentDashboard({ defaultTab = "overview" }: Props) {
  const { user, isAuthenticated } = useAuth();

  const [tab,         setTab]        = useState<TabType>(defaultTab);
  const [enrolled,    setEnrolled]   = useState<EnrolledCourse[]>([]);
  const [explore,     setExplore]    = useState<Course[]>([]);
  const [loadingE,    setLE]         = useState(true);
  const [loadingX,    setLX]         = useState(false);
  const [enrollingId, setEnrollingId]= useState<number | null>(null);
  const [search,      setSearch]     = useState("");

  const enrolledIds = new Set(enrolled.map(c => c.id));

  /* ── fetch enrolled ── */
  const fetchEnrolled = useCallback(async () => {
    setLE(true);
    try   { setEnrolled(await getMyEnrollments()); }
    catch { toast({ title:"Failed to load your courses", variant:"destructive" }); }
    finally { setLE(false); }
  }, []);

  /* ── fetch explore ── */
  const fetchExplore = useCallback(async () => {
    setLX(true);
    try   { const r = await getCourses({ limit:12 }); setExplore(r.courses); }
    catch { toast({ title:"Failed to load courses", variant:"destructive" }); }
    finally { setLX(false); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEnrolled(); fetchExplore();
  }, [isAuthenticated, fetchEnrolled, fetchExplore]);

  useEffect(() => {
    const fn = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        fetchEnrolled(); fetchExplore();
      }
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [isAuthenticated, fetchEnrolled, fetchExplore]);

  /* ── enroll ── */
  const handleEnroll = async (courseId: number, title: string) => {
    setEnrollingId(courseId);
    try {
      await enrollInCourse(courseId);
      toast({ title:`Enrolled in "${title}" ✅` });
      fetchEnrolled();
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Enrollment failed", variant:"destructive" });
    } finally { setEnrollingId(null); }
  };

  /* ── stats ── */
  const total      = enrolled.length;
  const completed  = enrolled.filter(c => c.completed).length;
  const inProgress = enrolled.filter(c => !c.completed && c.progress > 0).length;
  const avgProgress = total ? Math.round(enrolled.reduce((a,c) => a+c.progress, 0)/total) : 0;

  const filteredExplore = explore.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: TabType; label: string }[] = [
    { key:"overview",   label:"Overview" },
    { key:"my-courses", label:"My Courses" },
    { key:"explore",    label:"Explore" },
  ];

  /* ══ RENDER ══ */
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .card{background:#fff;border-radius:16px;border:1px solid #e8edf2;}
        .btnt{background:linear-gradient(135deg,${TEAL},${TEAL2});color:#fff;border:none;border-radius:99px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;display:inline-flex;align-items:center;gap:6px;}
        .btnt:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(13,148,136,.3);}
        .btnt:disabled{opacity:.6;transform:none;}
        .ntab{border:none;cursor:pointer;font-family:inherit;border-radius:10px;transition:all .15s;font-weight:700;padding:9px 18px;font-size:13px;}
        .ntab.on{background:${NAVY};color:#fff;box-shadow:0 2px 8px rgba(11,31,58,.2);}
        .ntab:not(.on){background:transparent;color:#64748b;}
        .ntab:not(.on):hover{background:#f1f5f9;color:#334155;}
        .ccard{background:#fff;border-radius:16px;border:1px solid #e8edf2;transition:all .25s;overflow:hidden;}
        .ccard:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.08);}
        @media(max-width:900px){
          .g4{grid-template-columns:repeat(2,1fr)!important;}
          .g3{grid-template-columns:repeat(2,1fr)!important;}
          .hm{display:none!important;}
        }
        @media(max-width:560px){
          .g4{grid-template-columns:repeat(2,1fr)!important;}
          .g3{grid-template-columns:1fr!important;}
          .nav-name{display:none!important;}
          .tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
          .enrolled-row-thumb{display:none!important;}
          .enrolled-ring{display:none!important;}
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
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:99, background:"#3b82f615", color:"#3b82f6", border:"1px solid #3b82f630" }}>Student</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", padding:8, borderRadius:8, color:"#64748b" }}><Bell size={18}/></button>
            <UserAvatar name={user?.name} size={34} />
            <span className="nav-name" style={{ fontSize:13, fontWeight:600, color:NAVY }}>{user?.name}</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px" }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }} className="g4">
          {[
            { label:"Total Enrolled",  value:loadingE?"—":total,             icon:BookOpen,    color:TEAL,      bg:TEAL+"15" },
            { label:"Completed",       value:loadingE?"—":completed,          icon:CheckCircle, color:"#10b981", bg:"#10b98115" },
            { label:"In Progress",     value:loadingE?"—":inProgress,         icon:TrendingUp,  color:"#3b82f6", bg:"#3b82f615" },
            { label:"Avg Progress",    value:loadingE?"—":`${avgProgress}%`,  icon:BarChart2,   color:"#8b5cf6", bg:"#8b5cf615" },
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
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)} className={`ntab${tab === key ? " on" : ""}`}>{label}</button>
            ))}
          </div>
        </div>

        {/* ════════ OVERVIEW ════════ */}
        {tab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {/* welcome */}
            <div style={{ background:`linear-gradient(135deg,${NAVY},#0f2d56)`, borderRadius:18, padding:"22px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:"#fff", marginBottom:4 }}>
                  Welcome back, {user?.name?.split(" ")[0] ?? "Student"}! 👋
                </h2>
                <p style={{ color:"rgba(255,255,255,.65)", fontSize:13 }}>Pick up where you left off.</p>
              </div>
              <button onClick={() => { fetchEnrolled(); fetchExplore(); }} style={{ background:"rgba(255,255,255,.12)", border:"none", borderRadius:99, padding:"8px 16px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {/* continue learning */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:NAVY }}>Continue Learning</h2>
                <button onClick={() => setTab("my-courses")} style={{ background:"none", border:"none", cursor:"pointer", color:TEAL2, fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:4, fontFamily:"inherit" }}>
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {loadingE ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
                  {[1,2,3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : enrolled.filter(c => !c.completed).length === 0 ? (
                <div className="card" style={{ padding:"48px 24px", textAlign:"center" }}>
                  <BookOpen size={32} style={{ color:"#cbd5e1", margin:"0 auto 10px" }} />
                  <p style={{ color:"#94a3b8", fontSize:13 }}>No courses in progress yet.</p>
                  <button onClick={() => setTab("explore")} style={{ background:"none", border:"none", cursor:"pointer", color:TEAL2, fontWeight:700, fontSize:13, fontFamily:"inherit", marginTop:8 }}>Browse courses →</button>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
                  {enrolled.filter(c => !c.completed).slice(0,3).map(c => (
                    <div key={c.id} className="ccard">
                      <div style={{ padding:16 }}>
                        <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                          <CourseThumb title={c.title} image={c.image} size={52} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontWeight:700, fontSize:13, color:NAVY, lineHeight:1.3, marginBottom:3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" } as any}>{c.title}</p>
                            <p style={{ fontSize:11, color:"#94a3b8" }}>by {c.instructor}</p>
                          </div>
                        </div>
                        <ProgressBar pct={c.progress} />
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                          <span style={{ fontSize:11, color:"#94a3b8" }}>{c.progress}% complete</span>
                          <Link to={`/courses/${c.id}`} style={{ background:"none", border:`1px solid ${TEAL}`, color:TEAL, borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:700, textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                            <Play size={9} /> Continue
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* completed */}
            {enrolled.filter(c => c.completed).length > 0 && (
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:NAVY, marginBottom:14 }}>Completed Courses 🎉</h2>
                <div className="card" style={{ overflow:"hidden" }}>
                  {enrolled.filter(c => c.completed).map((c, i, arr) => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:i<arr.length-1?"1px solid #f1f5f9":"none" }}>
                      <CourseThumb title={c.title} image={c.image} size={40} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, fontSize:13, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                        <p style={{ fontSize:11, color:"#94a3b8" }}>by {c.instructor}</p>
                      </div>
                      <span style={{ background:"#d1fae5", color:"#065f46", border:"1px solid #a7f3d0", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99, flexShrink:0 }}>✓ Done</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* suggested */}
            {explore.filter(c => !enrolledIds.has(c.id)).length > 0 && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:NAVY }}>Suggested for You</h2>
                  <button onClick={() => setTab("explore")} style={{ background:"none", border:"none", cursor:"pointer", color:TEAL2, fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:4, fontFamily:"inherit" }}>
                    See all <ArrowRight size={12} />
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }} className="g3">
                  {explore.filter(c => !enrolledIds.has(c.id)).slice(0,3).map(c => (
                    <div key={c.id} className="ccard">
                      <div style={{ height:110, background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                        <CourseThumb title={c.title} image={c.image} size={56} />
                        <span style={{ position:"absolute", top:10, left:10, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:TEAL, color:"#fff" }}>{c.category}</span>
                      </div>
                      <div style={{ padding:14 }}>
                        <p style={{ fontWeight:700, fontSize:13, color:NAVY, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                        <p style={{ fontSize:11, color:"#94a3b8", marginBottom:12 }}>by {c.instructor}</p>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontWeight:800, fontSize:15, color:c.price===0?"#10b981":NAVY }}>
                            {c.price===0 ? "Free" : `₦${c.price.toLocaleString()}`}
                          </span>
                          <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId===c.id} className="btnt" style={{ padding:"7px 16px", fontSize:11 }}>
                            {enrollingId===c.id ? "…" : "Enroll"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ MY COURSES ════════ */}
        {tab === "my-courses" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:NAVY }}>My Courses</h2>
                <p style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>{total} course{total!==1?"s":""} enrolled</p>
              </div>
            </div>
            {loadingE ? (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
            ) : enrolled.length === 0 ? (
              <div className="card" style={{ padding:"64px 24px", textAlign:"center" }}>
                <BookOpen size={40} style={{ color:"#cbd5e1", margin:"0 auto 12px" }} />
                <p style={{ color:"#94a3b8", marginBottom:16 }}>You haven't enrolled in any courses yet.</p>
                <button onClick={() => setTab("explore")} className="btnt" style={{ padding:"10px 24px", fontSize:13 }}>Browse Courses</button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {enrolled.map(c => (
                  <div key={c.id} className="card" style={{ padding:16, display:"flex", gap:14, alignItems:"center" }}>
                    <div className="enrolled-row-thumb"><CourseThumb title={c.title} image={c.image} size={58} /></div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                        <p style={{ fontWeight:700, fontSize:14, color:NAVY }}>{c.title}</p>
                        <span style={{ background:c.completed?"#d1fae5":"#fef3c7", color:c.completed?"#065f46":"#92400e", border:`1px solid ${c.completed?"#a7f3d0":"#fde68a"}`, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>
                          {c.completed ? "Completed" : "Active"}
                        </span>
                      </div>
                      <p style={{ fontSize:11, color:"#94a3b8", marginBottom:10 }}>by {c.instructor} · {c.category}</p>
                      <ProgressBar pct={c.progress} />
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                        <span style={{ fontSize:11, color:"#94a3b8" }}>{c.progress}% complete</span>
                        <span style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>{c.completed ? "✓ Finished" : `${100-c.progress}% left`}</span>
                      </div>
                    </div>
                    <div className="enrolled-ring" style={{ flexShrink:0, position:"relative", width:48, height:48 }}>
                      <svg width="48" height="48" style={{ transform:"rotate(-90deg)" }}>
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke={TEAL} strokeWidth="5"
                          strokeDasharray={`${(c.progress/100)*(2*Math.PI*20)} ${2*Math.PI*20}`} strokeLinecap="round" />
                      </svg>
                      <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:NAVY }}>{c.progress}%</span>
                    </div>
                    <Link to={`/courses/${c.id}`} style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${TEAL},${TEAL2})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, textDecoration:"none" }}>
                      <Play size={14} color="#fff" style={{ marginLeft:1 }} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ EXPLORE ════════ */}
        {tab === "explore" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:NAVY }}>Explore Courses</h2>
                <p style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>{filteredExplore.length} courses available</p>
              </div>
            </div>
            <div style={{ position:"relative", marginBottom:20 }}>
              <Search size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or category…"
                style={{ width:"100%", paddingLeft:42, paddingRight:14, paddingTop:11, paddingBottom:11, borderRadius:12, border:"1.5px solid #e2e8f0", background:"#fff", fontSize:13, outline:"none", fontFamily:"inherit", color:NAVY, transition:"border-color .2s" }}
                onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
                onBlur={e  => (e.currentTarget.style.borderColor = "#e2e8f0")} />
            </div>
            {loadingX ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredExplore.length === 0 ? (
              <div className="card" style={{ padding:"64px 24px", textAlign:"center" }}>
                <Search size={28} style={{ color:"#cbd5e1", margin:"0 auto 10px" }} />
                <p style={{ color:"#94a3b8" }}>No courses match your search.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
                {filteredExplore.map(c => {
                  const isEnrolled = enrolledIds.has(c.id);
                  return (
                    <div key={c.id} className="ccard">
                      <div style={{ height:140, background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                        <CourseThumb title={c.title} image={c.image} size={64} />
                        <span style={{ position:"absolute", top:10, left:10, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:TEAL, color:"#fff", textTransform:"uppercase" }}>{c.category}</span>
                        {isEnrolled && (
                          <span style={{ position:"absolute", top:10, right:10, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:"#10b981", color:"#fff" }}>Enrolled</span>
                        )}
                      </div>
                      <div style={{ padding:16 }}>
                        <h3 style={{ fontWeight:700, fontSize:13, color:NAVY, marginBottom:4, lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" } as any}>{c.title}</h3>
                        <p style={{ fontSize:11, color:"#94a3b8", marginBottom:10 }}>by {c.instructor}</p>
                        <div style={{ display:"flex", gap:12, fontSize:11, color:"#94a3b8", marginBottom:10 }}>
                          <span style={{ display:"flex", alignItems:"center", gap:3 }}><Clock size={10}/>{c.duration ?? "—"}</span>
                          <span style={{ display:"flex", alignItems:"center", gap:3 }}><BookOpen size={10}/>{c.lessons} lessons</span>
                          <span style={{ display:"flex", alignItems:"center", gap:3 }}><Users size={10}/>{c.enrolled}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:12 }}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={11} style={{ fill:i<=Math.floor(c.rating)?"#f59e0b":"#e2e8f0", color:i<=Math.floor(c.rating)?"#f59e0b":"#e2e8f0" }} />)}
                          <span style={{ fontSize:11, color:"#64748b", fontWeight:600, marginLeft:3 }}>{c.rating.toFixed(1)}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid #f1f5f9" }}>
                          <div>
                            <p style={{ fontWeight:800, fontSize:16, color:c.price===0?"#10b981":NAVY }}>
                              {c.price===0 ? "Free" : `₦${c.price.toLocaleString()}`}
                            </p>
                            {c.price>0 && <p style={{ fontSize:10, color:"#94a3b8" }}>one-time</p>}
                          </div>
                          {isEnrolled ? (
                            <Link to={`/courses/${c.id}`} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"8px 14px", borderRadius:99, background:"#d1fae5", color:"#065f46", border:"1px solid #a7f3d0", textDecoration:"none" }}>
                              <Play size={10}/> Continue
                            </Link>
                          ) : (
                            <button onClick={() => handleEnroll(c.id, c.title)} disabled={enrollingId===c.id} className="btnt" style={{ padding:"8px 16px", fontSize:11 }}>
                              {enrollingId===c.id ? "Enrolling…" : "Enroll Now"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
