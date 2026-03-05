import { motion } from "framer-motion";
import { Target, Eye, CheckCircle, MapPin, Users, BookOpen, Trophy, Star, Sparkles, Heart, Zap, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { BUSINESS_INFO } from "@/data/mockData";
import about1 from "@/assets/about1.jpg";


/* ─── tokens ─────────────────────────────────────────────── */
const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

/* ─── animation ─────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeLeft = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const fadeRight = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── section label ─────────────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
    style={{ background: "rgba(234,179,8,0.10)", color: GOLD2, border: "1px solid rgba(234,179,8,0.22)" }}
  >
    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: GOLD }} />
    {children}
  </span>
);

/* ─── team data ─────────────────────────────────────────────── */
const boardMembers = [
  { name: "Daniel Osamede Ehanah", role: "Managing Director",               initial: "DE" },
  { name: "Daniella Adesuwa Ehanah", role: "Director, Research & Development", initial: "DA" },
  { name: "Emmanuel O. Ochokwunu",  role: "Head, Trainer",                  initial: "EO" },
];

export default function About() {
  return (
    <MainLayout>

      {/* ══════════════════════════════════════════════════════
          HERO — split layout with diagonal cut
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 55%,${NAVY2} 100%)` }}
      >
        {/* grid bg */}
        <div className="pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAB308" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"
            style={{ background: `radial-gradient(circle,${GOLD},transparent 70%)` }} />
        </div>

        <div className="container relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-16 md:py-20 lg:py-24">

          {/* left — text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial="hidden" animate="visible"
          >
            <motion.span variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.28)", color: GOLD }}>
              <Sparkles size={11} /> Lugbe, Abuja · Nigeria
            </motion.span>

            <motion.h1 variants={fadeUp} custom={1}
              className="font-heading font-extrabold text-white mb-5"
              style={{ fontSize: "clamp(2.2rem,5.5vw,3.8rem)", lineHeight: 1.1 }}>
              About <span style={{ color: GOLD }}>HandyGidi</span><br />Training Centre
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg lg:mx-0 mx-auto">
              <em style={{ color: GOLD, fontStyle: "normal", fontWeight: 700 }}>"{BUSINESS_INFO.tagline}"</em>
              {" "}— equipping individuals with practical digital, business, and leadership skills
              that lead to real income and career opportunities.
            </motion.p>

            {/* stat pills */}
            <motion.div variants={fadeUp} custom={3}
              className="flex flex-wrap justify-center lg:justify-start gap-3">
              {[
                { icon: Users,    v: "500+", l: "Graduates" },
                { icon: BookOpen, v: "14+",  l: "Programs" },
                { icon: Star,     v: "4.8★", l: "Rating" },
                { icon: Trophy,   v: "95%",  l: "Satisfaction" },
              ].map(s => (
                <div key={s.l}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", color: "#fff" }}>
                  <s.icon size={11} style={{ color: GOLD }} />
                  <span style={{ color: GOLD }}>{s.v}</span>
                  <span className="text-slate-300">{s.l}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* right — decorative navy card */}
          <motion.div
            className="w-full lg:flex-1 flex items-center justify-center"
            variants={fadeRight} initial="hidden" animate="visible"
          >
            <div className="rounded-3xl p-8 relative w-full max-w-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(234,179,8,0.15)", backdropFilter: "blur(10px)" }}>
              <div className="absolute inset-0 opacity-[0.05] rounded-3xl"
                style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "18px 18px" }} />
              <span className="text-5xl block mb-4">🏫</span>
              <h3 className="font-heading font-extrabold text-white text-xl mb-3 relative z-10">
                A Training Centre<br />
                <span style={{ color: GOLD }}>Built for Real Results</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5 relative z-10">
                Founded in Lugbe, Abuja — turning everyday people into skilled, income-earning professionals.
              </p>
              <div className="flex items-start gap-2 text-xs text-slate-300 relative z-10">
                <MapPin size={13} style={{ color: GOLD, marginTop: 2 }} className="shrink-0" />
                <span>{BUSINESS_INFO.address}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* angled bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "polygon(0 100%,100% 100%,100% 0)" }} />
      </section>


      {/* ══════════════════════════════════════════════════════
          OUR STORY — magazine two-col
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <SectionLabel>Our Story</SectionLabel>
              <h2 className="font-heading font-extrabold mb-6"
                style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", color: NAVY }}>
                Why We Started <span style={{ color: GOLD }}>HandyGidi</span>
              </h2>
              <div className="flex flex-col gap-4 text-sm text-slate-500 leading-relaxed">
                <p>
                  <strong className="text-slate-700">HANDY GIDI Training Centre</strong> was founded with a clear mission: to equip individuals with practical digital, business, and leadership skills that lead to real income and career opportunities.
                </p>
                <p>
                  Located in Lugbe, Abuja, we focus on <strong className="text-slate-700">hands-on training, small class sizes,</strong> and real-world projects so our students don't just learn — they become job-ready and business-ready.
                </p>
                <p>
                  Our programs are designed for students, job seekers, entrepreneurs, working professionals, women, and young people who want to build valuable skills for today's digital economy.
                </p>
                <p className="font-semibold" style={{ color: NAVY }}>
                  At HANDY GIDI, we don't just teach — we empower, mentor, and help you unlock your full potential.
                </p>
              </div>
              <div className="mt-7 flex flex-col gap-2.5">
                {[
                  "Certified & experienced instructors",
                  "Small class sizes for personal attention",
                  "Real-world projects in every course",
                  "Flexible payment plans available",
                  "Job-ready & business-ready graduates",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                      <CheckCircle size={11} className="text-white" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* right — vertical accent bar */}
            <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                style={{ background: `linear-gradient(to bottom,${GOLD},${GOLD2},transparent)` }} />
              <div className="pl-8 flex flex-col gap-6">
                {[
                  { num: "01", title: "Hands-On Training", body: "Every course is built around practical exercises and live projects — not just theory." },
                  { num: "02", title: "Expert Instructors", body: "Our trainers bring real industry experience to every class session." },
                  { num: "03", title: "Career Support", body: "From CV building to job placement assistance — we stay with you after graduation." },
                  { num: "04", title: "Flexible Learning", body: "Weekend and evening classes designed for busy individuals and professionals." },
                ].map((p, i) => (
                  <motion.div key={p.num} variants={fadeUp} custom={i}
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="flex gap-4 items-start">
                    <span className="font-heading font-extrabold text-2xl leading-none shrink-0"
                      style={{ color: "rgba(234,179,8,0.25)" }}>{p.num}</span>
                    <div>
                      <p className="font-heading font-extrabold text-sm mb-1" style={{ color: NAVY }}>{p.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          MISSION & VISION
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>What Drives Us</SectionLabel>
            <h2 className="font-heading font-extrabold"
              style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", color: NAVY }}>
              Our Mission &amp; <span style={{ color: GOLD }}>Vision</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
              <div className="absolute -bottom-6 -right-6 opacity-[0.07]">
                <Target size={130} className="text-white" />
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Target size={22} className="text-white" />
              </div>
              <h3 className="font-heading font-extrabold text-white text-xl mb-3">Our Mission</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                To provide accessible, high-quality practical training that equips learners with the skills they need to thrive in today's digital economy — regardless of their background or previous education.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-3xl p-8 relative overflow-hidden border"
              style={{ background: "#fff", borderColor: "rgba(234,179,8,0.2)" }}>
              <div className="absolute -bottom-6 -right-6 opacity-[0.05]">
                <Eye size={130} style={{ color: GOLD }} />
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(234,179,8,0.10)", border: `1px solid rgba(234,179,8,0.25)` }}>
                <Eye size={22} style={{ color: GOLD }} />
              </div>
              <h3 className="font-heading font-extrabold text-xl mb-3" style={{ color: NAVY }}>Our Vision</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                To become Nigeria's leading practical training centre, known for transforming lives through hands-on education and fostering a new generation of skilled professionals and entrepreneurs.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: Heart,       label: "Empowerment", sub: "We lift people up" },
              { icon: Zap,         label: "Practical",   sub: "Hands-on always" },
              { icon: Users,       label: "Community",   sub: "We grow together" },
              { icon: CheckCircle, label: "Excellence",  sub: "Quality in all we do" },
            ].map((v, i) => (
              <motion.div key={v.label} variants={fadeUp} custom={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(234,179,8,0.08)", border: `1px solid rgba(234,179,8,0.18)` }}>
                  <v.icon size={18} style={{ color: GOLD }} />
                </div>
                <p className="font-heading font-extrabold text-xs" style={{ color: NAVY }}>{v.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{v.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Graduates",         icon: Users },
            { value: "14+",  label: "Programs",          icon: BookOpen },
            { value: "4.8★", label: "Average Rating",    icon: Star },
            { value: "95%",  label: "Satisfaction Rate", icon: Trophy },
          ].map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} custom={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <s.icon size={16} className="text-white" />
              </div>
              <p className="font-heading font-extrabold text-4xl md:text-5xl mb-1 text-white">{s.value}</p>
              <p className="text-sm text-slate-400 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          CEO SPOTLIGHT — full-bleed editorial layout
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="container max-w-6xl mx-auto">

          {/* heading */}
          <div className="text-center mb-14">
            <SectionLabel>Leadership</SectionLabel>
            <h2 className="font-heading font-extrabold"
              style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", color: NAVY }}>
              Meet Our <span style={{ color: GOLD }}>Leaders</span>
            </h2>
          </div>

          {/* ── CEO feature ── */}
          <motion.div
            variants={fadeUp} custom={0}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-3xl overflow-hidden mb-10 relative"
            style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}
          >
            {/* dot pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "22px 22px" }} />

            <div className="flex flex-col lg:flex-row relative z-10">

              {/* image pair — stacks on mobile, side-by-side offset on desktop */}
              <div className="flex items-end justify-center gap-3 px-6 pt-10 pb-0 lg:pb-10 lg:w-2/5 shrink-0">
                {/* main photo */}
                <div className="relative z-10 shrink-0"
                  style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}>
                  <div className="rounded-2xl overflow-hidden border-2"
                    style={{
                      borderColor: "rgba(234,179,8,0.4)",
                      width: "clamp(120px,28vw,200px)",
                      height: "clamp(150px,35vw,256px)",
                    }}>
                    <img
                      src={about1}
                      alt="Daina Ehanah – Executive Director"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-lg"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }} />
                </div>

                
              </div>

              {/* text */}
              <div className="flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-8 lg:py-16">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4 self-start"
                  style={{ background: "rgba(234,179,8,0.15)", color: GOLD, border: "1px solid rgba(234,179,8,0.3)" }}>
                  Executive Director / Head of Centre
                </span>

                <h3 className="font-heading font-extrabold text-white mb-1"
                  style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)" }}>
                  Daina Ehanah
                </h3>
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-5">
                  CEO · HandyGidi Training Centre
                </p>

                <div className="relative pl-5 mb-5 border-l-2" style={{ borderColor: GOLD }}>
                  <Quote size={16} style={{ color: GOLD, opacity: 0.5 }} className="absolute -top-1 -left-2" />
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "Our goal is simple — give every Nigerian the tools to earn, grow, and lead in the digital age. No background is a barrier when you have the right skills."
                  </p>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed">
                  Under Daina's leadership, HandyGidi Training Centre has empowered over 500 graduates, built 14+ industry-relevant programs, and become a trusted hub for practical digital education in Abuja.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Board & team strip ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            {boardMembers.map((m, i) => (
              <motion.div key={m.name}
                variants={fadeUp} custom={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="rounded-2xl p-6 flex items-center gap-4 group transition-all hover:shadow-lg"
                style={{ background: "#fff", border: "1px solid rgba(11,31,58,0.08)" }}>
                {/* initial avatar */}
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 font-heading font-extrabold text-base text-white"
                  style={{ background: `linear-gradient(135deg,${NAVY},${NAVY2})`, border: `2px solid rgba(234,179,8,0.3)` }}>
                  {m.initial}
                </div>
                <div>
                  <p className="font-heading font-extrabold text-sm leading-tight mb-0.5" style={{ color: NAVY }}>
                    {m.name}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: GOLD2 }}>
                    {m.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="container">
          <div className="rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12"
            style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "22px 22px" }} />
            <div className="relative text-center md:text-left">
              <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
                🎓 Join the HandyGidi Family
              </p>
              <h3 className="font-heading font-extrabold text-white text-2xl md:text-3xl leading-tight mb-2">
                Ready to build skills that<br className="hidden md:block" />
                <span style={{ color: GOLD }}> earn you real income?</span>
              </h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Enroll today and join 500+ graduates who transformed their lives with HandyGidi.
              </p>
            </div>
            <div className="relative flex flex-wrap gap-3 justify-center shrink-0">
              <Link to="/register"
                className="inline-flex items-center gap-2 font-extrabold px-8 py-4 rounded-full transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c", boxShadow: `0 8px 32px rgba(234,179,8,0.38)` }}>
                Enroll Now
              </Link>
              <Link to="/courses"
                className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full border text-white hover:bg-white/10 transition-all"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

    </MainLayout>
  );
}
