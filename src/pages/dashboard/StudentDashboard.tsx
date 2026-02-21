import { LayoutDashboard, BookOpen, Search, Award, User, Settings } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalyticsWidget from "@/components/AnalyticsWidget";
import { dashboardStats, courses } from "@/data/mockData";

const sidebarItems = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "My Courses", to: "/dashboard/my-courses", icon: <BookOpen size={18} /> },
  { label: "Explore Courses", to: "/dashboard/explore", icon: <Search size={18} /> },
  { label: "Certificates", to: "/dashboard/certificates", icon: <Award size={18} /> },
  { label: "Profile", to: "/dashboard/profile", icon: <User size={18} /> },
  { label: "Settings", to: "/dashboard/settings", icon: <Settings size={18} /> },
];

export default function StudentDashboard() {
  const stats = dashboardStats.student;

  return (
    <DashboardLayout items={sidebarItems} title="Student Portal" userName="Amina Bakare">
      <div className="gradient-accent rounded-xl p-6 mb-6 text-accent-foreground">
        <h1 className="font-heading font-bold text-xl md:text-2xl mb-1">Welcome back, Amina! 👋</h1>
        <p className="text-sm opacity-90">Continue your learning journey today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Courses Enrolled", value: stats.coursesEnrolled, color: "text-accent" },
          { label: "Completed", value: stats.completed, color: "text-accent" },
          { label: "Certificates", value: stats.certificates, color: "text-accent" },
          { label: "Hours Learned", value: stats.hoursLearned, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`font-heading font-bold text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <AnalyticsWidget />

      <h2 className="font-heading font-semibold text-lg mb-4 text-foreground">Recently Accessed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.slice(0, 3).map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <img src={c.image} alt={c.title} className="w-full aspect-video object-cover" />
            <div className="p-4">
              <h3 className="font-heading font-semibold text-sm mb-2 text-card-foreground">{c.title}</h3>
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div className="gradient-accent h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
