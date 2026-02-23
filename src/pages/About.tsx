import { motion } from "framer-motion";
import { Target, Eye, CheckCircle, MapPin, Users, BookOpen, Trophy, Star, Sparkles, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { teamMembers, BUSINESS_INFO } from "@/data/mockData";

/* ─── tokens ─────────────────────────────────────────────── */
const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

/* ─── animation ─────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
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

export default function About() {
  return (
    <MainLayout>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 55%,${NAVY2} 100%)` }}
      >
        <div className="pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAB308" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute top-0 right-0 w-96 h-96 opacity-15 rounded-full -translate-y-1/3 translate-x-1/3"
            style={{ background: `radial-gradient(circle,${GOLD},transparent 70%)` }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"
            style={{ background: `radial-gradient(circle,#3b82f6,transparent 70%)` }} />
        </div>

        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible">
            <motion.span variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.28)", color: GOLD }}>
              <Sparkles size={11} /> Est. 5+ Years · Lugbe, Abuja
            </motion.span>

            <motion.h1 variants={fadeUp} custom={1}
              className="font-heading font-extrabold text-white mb-4"
              style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}>
              About <span style={{ color: GOLD }}>HandyGidi</span><br />Training Centre
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
              <em style={{ color: GOLD, fontStyle: "normal", fontWeight: 700 }}>"{BUSINESS_INFO.tagline}"</em>
              {" "}— equipping individuals with practical digital, business, and leadership skills
              that lead to real income and career opportunities.
            </motion.p>

            <motion.div variants={fadeUp} custom={3}
              className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Users,   v: "500+", l: "Graduates" },
                { icon: BookOpen,v: "14+",  l: "Programs" },
                { icon: Star,    v: "4.8★", l: "Rating" },
                { icon: Trophy,  v: "95%",  l: "Satisfaction" },
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          OUR STORY
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* left — decorative block */}
            <motion.div
              variants={fadeUp} custom={0}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden relative"
                style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})`, padding: "2.5rem" }}>
                {/* dot pattern */}
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "20px 20px" }} />

                <div className="relative z-10">
                  <span className="text-5xl mb-4 block">🏫</span>
                  <h3 className="font-heading font-extrabold text-white text-2xl mb-3">
                    A Training Centre<br />
                    <span style={{ color: GOLD }}>Built for Real Results</span>
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Founded in Lugbe, Abuja with one goal — turn everyday people into skilled, income-earning professionals.
                  </p>

                  {/* location chip */}
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <MapPin size={13} style={{ color: GOLD, marginTop: 2 }} className="shrink-0" />
                    <span>{BUSINESS_INFO.address}</span>
                  </div>
                </div>

                {/* floating stat */}
                <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
                  style={{ border: `2px solid rgba(234,179,8,0.2)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <Trophy size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm leading-tight" style={{ color: NAVY }}>5+ Years</p>
                    <p className="text-[10px] text-slate-400">of Excellence</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* right — story text */}
            <motion.div
              variants={fadeUp} custom={1}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <SectionLabel>Our Story</SectionLabel>
              <h2 className="font-heading font-extrabold mb-5"
                style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", color: NAVY }}>
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

              {/* checklist */}
              <div className="mt-6 flex flex-col gap-2.5">
                {[
                  "Certified & experienced instructors",
                  "Small class sizes for personal attention",
                  "Real-world projects in every course",
                  "Flexible payment plans available",
                  "Job-ready & business-ready graduates",
                ].map((item) => (
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
            {/* mission */}
            <motion.div
              variants={fadeUp} custom={0}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}
            >
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

            {/* vision */}
            <motion.div
              variants={fadeUp} custom={1}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-3xl p-8 relative overflow-hidden border"
              style={{ background: "#fff", borderColor: "rgba(234,179,8,0.2)" }}
            >
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

          {/* values row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: Heart,       label: "Empowerment",  sub: "We lift people up" },
              { icon: Zap,         label: "Practical",    sub: "Hands-on always" },
              { icon: Users,       label: "Community",    sub: "We grow together" },
              { icon: CheckCircle, label: "Excellence",   sub: "Quality in all we do" },
            ].map((v, i) => (
              <motion.div key={v.label}
                variants={fadeUp} custom={i}
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
      <section className="py-14"
        style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "5+",  label: "Years Running",    icon: Trophy },
            { value: "500+",label: "Graduates",        icon: Users },
            { value: "14+", label: "Programs",         icon: BookOpen },
            { value: "95%", label: "Satisfaction Rate",icon: Star },
          ].map((s, i) => (
            <motion.div key={s.label}
              variants={fadeUp} custom={i}
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
          TEAM
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <SectionLabel>The People Behind It</SectionLabel>
            <h2 className="font-heading font-extrabold"
              style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", color: NAVY }}>
              Meet Our <span style={{ color: GOLD }}>Team</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((m, i) => (
              <motion.div key={m.name}
                variants={fadeUp} custom={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
              >
                {/* image strip */}
                <div className="relative h-32 overflow-hidden"
                  style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
                  <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "16px 16px" }} />
                  <img src={m.avatar} alt={m.name}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-20 h-20 rounded-full object-cover border-4 shadow-lg group-hover:scale-105 transition-transform duration-300"
                    style={{ borderColor: GOLD + "55" }} />
                </div>

                {/* content */}
                <div className="pt-12 pb-6 px-4">
                  <h3 className="font-heading font-extrabold text-sm mb-0.5" style={{ color: NAVY }}>
                    {m.name}
                  </h3>
                  <p className="text-[11px] font-bold mb-2" style={{ color: GOLD2 }}>{m.role}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.bio}</p>
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
