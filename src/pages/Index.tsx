import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, Users, BookOpen, Award, CheckCircle, Monitor, Brain,
  Share2, Palette, Globe, Home, TrendingUp, Code, FileText,
  Briefcase, Heart, ArrowRight, Mail, MessageCircle,
  GraduationCap, Rocket, Lightbulb, Trophy, Zap,
  Clock, BarChart2, ChevronRight, MapPin
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import {
  courses,
  testimonials,
  categories,
  partnerLogos,
  BUSINESS_INFO,
} from "@/data/mockData";
import heroImage from "@/assets/hero-image.jpg";

/* ─── icon map ─────────────────────────────────────────────── */
const iconMap: Record<string, any> = {
  Monitor, Brain, Share2, Palette, Globe, Home, Users,
  TrendingUp, Code, FileText, Briefcase, Heart,
};

/* ─── animation presets ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const whatsappEnroll = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(
  "Hello HandyGidi Training Centre! I'm interested in enrolling for a course. Please send me more details."
)}`;

/* ─── colour tokens ─────────────────────────────────────────── */
const NAVY = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD = "#EAB308";
const GOLD2 = "#CA8A04";

/* ════════════════════════════════════════════════════════════
   SECTION LABEL
════════════════════════════════════════════════════════════ */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
    style={{
      background: "rgba(234,179,8,0.10)",
      color: GOLD2,
      border: "1px solid rgba(234,179,8,0.22)",
    }}
  >
    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: GOLD }} />
    {children}
  </span>
);

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

const CourseCard = ({ course, index }: { course: Course; index: number }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
  >
    {/* image */}
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
      {/* sponsored badge */}
      {course.sponsored && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
          Sponsored
        </span>
      )}
    </div>

    {/* body */}
    <div className="p-5 flex flex-col flex-1">
      <h3
        className="font-heading font-bold text-[15px] leading-snug mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2 flex-1"
        style={{ color: NAVY }}
      >
        {course.title}
      </h3>

      {/* meta row */}
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {course.duration}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={11} /> {course.lessons} lessons
        </span>
        <span className="flex items-center gap-1">
          <Star size={11} style={{ color: GOLD, fill: GOLD }} />
          {course.rating}
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} /> {course.enrolled}
        </span>
      </div>

      {/* price + enroll */}
      <div className="flex items-center justify-between mt-auto">
        <span className="font-extrabold text-lg" style={{ color: NAVY }}>
          {course.price === 0 ? (
            <span className="text-emerald-500">Free</span>
          ) : (
            `₦${course.price.toLocaleString()}`
          )}
        </span>
        <Link
          to={`/courses/${course.id}`}
          className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
          style={{ color: GOLD2 }}
        >
          Enroll <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════
   TESTIMONIAL CARD
════════════════════════════════════════════════════════════ */
interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

const TestimonialCard = ({
  t,
  index,
}: {
  t: Testimonial;
  index: number;
}) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="rounded-2xl p-6 border relative overflow-hidden flex flex-col"
    style={{ background: NAVY2, borderColor: "rgba(234,179,8,0.18)" }}
  >
    <div
      className="absolute -top-6 -right-6 w-28 h-28 rounded-full"
      style={{ background: `radial-gradient(circle,rgba(234,179,8,0.14),transparent)` }}
    />
    {/* stars */}
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: t.rating }).map((_, i) => (
        <Star key={i} size={13} style={{ color: GOLD, fill: GOLD }} />
      ))}
    </div>
    {/* quote */}
    <p className="text-slate-300 text-sm leading-relaxed mb-5 flex-1">
      "{t.quote}"
    </p>
    {/* avatar + name */}
    <div className="flex items-center gap-3">
      <img
        src={t.avatar}
        alt={t.name}
        className="w-9 h-9 rounded-full object-cover border-2"
        style={{ borderColor: GOLD + "44" }}
      />
      <div>
        <p className="font-bold text-white text-sm">{t.name}</p>
        <p className="text-xs text-slate-400">{t.role}</p>
      </div>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function Index() {
  /* category filter tabs derived from real data */
  const allCategoryNames = ["All", ...categories.map((c) => c.name)];
  const filterTabs = allCategoryNames.slice(0, 6); // show first 6

  return (
    <MainLayout>
      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 55%,${NAVY2} 100%)`,
        }}
      >
        {/* bg grid */}
        <div className="pointer-events-none absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.035]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                patternUnits="userSpaceOnUse"
                width="40"
                height="40"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#EAB308"
                  strokeWidth="0.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* gold glow top-right */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[500px] -translate-y-1/4 translate-x-1/4 opacity-20 rounded-full"
            style={{
              background: `radial-gradient(circle,${GOLD} 0%,transparent 70%)`,
            }}
          />
        </div>

        <div className="container relative z-10 py-16 md:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* ── LEFT copy ── */}
          <motion.div
            className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span
                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
                style={{
                  background: "rgba(234,179,8,0.12)",
                  border: "1px solid rgba(234,179,8,0.28)",
                  color: GOLD,
                }}
              >
                <Rocket size={11} /> Abuja's #1 Hands-On Training Centre
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-heading font-extrabold leading-[1.07] text-white mb-5"
              style={{ fontSize: "clamp(2.2rem,5.2vw,3.7rem)" }}
            >
              {BUSINESS_INFO.tagline.split(" ").slice(0, 2).join(" ")}{" "}
              <br />
              <span style={{ color: GOLD }}>With Your Hands.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-300 text-base md:text-lg max-w-md mx-auto lg:mx-0 mb-3 leading-relaxed"
            >
              <strong className="text-white">Learn It. Master It. Earn From It.</strong>
            </motion.p>
    
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 font-extrabold px-8 py-3.5 rounded-full text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                  color: "#060d1c",
                  boxShadow: `0 8px 32px rgba(234,179,8,0.38)`,
                }}
              >
                <Zap size={15} /> Start Learning Today
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-full text-sm border text-white hover:bg-white/10 transition-all"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                Browse All Courses <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* social-proof pills */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: Users, v: "500+", l: "Students Trained" },
                { icon: Star, v: "4.8★", l: "Avg Rating" },
                { icon: BookOpen, v: "14+", l: "Courses" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    color: "#fff",
                  }}
                >
                  <s.icon size={11} style={{ color: GOLD }} />
                  <span style={{ color: GOLD }}>{s.v}</span>
                  <span className="text-slate-300">{s.l}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT image ── */}
          <motion.div
            className="flex-1 max-w-sm lg:max-w-md relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* gold glow behind */}
            <div
              className="absolute inset-0 rounded-3xl blur-3xl scale-90 opacity-30"
              style={{
                background: `radial-gradient(circle,rgba(234,179,8,0.35),transparent 70%)`,
              }}
            />

            {/* course count badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 180 }}
              className="absolute -top-6 -left-6 z-20 rounded-2xl px-4 py-3 text-center shadow-2xl"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
            >
              <p className="font-extrabold text-2xl leading-none text-white">
                {courses.length}+
              </p>
              <p className="text-[10px] font-bold text-yellow-900">Courses</p>
            </motion.div>

            {/* top-rated badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-6 -right-6 z-20 bg-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3"
              style={{ minWidth: 170 }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg,${NAVY},${NAVY2})` }}
              >
                <Trophy size={16} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Top Rated</p>
                <p className="text-[10px] text-slate-400">Instructors</p>
              </div>
            </motion.div>

            {/* enrolled bubble */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="absolute top-10 -right-8 z-20 bg-white rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2"
            >
              <div className="flex -space-x-2">
                {[GOLD, NAVY, NAVY2, "#3b82f6"].map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-700">500+ enrolled</p>
            </motion.div>

            <img
              src={heroImage}
              alt="Students at HandyGidi Training Centre Abuja"
              className="relative z-10 rounded-3xl shadow-2xl w-full object-cover"
              style={{
                aspectRatio: "4/5",
                border: `3px solid rgba(234,179,8,0.32)`,
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PARTNERS STRIP
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-100 py-7">
        <div className="container">
          <p className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-300 mb-5">
            Tools &amp; Platforms We Train With
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
            {partnerLogos.map((p) => (
              <span
                key={p}
                className="font-heading font-black text-xl select-none"
                style={{ color: "#d1d5db" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOR BEGINNERS / PROFESSIONALS (two-card split)
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 md:py-20">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              tag: "For Beginners",
              heading: "Start from zero,\ngrow fast.",
              sub: "No prior experience needed. Our curriculum takes you from basics to job-ready digital skills.",
              icon: Lightbulb,
              cta: "Explore Courses",
              to: "/courses",
              dark: true,
            },
            {
              tag: "For Professionals",
              heading: "Upgrade your\nskill set.",
              sub: "Stay ahead with advanced digital skills, AI tools, and business strategy programs.",
              icon: Rocket,
              cta: "See Advanced Courses",
              to: "/courses",
              dark: false,
            },
          ].map((card, i) => (
            <motion.div
              key={card.tag}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
              style={{
                background: card.dark
                  ? `linear-gradient(135deg,#060d1c,${NAVY2})`
                  : `linear-gradient(135deg,${GOLD},#92400e)`,
              }}
            >
              <div className="absolute -bottom-8 -right-8 opacity-[0.08]">
                <card.icon size={140} className="text-white" />
              </div>
              <span
                className="text-[11px] font-extrabold uppercase tracking-widest mb-3 block"
                style={{
                  color: card.dark ? GOLD : "rgba(255,255,255,0.65)",
                }}
              >
                {card.tag}
              </span>
              <h3 className="font-heading font-extrabold text-white text-2xl md:text-3xl leading-tight mb-3 whitespace-pre-line">
                {card.heading}
              </h3>
              <p className="text-white/65 text-sm mb-7 max-w-xs leading-relaxed">
                {card.sub}
              </p>
              <Link
                to={card.to}
                className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-2.5 rounded-full transition-all hover:scale-105"
                style={{
                  background: card.dark
                    ? `linear-gradient(135deg,${GOLD},${GOLD2})`
                    : "rgba(255,255,255,0.92)",
                  color: card.dark ? "#060d1c" : "#92400e",
                }}
              >
                {card.cta} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATEGORIES — from real mockData
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <SectionLabel>Our Programs</SectionLabel>
            <h2
              className="font-heading font-extrabold"
              style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", color: NAVY }}
            >
              Explore Top{" "}
              <span className="relative inline-block" style={{ color: GOLD }}>
                Categories
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="5"
                  viewBox="0 0 120 5"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q30 0 60 4 Q90 8 120 4"
                    stroke={GOLD}
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              {categories.length} program categories · {courses.length} total courses
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const Icon = iconMap[cat.icon] || Palette;
              return (
                <motion.div
                  key={cat.name}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group cursor-pointer bg-white border border-slate-100 rounded-2xl p-5 md:p-6 text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  style={{ ["--hover-bg" as any]: NAVY }}
                >
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Icon
                      size={20}
                      className="transition-colors duration-300"
                      style={{ color: NAVY2 }}
                    />
                  </div>
                  <h3
                    className="font-heading font-bold text-sm mb-1"
                    style={{ color: NAVY }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400">{cat.count} Course{cat.count !== 1 ? "s" : ""}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          COURSES — real course data
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <SectionLabel>Popular Now</SectionLabel>
              <h2
                className="font-heading font-extrabold"
                style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", color: NAVY }}
              >
                Discover Our Best{" "}
                <span style={{ color: GOLD }}>Courses</span>
              </h2>
            </div>
            <Link
              to="/courses"
              className="text-sm font-extrabold flex items-center gap-1.5 hover:gap-2.5 transition-all"
              style={{ color: GOLD2 }}
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {/* filter tabs */}
          <div className="flex gap-2 flex-wrap mb-8">
            {filterTabs.map((tab, i) => (
              <button
                key={tab}
                className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105"
                style={
                  i === 0
                    ? {
                        background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                        color: "#060d1c",
                        border: "none",
                      }
                    : {
                        background: "transparent",
                        color: "#64748b",
                        borderColor: "#e2e8f0",
                      }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 font-extrabold px-8 py-3 rounded-full border-2 transition-all hover:scale-105"
              style={{ borderColor: GOLD, color: GOLD2 }}
            >
              Other Courses ({courses.length - 6} more) <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY TRUST US
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-16 md:py-24"
        style={{
          background: `linear-gradient(135deg,#060d1c,${NAVY})`,
        }}
      >
        <div className="container">
          <div className="text-center mb-12">
            <SectionLabel>Why Choose Us</SectionLabel>
            <h2
              className="font-heading font-extrabold text-white"
              style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}
            >
              Why Trust <span style={{ color: GOLD }}>HandyGidi?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: CheckCircle,
                title: "Hands-On Training",
                desc: "Learn by doing — every class includes real-world projects and practical exercises.",
              },
              {
                icon: Award,
                title: "Expert Instructors",
                desc: "Learn from certified professionals with real industry experience.",
              },
              {
                icon: Users,
                title: "Small Class Sizes",
                desc: "Personalized attention and mentorship to help you succeed.",
              },
              {
                icon: BookOpen,
                title: "Flexible Payment",
                desc: "Affordable fees with flexible payment plans to suit your budget.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(234,179,8,0.14)",
                }}
              >
                <div
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(234,179,8,0.10)",
                    border: `1px solid rgba(234,179,8,0.24)`,
                  }}
                >
                  <item.icon size={20} style={{ color: GOLD }} />
                </div>
                <h3 className="font-heading font-bold mb-2 text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "5+", label: "Years of Experience", icon: Trophy },
            { value: "500+", label: "Students Trained", icon: Users },
            { value: `${courses.length}+`, label: "Courses Available", icon: BookOpen },
            { value: "Lugbe", label: "Location · Abuja", icon: MapPin },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div
                className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
              >
                <s.icon size={16} className="text-white" />
              </div>
              <p
                className="font-heading font-extrabold text-4xl md:text-5xl mb-1"
                style={{ color: NAVY }}
              >
                {s.value}
              </p>
              <p className="text-sm text-slate-400 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS — real data (quote field)
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <SectionLabel>Student Stories</SectionLabel>
            <h2
              className="font-heading font-extrabold"
              style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", color: NAVY }}
            >
              What Our <span style={{ color: GOLD }}>Learners</span> Say
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} t={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          INTERN / HIRING BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="container">
          <div
            className="rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12"
            style={{
              background: `linear-gradient(135deg,#060d1c,${NAVY2})`,
            }}
          >
            {/* dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`,
                backgroundSize: "22px 22px",
              }}
            />
            <GraduationCap
              size={180}
              className="absolute -right-6 -bottom-6 opacity-[0.05] text-white pointer-events-none"
            />
            <div className="relative">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                style={{
                  background: "rgba(234,179,8,0.12)",
                  border: "1px solid rgba(234,179,8,0.24)",
                  color: GOLD,
                }}
              >
                <Rocket size={10} /> We Are Hiring Interns!
              </span>
              <h3 className="font-heading font-extrabold text-white text-2xl md:text-3xl leading-tight mb-2">
                You can join HandyGidi
                <br className="hidden md:block" /> as{" "}
                <span style={{ color: GOLD }}>an intern?</span>
              </h3>
              <p className="text-slate-400 text-sm max-w-xs mt-1">
                Gain real-world experience and kickstart your career with HandyGidi Training Centre.
              </p>
            </div>
            <Link
              to="/contact"
              className="relative inline-flex items-center gap-2 font-extrabold px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{
                background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                color: "#060d1c",
                boxShadow: `0 8px 32px rgba(234,179,8,0.38)`,
              }}
            >
              Apply Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    
      {/* ══════════════════════════════════════════════════════
          SUBSCRIBE — on dark navy
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-14"
        style={{
          background: `linear-gradient(135deg,#060d1c,${NAVY})`,
          borderTop: `1px solid rgba(234,179,8,0.12)`,
        }}
      >
        <div className="container text-center max-w-lg mx-auto">
          <h2 className="font-heading font-extrabold text-white text-2xl md:text-3xl mb-2">
            Subscribe for Updates &amp; Discounts
          </h2>
          <p className="text-sm text-slate-400 mb-7">
            Get early access to new courses and exclusive student discounts from{" "}
            <span style={{ color: GOLD }}>{BUSINESS_INFO.name}</span>.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "#64748b" }}
              />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-3.5 rounded-full bg-white/10 border text-sm text-white placeholder:text-slate-500 focus:outline-none"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = `rgba(234,179,8,0.5)`)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")
                }
              />
            </div>
            <button
              className="px-6 py-3.5 rounded-full font-extrabold text-sm transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                color: "#060d1c",
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
