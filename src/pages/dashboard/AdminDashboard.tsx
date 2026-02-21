import { useState } from "react";
import { LayoutDashboard, Users, BookOpen, FileText, Briefcase, Settings, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { dashboardStats, courses } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const sidebarItems = [
  { label: "Dashboard", to: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Users", to: "/admin/users", icon: <Users size={18} /> },
  { label: "Courses", to: "/admin/courses", icon: <BookOpen size={18} /> },
  { label: "Blog", to: "/admin/blog", icon: <FileText size={18} /> },
  { label: "Applications", to: "/admin/applications", icon: <Briefcase size={18} /> },
  { label: "Settings", to: "/admin/settings", icon: <Settings size={18} /> },
];

type CourseStatus = "pending" | "approved" | "rejected";

export default function AdminDashboard() {
  const stats = dashboardStats.admin;
  const [courseStatuses, setCourseStatuses] = useState<Record<string, CourseStatus>>(() => {
    const s: Record<string, CourseStatus> = {};
    courses.forEach((c, i) => { s[c.id] = i < 3 ? "pending" : "approved"; });
    return s;
  });

  const handleAction = (courseId: string, action: CourseStatus) => {
    setCourseStatuses((prev) => ({ ...prev, [courseId]: action }));
    toast({
      title: action === "approved" ? "Course Approved ✅" : "Course Rejected ❌",
      description: `Course has been ${action}.`,
    });
  };

  const statusBadge = (status: CourseStatus) => {
    const styles = {
      pending: "bg-warning/10 text-warning",
      approved: "bg-accent/10 text-accent",
      rejected: "bg-destructive/10 text-destructive",
    };
    const icons = { pending: Clock, approved: CheckCircle, rejected: XCircle };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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

      {/* Course Approval Section */}
      <h2 className="font-heading font-semibold text-lg mb-4 text-foreground">Course Submissions</h2>
      <div className="bg-card border border-border rounded-lg overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground">Course</th>
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground hidden sm:table-cell">Instructor</th>
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.slice(0, 6).map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{c.title}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.instructor}</td>
                <td className="px-4 py-3">{statusBadge(courseStatuses[c.id])}</td>
                <td className="px-4 py-3 text-right">
                  {courseStatuses[c.id] === "pending" ? (
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="text-xs h-7 border-accent text-accent hover:bg-accent hover:text-accent-foreground" onClick={() => handleAction(c.id, "approved")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleAction(c.id, "rejected")}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Student</span>
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
