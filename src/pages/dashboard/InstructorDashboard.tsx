import { LayoutDashboard, BookOpen, PlusCircle, Users, DollarSign, User } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { dashboardStats, courses } from "@/data/mockData";

const sidebarItems = [
  { label: "Dashboard", to: "/instructor", icon: <LayoutDashboard size={18} /> },
  { label: "My Courses", to: "/instructor/courses", icon: <BookOpen size={18} /> },
  { label: "Add Course", to: "/instructor/add-course", icon: <PlusCircle size={18} /> },
  { label: "Students", to: "/instructor/students", icon: <Users size={18} /> },
  { label: "Earnings", to: "/instructor/earnings", icon: <DollarSign size={18} /> },
  { label: "Profile", to: "/instructor/profile", icon: <User size={18} /> },
];

export default function InstructorDashboard() {
  const stats = dashboardStats.instructor;

  return (
    <DashboardLayout items={sidebarItems} title="Instructor Portal" userName="Adebayo Tunde">
      <h1 className="font-heading font-bold text-xl md:text-2xl mb-6 text-foreground">Instructor Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Courses", value: stats.totalCourses },
          { label: "Total Students", value: stats.totalStudents.toLocaleString() },
          { label: "Total Earnings", value: `₦${stats.totalEarnings.toLocaleString()}` },
          { label: "Avg Rating", value: stats.avgRating },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="font-heading font-bold text-xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-heading font-semibold text-lg mb-4 text-foreground">Your Courses</h2>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground">Course</th>
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground hidden sm:table-cell">Students</th>
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground hidden md:table-cell">Rating</th>
              <th className="px-4 py-3 font-heading font-semibold text-muted-foreground">Price</th>
            </tr>
          </thead>
          <tbody>
            {courses.slice(0, 5).map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{c.title}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.enrolled}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.rating}</td>
                <td className="px-4 py-3 text-foreground font-medium">₦{c.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
