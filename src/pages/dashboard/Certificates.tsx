// File: src/pages/dashboard/Certificates.tsx

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, BookOpen, Search, Award, User, Settings,
  Download, Share2, ExternalLink, CheckCircle, Calendar, Star,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, type EnrolledCourse } from "@/api/enrollments";

const NAVY  = "#0b1f3a";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

const sidebarItems = [
  { label: "Dashboard",       to: "/dashboard/student",      icon: <LayoutDashboard size={18} /> },
  { label: "My Courses",      to: "/dashboard/my-courses",   icon: <BookOpen size={18} /> },
  { label: "Explore Courses", to: "/dashboard/explore",      icon: <Search size={18} /> },
  { label: "Certificates",    to: "/dashboard/certificates", icon: <Award size={18} /> },
  { label: "Profile",         to: "/dashboard/profile",      icon: <User size={18} /> },
  { label: "Settings",        to: "/dashboard/settings",     icon: <Settings size={18} /> },
];

const Skeleton = ({ h = "h-10" }: { h?: string }) => (
  <div className={`${h} w-full rounded-xl bg-slate-200 animate-pulse`} />
);

/* ── Certificate Card ───────────────────────────────────── */
const CertCard = ({ course }: { course: EnrolledCourse }) => {
  const completedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const handleDownload = () => {
    toast({ title: "Certificate download coming soon!" });
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
      style={{ border: "1px solid #e8edf2" }}>

      {/* Certificate preview */}
      <div className="relative p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2d56 100%)` }}>

        {/* Decorative border */}
        <div className="absolute inset-3 rounded-xl pointer-events-none"
          style={{ border: `1px solid ${GOLD}40` }} />
        <div className="absolute inset-4 rounded-xl pointer-events-none"
          style={{ border: `1px dashed ${GOLD}20` }} />

        {/* Badge */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
          <Award size={24} style={{ color: NAVY }} />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: `${GOLD}99` }}>
          Certificate of Completion
        </p>
        <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2 px-2">
          {course.title}
        </h3>
        <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          HandyGidi Training Centre
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={10} style={{ fill: GOLD, color: GOLD }} />
          ))}
        </div>
      </div>

      {/* Info row */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">Instructor</p>
            <p className="text-sm font-bold" style={{ color: NAVY }}>{course.instructor}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Completed</p>
            <p className="text-sm font-bold" style={{ color: NAVY }}>{completedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
            <Download size={14} /> Download
          </button>
          <button onClick={() => toast({ title: "Share link copied!" })}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 hover:border-slate-300 transition-colors text-slate-500">
            <Share2 size={14} />
          </button>
          <button onClick={() => toast({ title: "Verify link copied!" })}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 hover:border-slate-300 transition-colors text-slate-500">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════ */
export default function Certificates() {
  const { user, isAuthenticated } = useAuth();
  const [enrolled, setEnrolled]   = useState<EnrolledCourse[]>([]);
  const [loading,  setLoading]    = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try   { setEnrolled(await getMyEnrollments()); }
    catch { toast({ title: "Failed to load certificates", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) fetch(); }, [isAuthenticated, fetch]);

  const completed = enrolled.filter((c) => c.completed);

  return (
    <DashboardLayout items={sidebarItems} title="Student Portal" userName={user?.name ?? "Student"}>

      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-xl" style={{ color: NAVY }}>My Certificates</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Download and share your earned certificates
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Certificates Earned", value: loading ? "—" : completed.length,          icon: Award,       color: GOLD      },
          { label: "Courses Enrolled",     value: loading ? "—" : enrolled.length,           icon: BookOpen,    color: "#3b82f6" },
          { label: "Completion Rate",      value: loading ? "—" : enrolled.length
              ? `${Math.round((completed.length / enrolled.length) * 100)}%` : "0%",          icon: CheckCircle, color: "#10b981" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3"
            style={{ border: "1px solid #e8edf2" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color + "18" }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-extrabold text-xl leading-tight" style={{ color: NAVY }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certificates grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <Skeleton key={i} h="h-80" />)}
        </div>
      ) : completed.length === 0 ? (
        <div className="bg-white rounded-2xl py-24 text-center" style={{ border: "1px solid #e8edf2" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `${GOLD}15` }}>
            <Award size={32} style={{ color: GOLD }} />
          </div>
          <h3 className="font-bold text-lg mb-2" style={{ color: NAVY }}>No certificates yet</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Complete a course to earn your first certificate and showcase your skills.
          </p>
          <a href="/dashboard/explore"
            className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-full text-sm font-extrabold transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
            Explore Courses
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {completed.map((c) => <CertCard key={c.id} course={c} />)}
        </div>
      )}

      {/* In-progress reminder */}
      {!loading && enrolled.filter(c => !c.completed).length > 0 && (
        <div className="mt-8 rounded-2xl p-5 flex items-center gap-4"
          style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${GOLD}20` }}>
            <Calendar size={18} style={{ color: GOLD2 }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: NAVY }}>
              {enrolled.filter(c => !c.completed).length} course{enrolled.filter(c => !c.completed).length > 1 ? "s" : ""} in progress
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete them to earn more certificates.
            </p>
          </div>
          <a href="/dashboard/my-courses"
            className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all hover:scale-105 shrink-0"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
            Continue →
          </a>
        </div>
      )}

    </DashboardLayout>
  );
}
