import { useParams, Link } from "react-router-dom";
import { Star, Clock, BookOpen, Users, PlayCircle, FileText, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { courses } from "@/data/mockData";

export default function CourseDetail() {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id) || courses[0];

  const curriculum = [
    { module: "Module 1: Introduction", lessons: ["Welcome & Course Overview", "Setting Up Your Environment", "Understanding the Basics"] },
    { module: "Module 2: Core Concepts", lessons: ["Fundamental Principles", "Hands-On Practice", "Real-World Applications"] },
    { module: "Module 3: Advanced Topics", lessons: ["Advanced Techniques", "Industry Best Practices", "Final Project"] },
  ];

  return (
    <MainLayout>
      <section className="gradient-primary text-primary-foreground py-10 md:py-16">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <span className="text-accent text-xs font-medium uppercase tracking-wider">{course.category}</span>
              <h1 className="font-heading font-bold text-2xl md:text-4xl mt-2 mb-4">{course.title}</h1>
              <p className="opacity-80 text-sm md:text-base mb-4">
                Master practical skills with hands-on projects, expert instruction, and real-world applications that prepare you for success.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
                <span className="flex items-center gap-1"><Star size={14} className="text-accent fill-accent" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {course.enrolled} enrolled</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> {course.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <img src={`https://picsum.photos/seed/${course.instructor}/40/40`} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-sm">Instructor: <strong>{course.instructor}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start bg-secondary mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <h3 className="font-heading font-semibold text-lg mb-3 text-foreground">About This Course</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This comprehensive course covers everything you need to know to master {course.title.toLowerCase()}. You'll work on real-world projects, learn from industry experts, and build a portfolio that showcases your skills.
                </p>
                <h4 className="font-heading font-semibold mb-2 text-foreground">What You'll Learn</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {["Core fundamentals and theory", "Hands-on practical skills", "Industry best practices", "Portfolio-ready projects", "Professional workflows", "Real-world applications"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="curriculum">
                <div className="space-y-4">
                  {curriculum.map((mod, i) => (
                    <div key={i} className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-secondary px-4 py-3 font-heading font-semibold text-sm text-secondary-foreground">{mod.module}</div>
                      <div className="divide-y divide-border">
                        {mod.lessons.map((lesson, j) => (
                          <div key={j} className="px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <PlayCircle size={14} className="text-accent shrink-0" />
                            {lesson}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructor">
                <div className="flex items-start gap-4">
                  <img src={`https://picsum.photos/seed/${course.instructor}/100/100`} alt="" className="w-20 h-20 rounded-full" />
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{course.instructor}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Expert instructor with years of industry experience. Passionate about teaching practical skills and helping students succeed.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this course!</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <img src={course.image} alt="" className="w-full rounded-lg mb-4 aspect-video object-cover" />
              <p className="font-heading font-bold text-2xl text-foreground mb-4">₦{course.price.toLocaleString()}</p>
              <Button className="w-full gradient-accent text-accent-foreground border-0 mb-3" size="lg">
                Enroll Now
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link to="/courses">Back to Courses</Link>
              </Button>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p className="font-heading font-semibold text-foreground text-xs uppercase">This course includes:</p>
                {[
                  { icon: PlayCircle, text: `${course.duration} of video content` },
                  { icon: FileText, text: "Downloadable resources" },
                  { icon: Award, text: "Certificate of completion" },
                  { icon: Clock, text: "Lifetime access" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <item.icon size={14} className="text-accent" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
