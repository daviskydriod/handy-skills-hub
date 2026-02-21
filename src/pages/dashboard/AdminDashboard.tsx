import { LayoutDashboard, Users, BookOpen, FileText, Briefcase, Settings } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { dashboardStats, courses } from "@/data/mockData";

const sidebarItems = [
  { label: "Dashboard", to: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Users", to: "/admin/users", icon: <Users size={18} /> },
  { label: "Courses", to: "/admin/courses", icon: <BookOpen size={18} /> },
  { label: "Blog", to: "/admin/blog", icon: <FileText size={18} /> },
  { label: "Applications", to: "/admin/applications", icon: <Briefcase size={18} /> },
  { label: "Settings", to: "/admin/settings", icon: <Settings size={18} /> },
];

export default function AdminDashboard() {
  const stats = dashboardStats.admin;

  return (
    <DashboardLayout items={sidebarItems} title="Admin Panel" userName="Admin">
      <h1 className="font-heading font-bold text-xl md:text-2xl mb-6 text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString() },
          { label: "Total Courses", value: stats.totalCourses },
          { label: "Revenue", value: `₦${stats.totalRevenue.toLocaleString()}` },
          { label: "New Signups", value: stats.newSignups },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="font-heading font-bold text-xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4 text-foreground">Recent Signups</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {["Chioma Eze", "Emeka Obi", "Fatima Bello", "Gbenga Adeyemi", "Halima Yusuf"].map((name, i) => (
              <div key={name} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={`https://picsum.photos/seed/user${i}/32/32`} alt="" className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">Joined today</p>
                  </div>
                </div>
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Student</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading font-semibold text-lg mb-4 text-foreground">Recent Enrollments</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {courses.slice(0, 5).map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-foreground">{c.title}</p>
                <span className="text-xs text-muted-foreground">{c.enrolled} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
