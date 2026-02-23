import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, Users, Clock, BookOpen, ArrowRight,
  GraduationCap, SlidersHorizontal, X, Sparkles
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { courses, categories, BUSINESS_INFO } from "@/data/mockData";

/* ─── colour tokens ─────────────────────────────────────────── */
const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

/* ─── animation ─────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};
const cardVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1,    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.94, y: -8,
    transition: { duration: 0.22 } },
};

/* ════════════════════════════════════════════════════════════
   COURSE CARD
════════════════════════════════════════════════════════════ */
interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  lessons: number;
  duration: string;
  instructor: string;
  image: string;
  enrolled: number;
  description: string;
  sponsored?: boolean;
}

const CourseCard = ({ course }: { course: Course }) => (
  <motion.div
    layout
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
  >
    {/* thumbnail */}
    <div className="relative overflow-hidden h-44 bg-slate-100 shrink-0">
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* category pill */}
      <span
        className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide text-white"
        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
      >
        {course.category}
      </span>
      {/* sponsored */}
      {course.sponsored && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
          Sponsored
        </span>
      )}
      {/* instructor overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-[10px] text-white/80 font-medium">by {course.instructor}</p>
      </div>
    </div>

    {/* body */}
    <div className="p-5 flex flex-col flex-1">
      <h3
        className="font-heading font-bold text-[15px] leading-snug mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2"
        style={{ color: NAVY }}
      >
        {course.title}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2 flex-1">
        {course.description}
      </p>

      {/* meta */}
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {course.duration}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={11} /> {course.lessons} lessons
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} /> {course.enrolled}
        </span>
      </div>

      {/* rating bar */}
      <div className="flex items-center gap-1.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            style={{
              color: i < Math.floor(course.rating) ? GOLD : "#e2e8f0",
              fill:  i < Math.floor(course.rating) ? GOLD : "#e2e8f0",
            }}
          />
        ))}
        <span className="text-xs font-semibold text-slate-500 ml-0.5">{course.rating}</span>
      </div>

      {/* price + enroll */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          {course.price === 0 ? (
            <span className="font-extrabold text-lg text-emerald-500">Free</span>
          ) : (
            <>
              <span className="font-extrabold text-lg" style={{ color: NAVY }}>
                ₦{course.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">one-time</span>
            </>
          )}
        </div>
        <Link
          to={`/courses/${course.id}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold px-4 py-2 rounded-full transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}
        >
          Enroll <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function Courses() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch]  = useState("");
  const [sort, setSort]       = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [showFilters, setShowFilters] = useState(false);

  const allTabs = ["All", ...categories.map((c) => c.name)];

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
  const hasActiveFilters = filter !== "All" || search !== "" || sort !== "default";

  return (
    <MainLayout>
      {/* ══════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 55%,${NAVY2} 100%)` }}
      >
        {/* grid texture */}
        <div className="pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAB308" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div
            className="absolute top-0 right-0 w-96 h-96 opacity-15 rounded-full -translate-y-1/3 translate-x-1/3"
            style={{ background: `radial-gradient(circle,${GOLD},transparent 70%)` }}
          />
        </div>

        <div className="container relative z-10 py-14 md:py-20 text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.span
              variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.28)", color: GOLD }}
            >
              <Sparkles size={11} /> {courses.length} Courses Available
            </motion.span>

            <motion.h1
              variants={fadeUp} custom={1}
              className="font-heading font-extrabold text-white mb-4"
              style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
            >
              All Our <span style={{ color: GOLD }}>Courses</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2}
              className="text-slate-300 text-base max-w-lg mx-auto mb-8 leading-relaxed"
            >
              Practical, hands-on training designed for real results. All prices in Nigerian Naira (₦). Flexible payment plans available.
            </motion.p>

            {/* hero search bar */}
            <motion.div
              variants={fadeUp} custom={3}
              className="relative max-w-md mx-auto"
            >
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "#94a3b8" }}
              />
              <input
                type="text"
                placeholder="Search courses by name or topic…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-full bg-white/10 border text-sm text-white placeholder:text-slate-400 focus:outline-none"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `rgba(234,179,8,0.5)`)}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </motion.div>

            {/* quick stats */}
            <motion.div
              variants={fadeUp} custom={4}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              {[
                { icon: GraduationCap, v: "500+", l: "Students" },
                { icon: Star,          v: "4.8★",  l: "Avg Rating" },
                { icon: BookOpen,      v: `${courses.length}`,   l: "Courses" },
                { icon: Users,         v: "1",      l: "Location" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white"
                  style={{ opacity: 0.75 }}
                >
                  <s.icon size={12} style={{ color: GOLD }} />
                  <span style={{ color: GOLD }}>{s.v}</span>
                  <span className="text-slate-300">{s.l}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FILTER BAR
      ══════════════════════════════════════════════════════ */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="container py-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">

            {/* category tabs — scrollable */}
            <div className="flex gap-2 flex-wrap flex-1">
              {allTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105 whitespace-nowrap"
                  style={
                    filter === cat
                      ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c", border: "none" }
                      : { background: "transparent", color: "#64748b", borderColor: "#e2e8f0" }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* sort + clear */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <SlidersHorizontal
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="pl-8 pr-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 bg-white focus:outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <option value="default">Sort: Default</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105"
                  style={{ borderColor: "#fca5a5", color: "#ef4444", background: "#fff1f2" }}
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RESULTS
      ══════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-slate-50 min-h-[60vh]">
        <div className="container">

          {/* results meta */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 font-medium">
              Showing{" "}
              <span className="font-extrabold" style={{ color: NAVY }}>
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "course" : "courses"}
              {filter !== "All" && (
                <span> in <span className="font-bold" style={{ color: GOLD2 }}>{filter}</span></span>
              )}
              {search && (
                <span> for "<span className="font-bold" style={{ color: GOLD2 }}>{search}</span>"</span>
              )}
            </p>
          </div>

          {/* grid */}
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                key="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div
                  className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(234,179,8,0.10)", border: "2px solid rgba(234,179,8,0.2)" }}
                >
                  <Search size={28} style={{ color: GOLD }} />
                </div>
                <h3 className="font-heading font-extrabold text-xl mb-2" style={{ color: NAVY }}>
                  No courses found
                </h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}
                >
                  <X size={13} /> Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-14"
        style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}
      >
        <div className="container text-center max-w-xl mx-auto">
          <div
            className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
          >
            <GraduationCap size={24} className="text-white" />
          </div>
          <h2 className="font-heading font-extrabold text-white text-2xl md:text-3xl mb-3">
            Can't find what you're looking for?
          </h2>
          <p className="text-slate-400 text-sm mb-7 leading-relaxed">
            Contact us directly — we may offer custom training or upcoming courses to suit your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent("Hello! I'd like to enquire about a course.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-extrabold px-7 py-3 rounded-full text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}
            >
              WhatsApp Us
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-full text-sm border text-white hover:bg-white/10 transition-all"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              Contact Us <ArrowRight size={13} />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-5">
            📞{" "}
            <a href={`tel:${BUSINESS_INFO.phone}`} className="hover:underline" style={{ color: GOLD2 }}>
              {BUSINESS_INFO.phone}
            </a>
            {" · "}
            <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:underline" style={{ color: GOLD2 }}>
              {BUSINESS_INFO.email}
            </a>
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
