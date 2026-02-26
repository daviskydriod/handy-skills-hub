// File: src/pages/dashboard/Profile.tsx

import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, Search, Award, User, Settings,
  Camera, Save, Mail, Phone, MapPin, Briefcase, Edit3, CheckCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
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

const Field = ({
  label, value, onChange, type = "text", placeholder = "", icon: Icon, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon: any; disabled?: boolean;
}) => (
  <div>
    <label className="block text-xs font-bold mb-1.5" style={{ color: NAVY }}>{label}</label>
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
        style={{ border: "1px solid #e2e8f0" }}
        onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = GOLD; }}
        onBlur={e  => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
      />
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════ */
export default function Profile() {
  const { user, isAuthenticated } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    phone:    "",
    location: "",
    bio:      "",
    job:      "",
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name:  user.name  ?? "",
        email: user.email ?? "",
      }));
    }
  }, [user]);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put(`/users/${user?.id}`, {
        name:  form.name,
        phone: form.phone,
      });
      setSaved(true);
      setEditing(false);
      toast({ title: "Profile updated ✅" });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const initial = (user?.name ?? "U").charAt(0).toUpperCase();

  return (
    <DashboardLayout items={sidebarItems} title="Student Portal" userName={user?.name ?? "Student"}>

      <div className="max-w-3xl">

        {/* ── Profile hero ───────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6"
          style={{ border: "1px solid #e8edf2" }}>

          {/* Banner */}
          <div className="h-28 relative"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2d56 100%)` }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #EAB308 0%, transparent 50%), radial-gradient(circle at 80% 20%, #EAB308 0%, transparent 40%)" }} />
          </div>

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-extrabold text-3xl border-4 border-white shadow-lg"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
                  {initial}
                </div>
                {editing && (
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: NAVY }}
                    onClick={() => toast({ title: "Avatar upload coming soon" })}>
                    <Camera size={12} className="text-white" />
                  </button>
                )}
              </div>

              {/* Edit / Save button */}
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:border-slate-300 transition-all">
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: NAVY }}>
                    {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Save size={13} />}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-extrabold text-xl" style={{ color: NAVY }}>{user?.name}</h2>
              {saved && <CheckCircle size={16} className="text-emerald-500" />}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                style={{ background: `${GOLD}18`, color: GOLD2 }}>
                {user?.role ?? "Student"}
              </span>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* ── Form sections ──────────────────────────────── */}
        <div className="space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e8edf2" }}>
            <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name"    value={form.name}     onChange={set("name")}     icon={User}     placeholder="Your full name"     disabled={!editing} />
              <Field label="Email"        value={form.email}    onChange={set("email")}    icon={Mail}     placeholder="your@email.com"     disabled={true}     />
              <Field label="Phone"        value={form.phone}    onChange={set("phone")}    icon={Phone}    placeholder="+234 xxx xxxx xxx"  disabled={!editing} />
              <Field label="Location"     value={form.location} onChange={set("location")} icon={MapPin}   placeholder="City, Country"      disabled={!editing} />
            </div>
          </div>

          {/* Professional */}
          <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e8edf2" }}>
            <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Professional Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field label="Job Title / Occupation" value={form.job} onChange={set("job")} icon={Briefcase} placeholder="e.g. Software Developer" disabled={!editing} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: NAVY }}>Bio</label>
              <textarea
                value={form.bio} onChange={(e) => set("bio")(e.target.value)}
                disabled={!editing} rows={4}
                placeholder="Tell us a bit about yourself…"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-400"
                style={{ border: "1px solid #e2e8f0" }}
                onFocus={e => { if (!editing) return; e.currentTarget.style.borderColor = GOLD; }}
                onBlur={e  => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              />
            </div>
          </div>

          {/* Account info — read only */}
          <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e8edf2" }}>
            <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Account Details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Role",       value: user?.role ?? "student" },
                { label: "User ID",    value: `#${user?.id ?? "—"}` },
                { label: "Account",    value: "Active" },
                { label: "Member Since", value: "2024" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl px-4 py-3"
                  style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{label}</p>
                  <p className="text-sm font-semibold mt-0.5 capitalize" style={{ color: NAVY }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
