import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, Users, Clock, BookOpen, ArrowRight,
  GraduationCap, X, Sparkles, SlidersHorizontal,
  ChevronDown, Filter, Monitor, Brain, Share2, Palette,
  Globe, Home, TrendingUp, Code, FileText, Briefcase, Heart
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { courses, categories, BUSINESS_INFO } from "@/data/mockData";

/* ─── tokens ─────────────────────────────────────────────── */
const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

const iconMap: Record<string, any> = {
  Monitor, Brain, Share2, Palette, Globe, Home, Users,
  TrendingUp, Code, FileText, Briefcase, Heart,
};

/* ─── animations ─────────────────────────────────────────── */
const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ════════════════════════════════════════════════════════════
   COURSE CARD
════════════════════════════════════════════════════════════ */
interface Course {
  id: string; title: string; category: string; price: number;
  rating: number; lessons: number; duration: string;
  instructor: string; image: string; enrolled: number;
  description: string; sponsored?: boolean;
}

const CourseCard = ({ course }: { course: Course }) => (
  <motion.div
    layout
    variants={cardVariants}
    initial="hidden" animate="visible" exit="exit"
    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
  >
    <div className="relative overflow-hidden h-44 bg-slate-100 shrink-0">
      <img src={course.image} alt={course.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <span
        className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide text-white"
        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
      >{course.category}</span>
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
      <h3 className="font-heading font-bold text-[14px] leading-snug mb-1.5 group-hover:text-yellow-600 transition-colors line-clamp-2"
        style={{ color: NAVY }}>{course.title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2 flex-1">{course.description}</p>

      <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-400 mb-3">
        <span className="flex items-center gap-1"><Clock size={10} />{course.duration}</span>
        <span className="flex items-center gap-1"><BookOpen size={10} />{course.lessons} lessons</span>
        <span className="flex items-center gap-1"><Users size={10} />{course.enrolled}</span>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={10}
            style={{ color: i < Math.floor(course.rating) ? GOLD : "#e2e8f0", fill: i < Math.floor(course.rating) ? GOLD : "#e2e8f0" }} />
        ))}
        <span className="text-[11px] font-semibold text-slate-400 ml-1">{course.rating}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          {course.price === 0
            ? <span className="font-extrabold text-base text-emerald-500">Free</span>
            : <><span className="font-extrabold text-base" style={{ color: NAVY }}>₦{course.price.toLocaleString()}</span>
               <span className="text-[10px] text-slate-400 ml-1">one-time</span></>
          }
        </div>
        <Link to={`/courses/${course.id}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold px-3.5 py-1.5 rounded-full transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
          Enroll <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function Courses() {
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [sort, setSort]           = useState<"default"|"price-asc"|"price-desc"|"rating">("default");
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar

  const filtered = useMemo(() => {
    let list = courses.filter((c) => {
      const matchCat    = filter === "All" || c.category === filter;
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    if (sort === "price-asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating")     list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [filter, search, sort]);

  const clearFilters = () => { setFilter("All"); setSearch(""); setSort("default"); };
  const hasActive = filter !== "All" || search !== "" || sort !== "default";

  return (
    <MainLayout>
      {/* ══════════════════════════════════════════════════════
          SLIM PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-10 md:py-14"
        style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 60%,${NAVY2} 100%)` }}
      >
        <div className="pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="g2" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAB308" strokeWidth="0.6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g2)"/>
          </svg>
          <div className="absolute top-0 right-0 w-80 h-80 opacity-15 rounded-full -translate-y-1/3 translate-x-1/3"
            style={{ background: `radial-gradient(circle,${GOLD},transparent 70%)` }} />
        </div>

        <div className="container relative z-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.28)", color: GOLD }}>
            <Sparkles size={11} /> {courses.length} Courses Available
          </span>
          <h1 className="font-heading font-extrabold text-white mb-3"
            style={{ fontSize: "clamp(1.8rem,4.5vw,2.8rem)" }}>
            All Our <span style={{ color: GOLD }}>Courses</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Practical, hands-on training for real results. All prices in ₦ · Flexible payment plans available.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SHOP LAYOUT  (sidebar + grid)
      ══════════════════════════════════════════════════════ */}
      <div className="bg-slate-50 min-h-screen">
        <div className="container py-8 md:py-12">
          <div className="flex gap-8 items-start">

            {/* ════════════════════════
                SIDEBAR (desktop)
            ════════════════════════ */}
            <aside className="hidden lg:flex flex-col gap-6 w-64 shrink-0 sticky top-24">

              {/* search */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-heading font-extrabold text-sm mb-3" style={{ color: NAVY }}>
                  Search
                </h3>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search courses…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    style={{ transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* categories */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-heading font-extrabold text-sm mb-4" style={{ color: NAVY }}>
                  Categories
                </h3>
                <ul className="flex flex-col gap-1">
                  {/* ALL */}
                  <li>
                    <button
                      onClick={() => setFilter("All")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={filter === "All"
                        ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }
                        : { color: "#64748b" }
                      }
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap size={13} /> All Courses
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={filter === "All"
                          ? { background: "rgba(0,0,0,0.15)", color: "#fff" }
                          : { background: "#f1f5f9", color: "#64748b" }
                        }
                      >
                        {courses.length}
                      </span>
                    </button>
                  </li>

                  {categories.map((cat) => {
                    const Icon = iconMap[cat.icon] || Palette;
                    const active = filter === cat.name;
                    const count  = courses.filter(c => c.category === cat.name).length;
                    return (
                      <li key={cat.name}>
                        <button
                          onClick={() => setFilter(cat.name)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-slate-50"
                          style={active
                            ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }
                            : { color: "#475569" }
                          }
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={13} /> {cat.name}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            style={active
                              ? { background: "rgba(0,0,0,0.15)", color: "#fff" }
                              : { background: "#f1f5f9", color: "#94a3b8" }
                            }
                          >
                            {count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* sort */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-heading font-extrabold text-sm mb-3" style={{ color: NAVY }}>Sort By</h3>
                <div className="flex flex-col gap-1.5">
                  {[
                    { val: "default",    label: "Default" },
                    { val: "rating",     label: "Highest Rated" },
                    { val: "price-asc",  label: "Price: Low → High" },
                    { val: "price-desc", label: "Price: High → Low" },
                  ].map((opt) => (
                    <button key={opt.val}
                      onClick={() => setSort(opt.val as any)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left"
                      style={sort === opt.val
                        ? { background: `rgba(234,179,8,0.10)`, color: GOLD2, border: `1px solid rgba(234,179,8,0.25)` }
                        : { color: "#64748b", border: "1px solid transparent" }
                      }
                    >
                      <span
                        className="w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: sort === opt.val ? GOLD : "#cbd5e1" }}
                      >
                        {sort === opt.val && (
                          <span className="w-1.5 h-1.5 rounded-full block"
                            style={{ background: GOLD }} />
                        )}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* clear btn */}
              {hasActive && (
                <button onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all hover:scale-105"
                  style={{ borderColor: "#fca5a5", color: "#ef4444", background: "#fff1f2" }}>
                  <X size={12} /> Clear All Filters
                </button>
              )}
            </aside>

            {/* ════════════════════════
                MAIN CONTENT
            ════════════════════════ */}
            <div className="flex-1 min-w-0">

              {/* ── toolbar (mobile filter btn + sort + results count) ── */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  {/* mobile filter toggle */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-yellow-400 transition-all"
                  >
                    <Filter size={12} /> Filters
                    {hasActive && (
                      <span className="w-4 h-4 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center"
                        style={{ background: GOLD }}>!</span>
                    )}
                  </button>

                  <p className="text-sm text-slate-500">
                    <span className="font-extrabold" style={{ color: NAVY }}>{filtered.length}</span>{" "}
                    {filtered.length === 1 ? "course" : "courses"}
                    {filter !== "All" && <span className="text-slate-400"> in <span className="font-semibold" style={{ color: GOLD2 }}>{filter}</span></span>}
                  </p>
                </div>

                {/* desktop sort dropdown */}
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Sort:</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as any)}
                    className="pl-3 pr-7 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 bg-white focus:outline-none appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                    <option value="default">Default</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                  </select>
                </div>
              </div>

              {/* active filter chips */}
              {hasActive && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {filter !== "All" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "rgba(234,179,8,0.12)", color: GOLD2, border: "1px solid rgba(234,179,8,0.25)" }}>
                      {filter}
                      <button onClick={() => setFilter("All")}><X size={11} /></button>
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "rgba(234,179,8,0.12)", color: GOLD2, border: "1px solid rgba(234,179,8,0.25)" }}>
                      "{search}"
                      <button onClick={() => setSearch("")}><X size={11} /></button>
                    </span>
                  )}
                  {sort !== "default" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "rgba(234,179,8,0.12)", color: GOLD2, border: "1px solid rgba(234,179,8,0.25)" }}>
                      {sort === "rating" ? "Highest Rated" : sort === "price-asc" ? "Price ↑" : "Price ↓"}
                      <button onClick={() => setSort("default")}><X size={11} /></button>
                    </span>
                  )}
                </div>
              )}

              {/* course grid */}
              <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                  <motion.div layout
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center py-24 bg-white rounded-2xl border border-slate-100"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(234,179,8,0.08)", border: `2px solid rgba(234,179,8,0.2)` }}>
                      <Search size={24} style={{ color: GOLD }} />
                    </div>
                    <h3 className="font-heading font-extrabold text-lg mb-2" style={{ color: NAVY }}>No courses found</h3>
                    <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto">
                      Try adjusting your filters or search term.
                    </p>
                    <button onClick={clearFilters}
                      className="inline-flex items-center gap-2 font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:scale-105"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                      <X size={13} /> Clear Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE SIDEBAR DRAWER
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            {/* drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-full w-72 overflow-y-auto flex flex-col gap-5 p-5"
              style={{ background: "#fff", boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}
            >
              {/* drawer header */}
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-heading font-extrabold text-base" style={{ color: NAVY }}>
                  Filters
                </h2>
                <button onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100">
                  <X size={16} style={{ color: NAVY }} />
                </button>
              </div>

              {/* search */}
              <div>
                <h3 className="font-bold text-xs mb-2 uppercase tracking-wider text-slate-400">Search</h3>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search courses…" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              {/* categories */}
              <div>
                <h3 className="font-bold text-xs mb-2 uppercase tracking-wider text-slate-400">Categories</h3>
                <ul className="flex flex-col gap-1">
                  <li>
                    <button onClick={() => { setFilter("All"); setSidebarOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={filter === "All"
                        ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }
                        : { color: "#64748b" }}>
                      <span className="flex items-center gap-2"><GraduationCap size={13} /> All Courses</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: filter === "All" ? "rgba(0,0,0,0.15)" : "#f1f5f9", color: filter === "All" ? "#fff" : "#94a3b8" }}>
                        {courses.length}
                      </span>
                    </button>
                  </li>
                  {categories.map((cat) => {
                    const Icon = iconMap[cat.icon] || Palette;
                    const active = filter === cat.name;
                    const count  = courses.filter(c => c.category === cat.name).length;
                    return (
                      <li key={cat.name}>
                        <button onClick={() => { setFilter(cat.name); setSidebarOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={active
                            ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }
                            : { color: "#475569" }}>
                          <span className="flex items-center gap-2"><Icon size={13} />{cat.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: active ? "rgba(0,0,0,0.15)" : "#f1f5f9", color: active ? "#fff" : "#94a3b8" }}>
                            {count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* sort */}
              <div>
                <h3 className="font-bold text-xs mb-2 uppercase tracking-wider text-slate-400">Sort By</h3>
                {[
                  { val: "default",    label: "Default" },
                  { val: "rating",     label: "Highest Rated" },
                  { val: "price-asc",  label: "Price: Low → High" },
                  { val: "price-desc", label: "Price: High → Low" },
                ].map((opt) => (
                  <button key={opt.val} onClick={() => setSort(opt.val as any)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left mb-1"
                    style={sort === opt.val
                      ? { background: "rgba(234,179,8,0.10)", color: GOLD2, border: `1px solid rgba(234,179,8,0.25)` }
                      : { color: "#64748b", border: "1px solid transparent" }}>
                    <span className="w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center"
                      style={{ borderColor: sort === opt.val ? GOLD : "#cbd5e1" }}>
                      {sort === opt.val && <span className="w-1.5 h-1.5 rounded-full block" style={{ background: GOLD }} />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {hasActive && (
                <button onClick={() => { clearFilters(); setSidebarOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border mt-auto"
                  style={{ borderColor: "#fca5a5", color: "#ef4444", background: "#fff1f2" }}>
                  <X size={12} /> Clear All Filters
                </button>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
        <div className="container text-center max-w-xl mx-auto">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
            <GraduationCap size={24} className="text-white" />
          </div>
          <h2 className="font-heading font-extrabold text-white text-2xl md:text-3xl mb-3">
            Can't find what you're looking for?
          </h2>
          <p className="text-slate-400 text-sm mb-7 leading-relaxed">
            Contact us — we may offer custom training or upcoming courses to suit your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent("Hello! I'd like to enquire about a course.")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-extrabold px-7 py-3 rounded-full text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
              WhatsApp Us
            </a>
            <Link to="/contact"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-full text-sm border text-white hover:bg-white/10 transition-all"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}>
              Contact Us <ArrowRight size={13} />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-5">
            📞{" "}
            <a href={`tel:${BUSINESS_INFO.phone}`} className="hover:underline" style={{ color: GOLD2 }}>{BUSINESS_INFO.phone}</a>
            {" · "}
            <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:underline" style={{ color: GOLD2 }}>{BUSINESS_INFO.email}</a>
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
