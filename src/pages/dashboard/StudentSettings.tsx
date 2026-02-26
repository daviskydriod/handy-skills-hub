// File: src/pages/dashboard/StudentSettings.tsx

import { useState } from "react";
import {
  LayoutDashboard, BookOpen, Search, Award, User, Settings,
  Bell, Lock, Shield, Trash2, Eye, EyeOff, Save, AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import client from "@/api/client";

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

/* ── Toggle switch ──────────────────────────────────────── */
const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
    style={{ background: on ? `linear-gradient(135deg,${GOLD},${GOLD2})` : "#e2e8f0" }}>
    <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
      style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
  </button>
);

/* ── Section wrapper ────────────────────────────────────── */
const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e8edf2" }}>
    <div className="px-6 py-4 flex items-center gap-3"
      style={{ borderBottom: "1px solid #f1f5f9" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${GOLD}18` }}>
        <Icon size={15} style={{ color: GOLD2 }} />
      </div>
      <h3 className="font-bold text-base" style={{ color: NAVY }}>{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ── Setting row ────────────────────────────────────────── */
const SettingRow = ({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-start justify-between gap-4 py-3"
    style={{ borderBottom: "1px solid #f8fafc" }}>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold" style={{ color: NAVY }}>{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </div>
    <Toggle on={checked} onChange={onChange} />
  </div>
);

/* ════════════════════════════════════════════════════════ */
export default function StudentSettings() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  /* notifications */
  const [notifs, setNotifs] = useState({
    email_enroll:    true,
    email_progress:  false,
    email_promo:     false,
    browser_updates: true,
  });
  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [key]: !n[key] }));

  /* password */
  const [pwForm,    setPwForm]    = useState({ current: "", next: "", confirm: "" });
  const [showPw,    setShowPw]    = useState({ current: false, next: false, confirm: false });
  const [savingPw,  setSavingPw]  = useState(false);

  const setPw = (k: keyof typeof pwForm) => (v: string) =>
    setPwForm(f => ({ ...f, [k]: v }));
  const toggleShow = (k: keyof typeof showPw) =>
    setShowPw(s => ({ ...s, [k]: !s[k] }));

  const handleChangePw = async () => {
    if (!pwForm.current || !pwForm.next) {
      toast({ title: "Fill in all password fields", variant: "destructive" }); return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast({ title: "New passwords don't match", variant: "destructive" }); return;
    }
    if (pwForm.next.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return;
    }
    setSavingPw(true);
    try {
      await client.put(`/users/${user?.id}/password`, {
        current_password: pwForm.current,
        new_password:     pwForm.next,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      toast({ title: "Password updated ✅" });
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Failed to update password", variant: "destructive" });
    } finally { setSavingPw(false); }
  };

  /* delete account */
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast({ title: 'Type "DELETE" to confirm', variant: "destructive" }); return;
    }
    try {
      await client.delete(`/users/${user?.id}`);
      logout();
      navigate("/");
      toast({ title: "Account deleted" });
    } catch {
      toast({ title: "Failed to delete account", variant: "destructive" });
    }
  };

  /* pw field */
  const PwField = ({ label, fkey }: { label: string; fkey: keyof typeof pwForm }) => (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: NAVY }}>{label}</label>
      <div className="relative">
        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={showPw[fkey] ? "text" : "password"}
          value={pwForm[fkey]} onChange={e => setPw(fkey)(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all"
          style={{ border: "1px solid #e2e8f0" }}
          onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
          onBlur={e  => (e.currentTarget.style.borderColor = "#e2e8f0")} />
        <button type="button" onClick={() => toggleShow(fkey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {showPw[fkey] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout items={sidebarItems} title="Student Portal" userName={user?.name ?? "Student"}>

      <div className="max-w-2xl space-y-5">

        {/* ── Notifications ────────────────────────────── */}
        <Section title="Notifications" icon={Bell}>
          <SettingRow
            label="Enrollment Confirmation"
            description="Get an email when you enrol in a course"
            checked={notifs.email_enroll}
            onChange={() => toggleNotif("email_enroll")} />
          <SettingRow
            label="Progress Reminders"
            description="Weekly reminder emails to keep you on track"
            checked={notifs.email_progress}
            onChange={() => toggleNotif("email_progress")} />
          <SettingRow
            label="Promotions & New Courses"
            description="Be the first to know about new courses and offers"
            checked={notifs.email_promo}
            onChange={() => toggleNotif("email_promo")} />
          <SettingRow
            label="Browser Notifications"
            description="Push notifications in your browser"
            checked={notifs.browser_updates}
            onChange={() => toggleNotif("browser_updates")} />
          <div className="pt-3">
            <button onClick={() => toast({ title: "Notification preferences saved ✅" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
              <Save size={13} /> Save Preferences
            </button>
          </div>
        </Section>

        {/* ── Password ─────────────────────────────────── */}
        <Section title="Change Password" icon={Lock}>
          <div className="space-y-4">
            <PwField label="Current Password"  fkey="current" />
            <PwField label="New Password"       fkey="next"    />
            <PwField label="Confirm New Password" fkey="confirm" />
            <div className="pt-1">
              <button onClick={handleChangePw} disabled={savingPw}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
                {savingPw
                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <Shield size={13} />}
                {savingPw ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </Section>

        {/* ── Privacy ──────────────────────────────────── */}
        <Section title="Privacy" icon={Shield}>
          <div className="space-y-3">
            {[
              { label: "Show my profile to instructors", desc: "Instructors can see your name and progress", on: true },
              { label: "Allow course recommendations",   desc: "Personalised suggestions based on activity",  on: true },
            ].map(({ label, desc, on }) => {
              const [val, setVal] = useState(on);
              return (
                <SettingRow key={label} label={label} description={desc}
                  checked={val} onChange={() => setVal(v => !v)} />
              );
            })}
          </div>
        </Section>

        {/* ── Danger zone ──────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #fecaca" }}>
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid #fef2f2", background: "#fff5f5" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
              <AlertTriangle size={15} className="text-red-500" />
            </div>
            <h3 className="font-bold text-base text-red-700">Danger Zone</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">
              Permanently delete your account and all associated data. This action <strong className="text-red-600">cannot be undone</strong>.
            </p>
            <div className="mb-3">
              <label className="block text-xs font-bold mb-1.5 text-red-700">
                Type <code className="bg-red-50 px-1.5 py-0.5 rounded text-red-600">DELETE</code> to confirm
              </label>
              <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all"
                style={{ border: "1px solid #fecaca" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#f87171")}
                onBlur={e  => (e.currentTarget.style.borderColor = "#fecaca")} />
            </div>
            <button onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
              style={{ background: "#ef4444", color: "#fff" }}>
              <Trash2 size={13} /> Delete My Account
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
