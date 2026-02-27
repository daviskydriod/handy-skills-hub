// File: src/pages/dashboard/StudentDashboard.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Search, CheckCircle, TrendingUp, ArrowRight,
  RefreshCw, Play, Clock, Users, Bell, BarChart2, Star,
  CreditCard, Upload, X, AlertCircle, Copy, Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, type EnrolledCourse } from "@/api/enrollments";
import { getCourses, type Course } from "@/api/courses";
import client from "@/api/client";

const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";

// ── Bank account details (update with client's real details) ──
const BANK_DETAILS = {
  bankName:      "First Bank Nigeria",
  accountNumber: "0123456789",
  accountName:   "HandyGidi Training Centre",
};

type TabType = "overview" | "my-courses" | "explore";

interface PaymentStatus {
  courseId: number;
  status: "idle" | "showBank" | "uploading" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

/* ── helpers ── */
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

/* ── Payment Flow Modal ── */
const PaymentModal = ({
  course,
  onClose,
  onSubmitted,
}: {
  course: Course;
  onClose: () => void;
  onSubmitted: () => void;
}) => {
  const [step, setStep]       = useState<"bank" | "upload" | "done">("bank");
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSub]  = useState(false);
  const [copied, setCopied]   = useState(false);
  const fileRef               = useRef<HTMLInputElement>(null);

  const copyAcct = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { toast({ title:"Please upload your payment receipt", variant:"destructive" }); return; }
    setSub(true);
    try {
      const fd = new FormData();
      fd.append("course_id", String(course.id));
      fd.append("amount", String(course.price));
      fd.append("proof_image", file);
      await client.post("/payments", fd);
      setStep("done");
      onSubmitted();
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Failed to submit payment", variant:"destructive" });
    } finally { setSub(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:20, padding:28, maxWidth:440, width:"100%", maxHeight:"90vh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:NAVY, marginBottom:3 }}>
              {step === "done" ? "Payment Submitted! 🎉" : "Enroll in Course"}
            </h3>
            <p style={{ fontSize:12, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:280 }}>{course.title}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:22, lineHeight:1 }}>×</button>
        </div>

        {/* ── STEP 1: Bank Details ── */}
        {step === "bank" && (
          <div>
            <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14, padding:18, marginBottom:18 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>
                Amount to Pay
              </p>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:28, color:NAVY, marginBottom:16 }}>
                ₦{course.price.toLocaleString()}
              </p>
              <div style={{ height:"1px", background:"#e2e8f0", marginBottom:16 }} />
              <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>
                Bank Transfer Details
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div>
                  <p style={{ fontSize:11, color:"#94a3b8", marginBottom:2 }}>Bank Name</p>
                  <p style={{ fontSize:14, fontWeight:700, color:NAVY }}>{BANK_DETAILS.bankName}</p>
                </div>
                <div>
                  <p style={{ fontSize:11, color:"#94a3b8", marginBottom:2 }}>Account Name</p>
                  <p style={{ fontSize:14, fontWeight:700, color:NAVY }}>{BANK_DETAILS.accountName}</p>
                </div>
                <div>
                  <p style={{ fontSize:11, color:"#94a3b8", marginBottom:4 }}>Account Number</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <p style={{ fontSize:20, fontWeight:800, color:NAVY, letterSpacing:2 }}>{BANK_DETAILS.accountNumber}</p>
                    <button onClick={copyAcct} style={{ background:copied?"#d1fae5":"#f1f5f9", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color:copied?"#065f46":"#64748b", transition:"all .2s" }}>
                      {copied ? <><Check size={11}/> Copied!</> : <><Copy size={11}/> Copy</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:12, display:"flex", gap:8, marginBottom:18 }}>
              <AlertCircle size={14} style={{ color:"#f59e0b", flexShrink:0, marginTop:1 }} />
              <p style={{ fontSize:12, color:"#92400e" }}>
                Make the transfer using your banking app, then take a screenshot of your payment receipt before clicking Next.
              </p>
            </div>

            <button
              onClick={() => setStep("upload")}
              style={{ width:"100%", padding:"12px", background:`linear-gradient(135deg,${TEAL},${TEAL2})`, color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}
            >
              I've Made the Transfer →
            </button>
          </div>
        )}

        {/* ── STEP 2: Upload Receipt ── */}
        {step === "upload" && (
          <div>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:18 }}>
              Upload a screenshot or photo of your payment receipt so we can verify your payment.
            </p>

            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileChange} />

            {!preview ? (
              <button
                onClick={() => fileRef.current?.click()}
                style={{ width:"100%", padding:"32px 16px", border:"2px dashed #cbd5e1", borderRadius:14, background:"#f8fafc", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginBottom:18 }}
              >
                <Upload size={28} style={{ color:"#94a3b8" }} />
                <p style={{ fontSize:13, fontWeight:600, color:"#64748b" }}>Tap to upload receipt</p>
                <p style={{ fontSize:11, color:"#94a3b8" }}>JPG, PNG — screenshot or photo</p>
              </button>
            ) : (
              <div style={{ position:"relative", marginBottom:18 }}>
                <img src={preview} alt="Receipt" style={{ width:"100%", borderRadius:12, border:"1px solid #e2e8f0", maxHeight:260, objectFit:"contain", background:"#f8fafc" }} />
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  style={{ position:"absolute", top:8, right:8, width:24, height:24, borderRadius:"50%", background:"#ef4444", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                >
                  <X size={12} color="#fff" />
                </button>
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button
                onClick={() => setStep("bank")}
                style={{ flex:1, padding:"11px", border:"1px solid #e2e8f0", borderRadius:12, background:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, fontSize:13, color:"#64748b" }}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file || submitting}
                style={{ flex:2, padding:"11px", background:file?`linear-gradient(135deg,${TEAL},${TEAL2})`:"#e2e8f0", color:file?"#fff":"#94a3b8", border:"none", borderRadius:12, fontWeight:700, fontSize:13, cursor:file?"pointer":"not-allowed", fontFamily:"inherit", transition:"all .2s" }}
              >
                {submitting ? "Submitting…" : "Submit for Approval"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === "done" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <CheckCircle size={30} style={{ color:"#065f46" }} />
            </div>
            <p style={{ fontSize:14, color:"#64748b", marginBottom:8, lineHeight:1.6 }}>
              Your payment receipt has been submitted. Our team will review it shortly.
            </p>
            <p style={{ fontSize:13, fontWeight:600, color:TEAL, marginBottom:24 }}>
              You'll receive an email once your enrollment is confirmed.
            </p>
            <button
              onClick={onClose}
              style={{ padding:"10px 28px", background:`linear-gradient(135deg,${TEAL},${TEAL2})`, color:"#fff", border:"none", borderRadius:99, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
            >
              Got it!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════ */
interface Props { defaultTab?: TabType; }

export default function StudentDashboard({ defaultTab = "overview" }: Props) {
  const { user, isAuthenticated } = useAuth();

  const [tab,          setTab]        = useState<TabType>(defaultTab);
  const [enrolled,     setEnrolled]   = useState<EnrolledCourse[]>([]);
  const [explore,      setExplore]    = useState<Course[]>([]);
  const [loadingE,     setLE]         = useState(true);
  const [loadingX,     setLX]         = useState(false);
  const [search,       setSearch]     = useState("");
  const [payingCourse, setPayingCourse] = useState<Course | null>(null);

  const enrolledIds = new Set(enrolled.map(c => c.id));

  const fetchEnrolled = useCallback(async () => {
    setLE(true);
    try   { setEnrolled(await getMyEnrollments()); }
    catch { toast({ title:"Failed to load your courses", variant:"destructive" }); }
    finally { setLE(false); }
  }, []);

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

  const total       = enrolled.length;
  const completed   = enrolled.filter(c => c.completed).length;
  const inProgress  = enrolled.filter(c => !c.completed && c.progress > 0).length;
  const avgProgress = total ? Math.round(enrolled.reduce((a,c) => a+c.progress, 0)/total) : 0;

  const filteredExplore = explore.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
   
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
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
        }
        @media(max-width:560px){
          .g4{grid-template-columns:repeat(2,1fr)!important;}
          .g3{grid-template-columns:1fr!important;}
          .tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
          .enrolled-row-thumb{display:none!important;}
          .enrolled-ring{display:none!important;}
        }
      `}</style>

      {/* Payment modal */}
      {payingCourse && (
        <PaymentModal
          course={payingCourse}
          onClose={() => setPayingCourse(null)}
          onSubmitted={() => { setPayingCourse(null); fetchEnrolled(); }}
        />
      )}

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px" }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }} className="g4">
          {[
            { label:"Enrolled",    value:loadingE?"—":total,           icon:BookOpen,    color:TEAL,      bg:TEAL+"15" },
            { label:"Completed",   value:loadingE?"—":completed,       icon:CheckCircle, color:"#10b981", bg:"#10b98115" },
            { label:"In Progress", value:loadingE?"—":inProgress,      icon:TrendingUp,  color:"#3b82f6", bg:"#3b82f615" },
            { label:"Avg Progress",value:loadingE?"—":`${avgProgress}%`,icon:BarChart2,  color:"#8b5cf6", bg:"#8b5cf615" },
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
            {([
              { key:"overview",   label:"Overview" },
              { key:"my-courses", label:"My Courses" },
              { key:"explore",    label:"Explore" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)} className={`ntab${tab===key?" on":""}`}>{label}</button>
            ))}
          </div>
        </div>

        {/* ════════ OVERVIEW ════════ */}
        {tab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {/* Welcome banner */}
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

            {/* Continue learning */}
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
                  <p style={{ color:"#94a3b8", fontSize:13 }}>No courses in progress.</p>
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

            {/* Suggested */}
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
                          <button onClick={() => setPayingCourse(c)} className="btnt" style={{ padding:"7px 16px", fontSize:11 }}>
                            Enroll
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
                style={{ width:"100%", paddingLeft:42, paddingRight:14, paddingTop:11, paddingBottom:11, borderRadius:12, border:"1.5px solid #e2e8f0", background:"#fff", fontSize:13, outline:"none", fontFamily:"inherit", color:NAVY }}
              />
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
                            {c.price>0 && <p style={{ fontSize:10, color:"#94a3b8" }}>bank transfer</p>}
                          </div>
                          {isEnrolled ? (
                            <Link to={`/courses/${c.id}`} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"8px 14px", borderRadius:99, background:"#d1fae5", color:"#065f46", border:"1px solid #a7f3d0", textDecoration:"none" }}>
                              <Play size={10}/> Continue
                            </Link>
                          ) : (
                            <button onClick={() => setPayingCourse(c)} className="btnt" style={{ padding:"8px 16px", fontSize:11 }}>
                              <CreditCard size={11}/> Enroll
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
