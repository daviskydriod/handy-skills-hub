typescript

// File: frontend/src/pages/CourseDetail.tsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Clock, BookOpen, Users, PlayCircle, FileText,
  Award, CheckCircle, MessageCircle, ArrowLeft, Loader2,
  ChevronDown, ChevronRight, Film,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import { BUSINESS_INFO } from '@/data/mockData';
import { useCourse } from '../hooks/useCourses';
import type { CoursePart, CourseModule, Lesson } from '@/api/courses';

const NAVY = '#0b1f3a';
const GOLD = '#EAB308';
const GOLD2 = '#CA8A04';
const TEAL = '#0d9488';

// ── Single lesson row — NO video preview, NO video link shown ─────────
function LessonRow({ lesson, lessonIdx }: {
  lesson: Lesson; lessonIdx: number;
}) {
  const hasVideo = !!lesson.videoUrl;

  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 20px',
      }}>
        {/* Lesson number badge */}
        <span style={{
          minWidth: 22, height: 22, borderRadius: 6,
          background: TEAL + '18', color: TEAL,
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {lessonIdx + 1}
        </span>

        {/* Show icon type but NOT the actual link */}
        {hasVideo
          ? <Film size={13} style={{ color: GOLD, flexShrink: 0 }} />
          : <FileText size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
        }

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, lineHeight: 1.3 }}>
            {lesson.title || `Lesson ${lessonIdx + 1}`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {lesson.duration && (
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={11} /> {lesson.duration}
            </span>
          )}
          {hasVideo && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: GOLD + '18', color: GOLD2, border: `1px solid ${GOLD}40`,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <PlayCircle size={10} /> Video
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Module block (collapsible) ────────────────────────────────────────
function ModuleBlock({ mod, modIdx }: {
  mod: CourseModule; modIdx: number;
}) {
  const [open, setOpen] = useState(modIdx === 0);

  return (
    <div style={{ marginBottom: 8, border: '1px solid #e8edf2', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px', cursor: 'pointer',
          background: open ? TEAL + '08' : '#f8fafc',
          borderBottom: open ? `1px solid ${TEAL}20` : 'none',
          transition: 'background .15s',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: TEAL + '20', color: TEAL,
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {modIdx + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>
            {mod.title || `Module ${modIdx + 1}`}
          </p>
          {mod.description && (
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{mod.description}</p>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8', marginRight: 4 }}>
          {mod.lessons?.length ?? 0} lesson{(mod.lessons?.length ?? 0) !== 1 ? 's' : ''}
        </span>
        {open
          ? <ChevronDown size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          : <ChevronRight size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
        }
      </div>

      {open && (mod.lessons ?? []).map((lesson, li) => (
        <LessonRow
          key={lesson.id ?? li}
          lesson={lesson}
          lessonIdx={li}
        />
      ))}
    </div>
  );
}

// ── Part block ────────────────────────────────────────────────────────
function PartBlock({ part, partIdx, totalParts }: {
  part: CoursePart; partIdx: number; totalParts: number;
}) {
  const [open, setOpen] = useState(true);
  const totalLessons = (part.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0);

  return (
    <div style={{ marginBottom: 16, borderRadius: 14, overflow: 'hidden', border: `1.5px solid ${NAVY}18` }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', cursor: 'pointer',
          background: `linear-gradient(135deg,${NAVY}f5,#0f2d56)`,
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,0.15)',
          fontSize: 12, fontWeight: 800, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {partIdx + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>
            {part.title || `Part ${partIdx + 1}`}
            {totalParts > 1 && (
              <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.6, marginLeft: 8 }}>
                Part {partIdx + 1} of {totalParts}
              </span>
            )}
          </p>
          {part.description && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{part.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
            {part.modules?.length ?? 0} modules · {totalLessons} lessons
          </span>
          {open
            ? <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
            : <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
          }
        </div>
      </div>

      {open && (
        <div style={{ background: '#f8fafc', padding: '12px 12px 4px' }}>
          {(part.modules ?? []).map((mod, mi) => (
            <ModuleBlock key={mod.id ?? mi} mod={mod} modIdx={mi} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Fallback curriculum ───────────────────────────────────────────────
const FALLBACK_CURRICULUM = [
  { module: 'Module 1: Introduction',    lessons: ['Welcome & Course Overview', 'Setting Up Your Environment', 'Understanding the Basics'] },
  { module: 'Module 2: Core Concepts',   lessons: ['Fundamental Principles', 'Hands-On Practice', 'Real-World Applications'] },
  { module: 'Module 3: Advanced Topics', lessons: ['Advanced Techniques', 'Industry Best Practices', 'Final Project'] },
];

// ─────────────────────────────────────────────────────────────────────
export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourse(id);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
        </div>
      </MainLayout>
    );
  }

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

  const hasParts = (course.content?.parts?.length ?? 0) > 0;

  const totalModules = hasParts
    ? course.content!.parts.reduce((a, p) => a + (p.modules?.length ?? 0), 0)
    : 0;
  const totalLessonsFromContent = hasParts
    ? course.content!.parts.reduce((a, p) =>
        a + (p.modules ?? []).reduce((b, m) => b + (m.lessons?.length ?? 0), 0), 0)
    : course.lessons;

  // ✅ Enroll button — goes to register page with course context
  const handleEnroll = () => {
    navigate(`/register?redirect=/learn/${course.id}&course=${encodeURIComponent(course.title)}`);
  };

  return (
    <MainLayout>
      {/* ── PAGE HERO — no description ── */}
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
              {/* ✅ NO description here */}
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
                <span className="flex items-center gap-1">
                  <Star size={14} style={{ color: GOLD, fill: GOLD }} /> {course.rating}
                </span>
                <span className="flex items-center gap-1"><Users size={14} /> {course.enrolled} enrolled</span>
                {course.duration && (
                  <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen size={14} /> {totalLessonsFromContent} lessons
                </span>
                {hasParts && totalModules > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText size={14} /> {totalModules} modules
                  </span>
                )}
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

      {/* ── MAIN CONTENT ── */}
      <section className="py-10 md:py-16 bg-slate-50">
        <div className="container flex flex-col lg:flex-row gap-8">

          {/* Tabs */}
          <div className="flex-1">
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start bg-white border border-slate-100 mb-6 rounded-xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">
                  Curriculum
                  {hasParts && (
                    <span style={{
                      marginLeft: 6, fontSize: 10, fontWeight: 800,
                      padding: '1px 6px', borderRadius: 99,
                      background: TEAL + '20', color: TEAL,
                    }}>
                      {totalLessonsFromContent}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* ── OVERVIEW ── */}
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

              {/* ── CURRICULUM — no video previews, no clickable links ── */}
              <TabsContent value="curriculum">
                {hasParts ? (
                  <div>
                    <div style={{
                      display: 'flex', gap: 16, flexWrap: 'wrap',
                      background: '#fff', border: '1px solid #e8edf2',
                      borderRadius: 12, padding: '12px 18px', marginBottom: 16,
                      fontSize: 12, color: '#64748b',
                    }}>
                      <span style={{ fontWeight: 700, color: NAVY }}>Course Content</span>
                      <span>{course.content!.parts.length} part{course.content!.parts.length !== 1 ? 's' : ''}</span>
                      <span>{totalModules} module{totalModules !== 1 ? 's' : ''}</span>
                      <span>{totalLessonsFromContent} lesson{totalLessonsFromContent !== 1 ? 's' : ''}</span>
                      {course.duration && <span>{course.duration} total</span>}
                    </div>

                    {/* ✅ Enroll prompt banner */}
                    <div style={{
                      background: `linear-gradient(135deg,${NAVY}f0,#0f2d56)`,
                      borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 12, flexWrap: 'wrap',
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>
                        🔒 Register or log in to access full course content
                      </p>
                      <button
                        onClick={handleEnroll}
                        style={{
                          background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                          color: '#060d1c', border: 'none', borderRadius: 8,
                          padding: '8px 18px', fontWeight: 800, fontSize: 12,
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        Enroll Now →
                      </button>
                    </div>

                    {course.content!.parts.map((part, pi) => (
                      <PartBlock
                        key={part.id ?? pi}
                        part={part}
                        partIdx={pi}
                        totalParts={course.content!.parts.length}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {FALLBACK_CURRICULUM.map((mod, i) => (
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
                )}
              </TabsContent>

              {/* ── INSTRUCTOR ── */}
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

              {/* ── REVIEWS ── */}
              <TabsContent value="reviews">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
                  No reviews yet. Be the first to review this course!
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── SIDEBAR ── */}
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

              {/* ✅ Enroll Now → goes to register/login page */}
              <Button
                className="w-full mb-2 text-sm font-bold border-0"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' }}
                size="lg"
                onClick={handleEnroll}
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
                  { icon: PlayCircle, text: `${course.duration ?? 'Flexible'} of training` },
                  { icon: BookOpen,   text: `${totalLessonsFromContent} lessons` },
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
    </MainLayout>
  );
}
