// File: frontend/src/pages/CourseDetail.tsx
// Fetches course data from the real PHP API via useCourse hook.

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Clock, BookOpen, Users, PlayCircle, FileText,
  Award, CheckCircle, MessageCircle, ArrowLeft, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import EnrollmentModal from '@/components/EnrollmentModal';
import { BUSINESS_INFO } from '@/data/mockData';   // business info only
import { useCourse } from '../hooks/useCourses';

const NAVY = '#0b1f3a';
const GOLD = '#EAB308';
const GOLD2 = '#CA8A04';

const curriculum = [
  { module: 'Module 1: Introduction',    lessons: ['Welcome & Course Overview', 'Setting Up Your Environment', 'Understanding the Basics'] },
  { module: 'Module 2: Core Concepts',   lessons: ['Fundamental Principles', 'Hands-On Practice', 'Real-World Applications'] },
  { module: 'Module 3: Advanced Topics', lessons: ['Advanced Techniques', 'Industry Best Practices', 'Final Project'] },
];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { course, isLoading, error } = useCourse(id);
  const [enrollOpen, setEnrollOpen] = useState(false);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
        </div>
      </MainLayout>
    );
  }

  /* ── Error / not found ── */
  if (error || !course) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-red-500 font-semibold text-lg">{error ?? 'Course not found'}</p>
          <Button asChild variant="outline">
            <Link to="/courses"><ArrowLeft size={14} className="mr-1" /> Back to Courses</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const whatsappEnroll = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(
    `Hello HandyGidi! I'm interested in the "${course.title}" course (₦${course.price.toLocaleString()}). Please send me enrollment details.`
  )}`;

  return (
    <MainLayout>
      {/* PAGE HEADER */}
      <section className="py-10 md:py-16 text-white"
        style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 60%,#0f2d56 100%)` }}>
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block"
                style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', color: GOLD }}>
                {course.category}
              </span>
              <h1 className="font-heading font-bold text-2xl md:text-4xl mt-2 mb-4">{course.title}</h1>
              <p className="opacity-80 text-sm md:text-base mb-4">
                {course.description ?? 'Master practical skills with hands-on projects and expert instruction.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
                <span className="flex items-center gap-1">
                  <Star size={14} style={{ color: GOLD, fill: GOLD }} /> {course.rating}
                </span>
                <span className="flex items-center gap-1"><Users size={14} /> {course.enrolled} enrolled</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> {course.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <img
                  src={`https://picsum.photos/seed/${course.instructor}/40/40`}
                  alt={course.instructor}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm">Instructor: <strong>{course.instructor}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-10 md:py-16 bg-slate-50">
        <div className="container flex flex-col lg:flex-row gap-8">

          {/* Tabs */}
          <div className="flex-1">
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start bg-white border border-slate-100 mb-6 rounded-xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-heading font-semibold text-lg mb-3" style={{ color: NAVY }}>About This Course</h3>
                  <p className="text-sm text-slate-500 mb-6">{course.description}</p>
                  <h4 className="font-heading font-semibold mb-3" style={{ color: NAVY }}>What You'll Learn</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-500">
                    {[
                      'Core fundamentals and theory',
                      'Hands-on practical skills',
                      'Industry best practices',
                      'Portfolio-ready projects',
                      'Professional workflows',
                      'Real-world applications',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="curriculum">
                <div className="space-y-4">
                  {curriculum.map((mod, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="px-5 py-3 font-heading font-semibold text-sm text-white"
                        style={{ background: `linear-gradient(135deg,${NAVY},#0f2d56)` }}>
                        {mod.module}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {mod.lessons.map((lesson, j) => (
                          <div key={j} className="px-5 py-3 flex items-center gap-2 text-sm text-slate-500">
                            <PlayCircle size={14} style={{ color: GOLD }} className="shrink-0" />
                            {lesson}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructor">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-start gap-4">
                  <img
                    src={`https://picsum.photos/seed/${course.instructor}/100/100`}
                    alt={course.instructor}
                    className="w-20 h-20 rounded-full shrink-0 object-cover"
                  />
                  <div>
                    <h3 className="font-heading font-semibold" style={{ color: NAVY }}>{course.instructor}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Expert instructor with years of industry experience. Passionate about teaching
                      practical skills and helping students succeed in their careers.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
                  No reviews yet. Be the first to review this course!
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sticky top-20 shadow-sm">
              <img
                src={course.image ?? '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full rounded-xl mb-4 aspect-video object-cover"
              />

              <p className="font-heading font-bold text-2xl mb-1" style={{ color: NAVY }}>
                {course.price === 0
                  ? <span className="text-emerald-500">Free</span>
                  : <>₦{course.price.toLocaleString()}</>
                }
              </p>
              {course.sponsored && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 mb-2 inline-block">
                  Sponsored
                </span>
              )}
              <p className="text-xs text-slate-400 mb-4">Flexible payment plans available</p>

              <Button
                className="w-full mb-2 text-sm font-bold border-0"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' }}
                size="lg"
                onClick={() => setEnrollOpen(true)}
              >
                Enroll Now
              </Button>
              <Button
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 mb-3"
                size="lg"
                asChild
              >
                <a href={whatsappEnroll} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} className="mr-1" /> Enroll via WhatsApp
                </a>
              </Button>
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link to="/courses"><ArrowLeft size={13} className="mr-1" /> Back to Courses</Link>
              </Button>

              <div className="mt-6 space-y-3 text-sm text-slate-500">
                <p className="font-heading font-semibold text-xs uppercase" style={{ color: NAVY }}>
                  This course includes:
                </p>
                {[
                  { icon: PlayCircle, text: `${course.duration} of training` },
                  { icon: FileText,   text: 'Downloadable resources' },
                  { icon: Award,      text: 'Certificate of completion' },
                  { icon: Clock,      text: 'Lifetime access' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <item.icon size={14} style={{ color: GOLD }} />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnrollmentModal open={enrollOpen} onOpenChange={setEnrollOpen} course={course} />
    </MainLayout>
  );
}
