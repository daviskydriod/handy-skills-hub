import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Star, Users, BookOpen, Award, CheckCircle, Monitor, Brain,
  Share2, Palette, Globe, Home, TrendingUp, Code, FileText,
  Briefcase, Heart, ArrowRight, Mail, MessageCircle, Search,
  ChevronRight, Play
} from "lucide-react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import CourseCard from "@/components/CourseCard";
import TestimonialCard from "@/components/TestimonialCard";
import { courses, testimonials, categories, partnerLogos, BUSINESS_INFO } from "@/data/mockData";
import heroImage from "@/assets/hero-image.jpg";

const iconMap: Record<string, any> = {
  Monitor, Brain, Share2, Palette, Globe, Home, Users,
  TrendingUp, Code, FileText, Briefcase, Heart
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }),
};

const whatsappEnroll = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent("Hello HandyGidi Training Centre! I'm interested in enrolling for a course. Please send me more details.")}`;

const Index = () => {
  return (
    <MainLayout>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f0faf4]">
        {/* subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, #22c55e33 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container relative py-16 md:py-24 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left copy */}
          <motion.div
            className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-4"
            >
              <span className="w-6 h-px bg-emerald-500 inline-block" />
              Start your favourite course
            </motion.p>

            <motion.h1
              variants={fadeUp} custom={1}
              className="font-heading font-extrabold text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.1] text-gray-900 dark:text-white mb-5"
            >
              Unlock Your Future<br />
              <span className="text-emerald-500">With Your Hands.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2}
              className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-md mx-auto lg:mx-0 mb-8"
            >
              {BUSINESS_INFO.tagline}. Join hundreds of students gaining real-world digital, business, and leadership skills through hands-on training in Lugbe, Abuja.
            </motion.p>

            <motion.div
              variants={fadeUp} custom={3}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
            >
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-semibold px-8 rounded-full shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                asChild
              >
                <Link to="/register">Start Learning Today</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-gray-300 dark:border-gray-600 px-8"
                asChild
              >
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </motion.div>

            {/* Social proof pills */}
            <motion.div
              variants={fadeUp} custom={4}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: Users, label: "500+ Students" },
                { icon: Star, label: "4.8 / 5 Rating" },
                { icon: BookOpen, label: "14+ Courses" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <s.icon size={13} className="text-emerald-500" />
                  {s.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right image */}
          <motion.div
            className="flex-1 max-w-sm lg:max-w-md relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* floating badge */}
            <div className="absolute -top-4 -left-4 bg-emerald-500 text-white rounded-2xl px-4 py-3 text-center shadow-xl z-10">
              <p className="font-extrabold text-2xl leading-none">14+</p>
              <p className="text-[10px] font-medium opacity-90">Courses</p>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-xl z-10">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-sm text-gray-800 dark:text-white">4.8</span>
              <span className="text-xs text-gray-400">(86 reviews)</span>
            </div>
            <img
              src={heroImage}
              alt="Students training at HandyGidi Training Centre Abuja"
              className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/5]"
            />
          </motion.div>
        </div>
      </section>

      {/* ── PARTNERS STRIP ────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-gray-800 py-6 bg-white dark:bg-gray-900">
        <div className="container">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-5 font-medium">
            Tools &amp; Platforms We Train With
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
            {partnerLogos.map((p) => (
              <span
                key={p}
                className="font-heading font-bold text-lg md:text-xl text-gray-300 dark:text-gray-600 select-none"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-emerald-500 font-semibold text-xs uppercase tracking-widest mb-2">Our Programs</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white">
              Explore by <span className="text-emerald-500 underline decoration-wavy decoration-emerald-300">Category</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const Icon = iconMap[cat.icon] || Palette;
              return (
                <motion.div
                  key={cat.name}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="group cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 rounded-2xl p-5 md:p-6 text-center transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                    <Icon size={20} className="text-gray-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{cat.count} Courses</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── POPULAR COURSES ───────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-emerald-500 font-semibold text-xs uppercase tracking-widest mb-1">Popular Now</p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white">
                All <span className="text-emerald-500 underline decoration-wavy decoration-emerald-300">Courses</span>
              </h2>
            </div>
            <Link
              to="/courses"
              className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {/* category filter tabs (decorative) */}
          <div className="flex gap-2 flex-wrap mb-8">
            {["All", "Design", "Tech", "Business", "Marketing"].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  i === 0
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((c) => (
              <CourseCard key={c.id} {...c} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              variant="outline"
              className="rounded-full px-8 border-gray-300 dark:border-gray-600 hover:border-emerald-400"
              asChild
            >
              <Link to="/courses">Other Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── BECOME AN INSTRUCTOR CTA ──────────────────────────── */}
      <section className="py-12 bg-emerald-50 dark:bg-emerald-950/20 border-y border-emerald-100 dark:border-emerald-900/30">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">We Are Hiring Interns!</p>
            <h3 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
              You can join HandyGidi<br className="hidden md:block" />
              as <span className="text-emerald-500 underline decoration-wavy decoration-emerald-300">an intern?</span>
            </h3>
          </div>
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-full px-8 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 shrink-0"
            asChild
          >
            <Link to="/contact">Apply Now</Link>
          </Button>
        </div>
      </section>

      {/* ── WHY TRUST US ──────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-emerald-500 font-semibold text-xs uppercase tracking-widest mb-2">Why Choose Us</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white">
              Why Trust <span className="text-emerald-500">HandyGidi?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: "Hands-On Training", desc: "Learn by doing — every class includes real-world projects and practical exercises." },
              { icon: Award, title: "Expert Instructors", desc: "Learn from certified professionals with real industry experience." },
              { icon: Users, title: "Small Class Sizes", desc: "Personalized attention and mentorship to help you succeed." },
              { icon: BookOpen, title: "Flexible Payment", desc: "Affordable fees with flexible payment plans to suit your budget." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                  <item.icon size={20} className="text-emerald-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-heading font-semibold mb-2 text-gray-800 dark:text-gray-200">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────── */}
      <section className="bg-emerald-500 py-12 md:py-16">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: "5+", label: "Years of Experience" },
            { value: "500+", label: "Students Trained" },
            { value: "14+", label: "Courses Available" },
            { value: "1", label: "Location (Lugbe, Abuja)" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading font-extrabold text-4xl md:text-5xl mb-1">{s.value}</p>
              <p className="text-sm opacity-80 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-emerald-500 font-semibold text-xs uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white">
              What Our <span className="text-emerald-500 underline decoration-wavy decoration-emerald-300">Learners</span> Say
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ENROLL CTA ────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base mb-8">
            Don't wait for tomorrow. Enroll now and take the first step toward building valuable skills that lead to real income. Flexible payment plans available!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-full px-8 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 font-semibold"
              asChild
            >
              <Link to="/register">Register Now – It's Easy</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-green-400 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 px-8"
              asChild
            >
              <a href={whatsappEnroll} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} className="mr-2" /> Enroll via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── SUBSCRIBE ─────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container text-center max-w-lg mx-auto">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-3">
            Subscribe for Updates &amp; Discounts
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Get early access to new courses and exclusive student discounts.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-9 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
              />
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-full px-6">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

    </MainLayout>
  );
};

export default Index;
