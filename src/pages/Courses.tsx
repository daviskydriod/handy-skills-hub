// File: frontend/src/pages/Courses.tsx
// Courses listing page — now fetches from https://api.handygiditrainingcentre.com/api/courses
// Replaces the old static mockData import with the real useCourses hook.

import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, Users, Clock, BookOpen, ArrowRight,
  GraduationCap, X, Sparkles, Filter,
  Monitor, Brain, Share2, Palette, Globe,
  TrendingUp, Code, FileText, Briefcase, Heart,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { BUSINESS_INFO } from '@/data/mockData';   // keep only business info
import { useCourses } from '../hooks/useCourses';
import type { Course, CoursesFilter } from '../types';

/* ─── design tokens ────────────────────────────────────────── */
const NAVY  = '#0b1f3a';
const NAVY2 = '#0f2d56';
const GOLD  = '#EAB308';
const GOLD2 = '#CA8A04';

const iconMap: Record<string, any> = {
  Monitor, Brain, Share2, Palette, Globe, Users,
  TrendingUp, Code, FileText, Briefcase, Heart,
};

/* ─── card animation ───────────────────────────────────────── */
const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ═══════════════════ COURSE CARD ═══════════════════════════ */
const CourseCard = ({ course }: { course: Course }) => (
  <motion.div
    layout variants={cardVariants} initial="hidden" animate="visible" exit="exit"
    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm
               hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
  >
    <div className="relative overflow-hidden h-44 bg-slate-100 shrink-0">
      <img
        src={course.image ?? '/placeholder-course.jpg'}
        alt={course.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full
                       uppercase tracking-wide text-white"
        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
        {course.category}
      </span>
      {course.sponsored && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
          Sponsored
        </span>
      )}
      <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-[10px] text-white/80 font-medium">by {course.instructor}</p>
      </div>
    </div>

    <div className="p-4 flex flex-col flex-1">
      <h3 className="font-heading font-bold text-[14px] leading-snug mb-1.5 group-hover:text-yellow-600
                     transition-colors line-clamp-2" style={{ color: NAVY }}>
        {course.title}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2 flex-1">{course.description}</p>

      <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-400 mb-3">
        <span className="flex items-center gap-1"><Clock size={10} />{course.duration}</span>
        <span className="flex items-center gap-1"><BookOpen size={10} />{course.lessons} lessons</span>
        <span className="flex items-center gap-1"><Users size={10} />{course.enrolled}</span>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={10} style={{
            color: i < Math.floor(course.rating) ? GOLD : '#e2e8f0',
            fill:  i < Math.floor(course.rating) ? GOLD : '#e2e8f0',
          }} />
        ))}
        <span className="text-[11px] font-semibold text-slate-400 ml-1">{course.rating}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          {course.price === 0
            ? <span className="font-extrabold text-base text-emerald-500">Free</span>
            : <><span className="font-extrabold text-base" style={{ color: NAVY }}>
                ₦{course.price.toLocaleString()}
              </span><span className="text-[10px] text-slate-400 ml-1">one-time</span></>
          }
        </div>
        <Link to={`/courses/${course.id}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold px-3.5 py-1.5
                     rounded-full transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' }}>
          Enroll <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════ PAGE ══════════════════════════════════ */
export default function Courses() {
  const [category,    setCategory]    = useState('');
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState<CoursesFilter['sort']>('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real API call — updates whenever filter changes
  const filter: CoursesFilter = useMemo(
    () => ({ category: category || undefined, search: search || undefined, sort }),
    [category, search, sort]
  );

  const { courses, total, isLoading, error } = useCourses(filter);

  const clearFilters = useCallback(() => { setCategory(''); setSearch(''); setSort('default'); }, []);
  const hasActive    = !!category || !!search || sort !== 'default';

  // Categories derived from courses (or fetch separately)
  const derivedCategories = useMemo(() => {
    const seen = new Set<string>();
    return courses.filter((c) => {
      if (seen.has(c.category)) return false;
      seen.add(c.category); return true;
    }).map((c) => c.category);
  }, [courses]);

  return (
    <MainLayout>
      {/* PAGE HEADER */}
      <section className="relative overflow-hidden py-10 md:py-14"
        style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 60%,${NAVY2} 100%)` }}>
        <div className="container relative z-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest
                           px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.28)', color: GOLD }}>
            <Sparkles size={11} /> {total} Courses Available
          </span>
          <h1 className="font-heading font-extrabold text-white mb-3"
            style={{ fontSize: 'clamp(1.8rem,4.5vw,2.8rem)' }}>
            All Our <span style={{ color: GOLD }}>Courses</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Practical, hands-on training for real results. All prices in ₦ · Flexible payment plans available.
          </p>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <div className="bg-slate-50 min-h-screen">
        <div className="container py-8 md:py-12">
          <div className="flex gap-8 items-start">

            {/* SIDEBAR */}
            <aside className="hidden lg:flex flex-col gap-6 w-64 shrink-0 sticky top-24">
              {/* Search */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-heading font-extrabold text-sm mb-3" style={{ color: NAVY }}>Search</h3>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search courses…" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs
                               text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = '#e2e8f0')} />
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-heading font-extrabold text-sm mb-4" style={{ color: NAVY }}>Categories</h3>
                <ul className="flex flex-col gap-1">
                  <li>
                    <button onClick={() => setCategory('')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={!category ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' } : { color: '#64748b' }}>
                      <span className="flex items-center gap-2"><GraduationCap size={13} /> All Courses</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={!category ? { background: 'rgba(0,0,0,0.15)', color: '#fff' } : { background: '#f1f5f9', color: '#64748b' }}>
                        {total}
                      </span>
                    </button>
                  </li>
                  {derivedCategories.map((cat) => {
                    const Icon = iconMap[cat] || Palette;
                    const active = category === cat;
                    return (
                      <li key={cat}>
                        <button onClick={() => setCategory(cat)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-slate-50"
                          style={active ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' } : { color: '#475569' }}>
                          <Icon size={13} /> {cat}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sort */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-heading font-extrabold text-sm mb-3" style={{ color: NAVY }}>Sort By</h3>
                {([
                  { val: 'default',    label: 'Default' },
                  { val: 'rating',     label: 'Highest Rated' },
                  { val: 'price-asc',  label: 'Price: Low → High' },
                  { val: 'price-desc', label: 'Price: High → Low' },
                ] as const).map((opt) => (
                  <button key={opt.val} onClick={() => setSort(opt.val)}
                    className="w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-xl text-xs font-semibold transition-all text-left"
                    style={sort === opt.val
                      ? { background: 'rgba(234,179,8,0.10)', color: GOLD2, border: `1px solid rgba(234,179,8,0.25)` }
                      : { color: '#64748b', border: '1px solid transparent' }}>
                    <span className="w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center"
                      style={{ borderColor: sort === opt.val ? GOLD : '#cbd5e1' }}>
                      {sort === opt.val && <span className="w-1.5 h-1.5 rounded-full block" style={{ background: GOLD }} />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {hasActive && (
                <button onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all hover:scale-105"
                  style={{ borderColor: '#fca5a5', color: '#ef4444', background: '#fff1f2' }}>
                  <X size={12} /> Clear All Filters
                </button>
              )}
            </aside>

            {/* COURSE GRID */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                               border border-slate-200 bg-white text-slate-600 hover:border-yellow-400 transition-all">
                    <Filter size={12} /> Filters
                    {hasActive && <span className="w-4 h-4 rounded-full text-[9px] font-extrabold text-white
                                                  flex items-center justify-center" style={{ background: GOLD }}>!</span>}
                  </button>
                  <p className="text-sm text-slate-500">
                    <span className="font-extrabold" style={{ color: NAVY }}>{total}</span> courses
                  </p>
                </div>
              </div>

              {/* Loading skeleton */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 h-80 animate-pulse" />
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                  <p className="text-red-500 font-semibold">{error}</p>
                </div>
              )}

              {/* Course cards */}
              {!isLoading && !error && (
                <AnimatePresence mode="popLayout">
                  {courses.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      <AnimatePresence mode="popLayout">
                        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="text-center py-24 bg-white rounded-2xl border border-slate-100">
                      <Search size={24} className="mx-auto mb-4" style={{ color: GOLD }} />
                      <h3 className="font-heading font-extrabold text-lg mb-2" style={{ color: NAVY }}>No courses found</h3>
                      <button onClick={clearFilters}
                        className="inline-flex items-center gap-2 font-bold px-6 py-2.5 rounded-full text-sm mt-4"
                        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' }}>
                        <X size={13} /> Clear Filters
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <section className="py-14" style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
        <div className="container text-center max-w-xl mx-auto">
          <h2 className="font-heading font-extrabold text-white text-2xl md:text-3xl mb-3">
            Can't find what you're looking for?
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <a href={`https://wa.me/${BUSINESS_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-extrabold px-7 py-3 rounded-full text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#060d1c' }}>
              WhatsApp Us
            </a>
            <Link to="/contact"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-full text-sm border text-white hover:bg-white/10 transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              Contact Us <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
