// File: src/pages/CourseDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Clock, BookOpen, Users, PlayCircle, FileText,
  Award, CheckCircle, MessageCircle, ArrowLeft, Loader2,
  ChevronDown, ChevronRight, Film, ThumbsUp, Trash2, Edit3,
  LogIn, LayoutDashboard, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import { BUSINESS_INFO } from '@/data/mockData';
import { useCourse } from '../hooks/useCourses';
import { getCourseReviews, submitReview, deleteReview, getMyReview } from '@/api/reviews';
import type { Review, ReviewStats } from '@/api/reviews';
import type { CoursePart, CourseModule, Lesson } from '@/api/courses';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const NAVY = '#0b1f3a';
const GOLD = '#EAB308';
const GOLD2 = '#CA8A04';
const TEAL = '#0d9488';

// ── Star renderer ─────────────────────────────────────────────────────
function Stars({ rating, size = 14, interactive = false, onChange }: {
  rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size}
          style={{
            color: (interactive ? (hovered || rating) : rating) >= s ? GOLD : '#d1d5db',
            fill:  (interactive ? (hovered || rating) : rating) >= s ? GOLD : 'none',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color .1s, fill .1s',
          }}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(s)}
        />
      ))}
    </span>
  );
}

// ── Review Card ───────────────────────────────────────────────────────
function ReviewCard({ review, isOwn, onDelete }: {
  review: Review; isOwn: boolean; onDelete?: () => void;
}) {
  const initials = review.student_name
    ? review.student_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const date = new Date(review.created_at).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  return (
    <div style={{
      background: '#fff',
      border: isOwn ? `1.5px solid ${GOLD}60` : '1px solid #e8edf2',
      borderRadius: 14, padding: '16px 18px', position: 'relative',
    }}>
      {isOwn && (
        <span style={{
          position: 'absolute', top: 12, left: 18,
          fontSize: 10, fontWeight: 800, color: GOLD2,
          background: GOLD + '18', padding: '2px 8px',
          borderRadius: 99, border: `1px solid ${GOLD}40`,
        }}>Your Review</span>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: isOwn ? 20 : 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `linear-gradient(135deg,${NAVY},#0f2d56)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{review.student_name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Stars rating={review.rating} size={12} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{date}</span>
              </div>
            </div>
            {isOwn && onDelete && (
              <button onClick={onDelete}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                title="Delete review">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          {review.comment && (
            <p style={{ fontSize: 13, color: '#475569', marginTop: 8, lineHeight: 1.6 }}>{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Rating Distribution Bar ───────────────────────────────────────────
function DistBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ width: 28, color: '#64748b', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg,${GOLD},${GOLD2})`,
          borderRadius: 99, transition: 'width .5s ease',
        }} />
      </div>
      <span style={{ width: 28, color: '#94a3b8', flexShrink: 0, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

// ── Reviews Tab ───────────────────────────────────────────────────────
function ReviewsTab({ courseId }: { courseId: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [stats, setStats]           = useState<ReviewStats | null>(null);
  const [myReview, setMyReview]     = useState<Review | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [rating, setRating]         = useState(5);
  const [comment, setComment]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCourseReviews(courseId);
      setReviews(data.reviews);
      setStats(data.stats);
      if (user) {
        try {
          const mine = await getMyReview(courseId);
          setMyReview(mine);
          if (mine) { setRating(mine.rating); setComment(mine.comment ?? ''); }
        } catch { /* no review yet — fine */ }
      }
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [courseId]);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await submitReview(courseId, rating, comment);
      toast.success(myReview ? 'Review updated!' : 'Review submitted!');
      setShowForm(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete your review?')) return;
    setDeleting(true);
    try {
      await deleteReview(courseId);
      toast.success('Review deleted');
      setMyReview(null); setShowForm(false); setRating(5); setComment('');
      await load();
    } catch { toast.error('Failed to delete review'); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <Loader2 size={24} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Stats */}
      {stats && stats.total > 0 && (
        <div style={{
          background: '#fff', border: '1px solid #e8edf2', borderRadius: 16,
          padding: '20px 24px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <p style={{ fontSize: 44, fontWeight: 900, color: NAVY, lineHeight: 1 }}>
              {stats.avg.toFixed(1)}
            </p>
            <Stars rating={Math.round(stats.avg)} size={16} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              {stats.total} review{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[5, 4, 3, 2, 1].map(s => (
              <DistBar key={s} label={`${s}★`} count={stats.distribution[s] ?? 0} total={stats.total} />
            ))}
          </div>
        </div>
      )}

      {/* ✅ Auth-aware review action panel */}
      {!user ? (
        // Guest: prompt to log in
        <div style={{
          background: '#fff', border: `1.5px solid ${NAVY}18`,
          borderRadius: 14, padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Log in to write a review for this course.
          </p>
          <button
            onClick={() => navigate(`/login?redirect=/courses/${courseId}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: `linear-gradient(135deg,${NAVY},#0f2d56)`,
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 14px', fontWeight: 700, fontSize: 12,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <LogIn size={13} /> Log In to Review
          </button>
        </div>
      ) : user.role === 'student' ? (
        // Logged-in student: show write/edit form
        <div style={{
          background: '#fff', border: `1.5px solid ${NAVY}18`,
          borderRadius: 14, padding: '16px 18px',
        }}>
          {!showForm ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#64748b' }}>
                {myReview ? "You've already reviewed this course." : 'Complete the course to leave a review.'}
              </p>
              <button onClick={() => setShowForm(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                color: '#060d1c', border: 'none', borderRadius: 8,
                padding: '8px 14px', fontWeight: 800, fontSize: 12,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                <Edit3 size={12} />
                {myReview ? 'Edit Review' : 'Write a Review'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                {myReview ? 'Update your review' : 'Write a review'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Rating:</span>
                <Stars rating={rating} size={22} interactive onChange={setRating} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </span>
              </div>
              <textarea
                value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your experience (optional)…" rows={3}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1.5px solid #e2e8f0', borderRadius: 10,
                  fontSize: 13, color: NAVY, resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none', background: '#f8fafc',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSubmit} disabled={submitting} style={{
                  background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                  color: '#060d1c', border: 'none', borderRadius: 8,
                  padding: '9px 18px', fontWeight: 800, fontSize: 12,
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {submitting && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                  {myReview ? 'Update' : 'Submit'}
                </button>
                <button onClick={() => setShowForm(false)} style={{
                  background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8,
                  padding: '9px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      ) : null /* admins/instructors don't write reviews */}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: 14, padding: '32px 20px', textAlign: 'center',
        }}>
          <ThumbsUp size={28} style={{ color: '#d1d5db', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>No reviews yet</p>
          <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>
            Be the first to review this course after completing it!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviews.map(r => (
            <ReviewCard
              key={r.id} review={r}
              isOwn={user?.id === r.student_id}
              onDelete={user?.id === r.student_id ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single lesson row ─────────────────────────────────────────────────
function LessonRow({ lesson, lessonIdx }: { lesson: Lesson; lessonIdx: number }) {
  const hasVideo = !!lesson.videoUrl;
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px' }}>
        <span style={{
          minWidth: 22, height: 22, borderRadius: 6,
          background: TEAL + '18', color: TEAL,
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{lessonIdx + 1}</span>
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

// ── Module block ──────────────────────────────────────────────────────
function ModuleBlock({ mod, modIdx }: { mod: CourseModule; modIdx: number }) {
  const [open, setOpen] = useState(modIdx === 0);
  return (
    <div style={{ marginBottom: 8, border: '1px solid #e8edf2', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 16px', cursor: 'pointer',
        background: open ? TEAL + '08' : '#f8fafc',
        borderBottom: open ? `1px solid ${TEAL}20` : 'none',
        transition: 'background .15s',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: TEAL + '20', color: TEAL,
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{modIdx + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{mod.title || `Module ${modIdx + 1}`}</p>
          {mod.description && <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{mod.description}</p>}
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
        <LessonRow key={lesson.id ?? li} lesson={lesson} lessonIdx={li} />
      ))}
    </div>
  );
}

// ── Part block ────────────────────────────────────────────────────────
function PartBlock({ part, partIdx, totalParts }: { part: CoursePart; partIdx: number; totalParts: number }) {
  const [open, setOpen] = useState(true);
  const totalLessons = (part.modules ?? []).reduce((a, m) => a + (m.lessons?.length ?? 0), 0);
  return (
    <div style={{ marginBottom: 16, borderRadius: 14, overflow: 'hidden', border: `1.5px solid ${NAVY}18` }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', cursor: 'pointer',
        background: `linear-gradient(135deg,${NAVY}f5,#0f2d56)`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,0.15)',
          fontSize: 12, fontWeight: 800, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{partIdx + 1}</div>
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
  const { user } = useAuth();                          // ✅ auth at top level
  const { course, isLoading, error } = useCourse(id);

  if (isLoading) return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
      </div>
    </MainLayout>
  );

  if (error || !course) return (
    <MainLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-red-500 font-semibold text-lg">{error ?? 'Course not found'}</p>
        <Button asChild variant="outline">
          <Link to="/courses"><ArrowLeft size={14} className="mr-1" /> Back to Courses</Link>
        </Button>
      </div>
    </MainLayout>
  );

  const whatsappEnroll = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(
    `Hello HandyGidi! I'm interested in the "${course.title}" course (₦${course.price.toLocaleString()}). Please send me enrollment details.`
  )}`;

  const hasParts = (course.content?.parts?.length ?? 0) > 0;
  const totalModules = hasParts
    ? course.content!.parts.reduce((a, p) => a + (p.modules?.length ?? 0), 0) : 0;
  const totalLessonsFromContent = hasParts
    ? course.content!.parts.reduce((a, p) =>
        a + (p.modules ?? []).reduce((b, m) => b + (m.lessons?.length ?? 0), 0), 0)
    : course.lessons;

  // ✅ Auth-aware enroll: guests → register, logged-in → their dashboard
  const handleEnroll = () => {
    if (!user) {
      navigate(`/register?redirect=/courses/${course.id}&course=${encodeURIComponent(course.title)}`);
    } else if (user.role === 'admin') {
      navigate('/dashboard/admin');
    } else if (user.role === 'instructor') {
      navigate('/dashboard/instructor');
    } else {
      navigate('/dashboard/student');
    }
  };

  const enrollBtnLabel = !user ? 'Enroll Now'
    : user.role === 'student' ? 'Go to My Dashboard'
    : 'Go to Dashboard';

  return (
    <MainLayout>
      {/* ── PAGE HERO ── */}
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
                    }}>{totalLessonsFromContent}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews
                  {course.rating > 0 && (
                    <span style={{
                      marginLeft: 6, fontSize: 10, fontWeight: 800,
                      padding: '1px 6px', borderRadius: 99,
                      background: GOLD + '20', color: GOLD2,
                    }}>{course.rating}★</span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── OVERVIEW ── */}
              <TabsContent value="overview">
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-heading font-semibold text-lg mb-3" style={{ color: NAVY }}>About This Course</h3>
                  <p className="text-sm text-slate-500 mb-6">{course.description}</p>
                  <h4 className="font-heading font-semibold mb-3" style={{ color: NAVY }}>What You'll Learn</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-500">
                    {[
                      'Core fundamentals and theory', 'Hands-on practical skills',
                      'Industry best practices', 'Portfolio-ready projects',
                      'Professional workflows', 'Real-world applications',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              {/* ── CURRICULUM ── */}
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

                    {/* ✅ Auth-aware curriculum banner */}
                    {!user ? (
                      <div style={{
                        background: `linear-gradient(135deg,${NAVY}f0,#0f2d56)`,
                        borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 12, flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Lock size={14} style={{ color: GOLD, flexShrink: 0 }} />
                          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>
                            Register or log in to access full course content
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => navigate(`/login?redirect=/courses/${course.id}`)}
                            style={{
                              background: 'rgba(255,255,255,0.12)', color: '#fff',
                              border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
                              padding: '7px 14px', fontWeight: 700, fontSize: 12,
                              cursor: 'pointer', whiteSpace: 'nowrap',
                            }}>
                            Log In
                          </button>
                          <button onClick={handleEnroll} style={{
                            background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                            color: '#060d1c', border: 'none', borderRadius: 8,
                            padding: '7px 16px', fontWeight: 800, fontSize: 12,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}>
                            Enroll Now →
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ✅ Logged-in: green banner with dashboard link
                      <div style={{
                        background: 'linear-gradient(135deg,#052e16,#064e3b)',
                        borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 12, flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>
                            Logged in as <strong style={{ color: '#4ade80' }}>{user.name}</strong>
                          </p>
                        </div>
                        <button
                          onClick={handleEnroll}
                          style={{
                            background: 'rgba(74,222,128,0.2)', color: '#4ade80',
                            border: '1px solid rgba(74,222,128,0.35)', borderRadius: 8,
                            padding: '7px 14px', fontWeight: 700, fontSize: 12,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                          <LayoutDashboard size={12} /> Go to Dashboard
                        </button>
                      </div>
                    )}

                    {course.content!.parts.map((part, pi) => (
                      <PartBlock
                        key={part.id ?? pi} part={part} partIdx={pi}
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
                <ReviewsTab courseId={Number(id)} />
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

              {/* ✅ Primary CTA — changes label based on auth state */}
              <Button
                className="w-full mb-2 text-sm font-bold border-0"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' }}
                size="lg"
                onClick={handleEnroll}
              >
                {user && <LayoutDashboard size={15} className="mr-1" />}
                {enrollBtnLabel}
              </Button>

              {/* ✅ Login button only for guests */}
              {!user && (
                <Button
                  variant="outline"
                  className="w-full mb-2 border-slate-300 text-slate-600 hover:bg-slate-50 text-sm"
                  size="lg"
                  onClick={() => navigate(`/login?redirect=/courses/${course.id}`)}
                >
                  <LogIn size={14} className="mr-1" /> Already enrolled? Log In
                </Button>
              )}

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

              {/* ✅ Logged-in user badge in sidebar */}
              {user && (
                <div style={{
                  marginTop: 16, padding: '10px 12px',
                  background: '#f0fdf4', borderRadius: 10,
                  border: '1px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `linear-gradient(135deg,${NAVY},#0f2d56)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0,
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: 10, color: '#16a34a', textTransform: 'capitalize' }}>
                      {user.role} · Logged in ✓
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
