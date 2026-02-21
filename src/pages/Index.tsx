import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Users, BookOpen, Award, CheckCircle, Palette, Globe, Plane, Scissors, PaintBucket, PartyPopper, UtensilsCrossed, Lightbulb, ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import CourseCard from "@/components/CourseCard";
import TestimonialCard from "@/components/TestimonialCard";
import { courses, testimonials, categories, partnerLogos } from "@/data/mockData";
import heroImage from "@/assets/hero-image.jpg";

const iconMap: Record<string, any> = { Palette, Globe, Plane, Scissors, PaintBucket, PartyPopper, UtensilsCrossed, Lightbulb };

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="gradient-hero overflow-hidden">
        <div className="container py-12 md:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <motion.div className="flex-1 text-center lg:text-left" initial="hidden" animate="visible">
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-tight text-foreground mb-4"
            >
              Unlock Your Future<br />
              <span className="text-gradient">With Your Hands.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto lg:mx-0 mb-6">
              Learn It. Master It. Earn From It. Join thousands of students gaining real-world skills through our hands-on training programs.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              <Button size="lg" className="gradient-accent text-accent-foreground border-0 font-semibold" asChild>
                <Link to="/register">Start Learning – FREE</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/courses">Browse All Courses</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center lg:justify-start gap-4">
              {[
                { icon: Users, label: "500+ Students", color: "text-accent" },
                { icon: Star, label: "4.8/5 Rating", color: "text-accent" },
                { icon: BookOpen, label: "30+ Courses", color: "text-accent" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-xs font-medium shadow-sm">
                  <s.icon size={14} className={s.color} />
                  <span className="text-card-foreground">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            className="flex-1 max-w-md lg:max-w-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src={heroImage} alt="Student training" className="rounded-2xl shadow-2xl w-full" />
          </motion.div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-b border-border py-8">
        <div className="container">
          <p className="text-center text-xs text-muted-foreground mb-4">Trusted by teams and learners</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 opacity-40">
            {partnerLogos.map((p) => (
              <span key={p} className="font-heading font-bold text-lg md:text-xl text-foreground">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-20">
        <div className="container">
          <p className="text-accent font-semibold text-xs uppercase tracking-wider mb-2 text-center">Our Programs</p>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-10 text-foreground">Explore by Category</h2>
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
                  className="bg-card border border-border rounded-lg p-4 md:p-6 text-center hover:border-accent hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Icon size={22} className="text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-card-foreground mb-1">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.count} Courses</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Courses */}
      <section className="py-12 md:py-20 bg-secondary/50">
        <div className="container">
          <p className="text-accent font-semibold text-xs uppercase tracking-wider mb-2">Popular Now</p>
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Upcoming Courses</h2>
            <Link to="/courses" className="text-accent text-sm font-medium hidden sm:flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((c) => (
              <CourseCard key={c.id} {...c} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild><Link to="/courses">View All Courses</Link></Button>
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-12 md:py-20">
        <div className="container">
          <p className="text-accent font-semibold text-xs uppercase tracking-wider mb-2 text-center">Why Choose Us</p>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-10 text-foreground">Why Trust HandyGidi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: "Tailored Learning", desc: "Personalized paths based on your goals and pace." },
              { icon: Award, title: "Expert Instructors", desc: "Learn from certified professionals with real experience." },
              { icon: Users, title: "Support for Success", desc: "Mentorship and community to help you thrive." },
              { icon: BookOpen, title: "Flexible Learning", desc: "Study at your own pace, online or in-person." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon size={22} className="text-accent" />
                </div>
                <h3 className="font-heading font-semibold mb-2 text-card-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="gradient-primary py-10 md:py-14">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-primary-foreground">
          {[
            { value: "8+", label: "Years of Experience" },
            { value: "500+", label: "Students Trained" },
            { value: "30+", label: "Courses Available" },
            { value: "3", label: "Locations" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading font-extrabold text-3xl md:text-4xl mb-1">{s.value}</p>
              <p className="text-sm opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20">
        <div className="container">
          <p className="text-accent font-semibold text-xs uppercase tracking-wider mb-2 text-center">Testimonials</p>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-10 text-foreground">What Our Learners Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Banner */}
      <section className="bg-accent/10 py-12 md:py-16">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl mb-3 text-foreground">We Are Hiring Interns!</h2>
          <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md mx-auto">
            Gain real-world experience and kickstart your career with HandyGidi Training Centre.
          </p>
          <Button size="lg" className="gradient-accent text-accent-foreground border-0" asChild>
            <Link to="/contact">Apply Now</Link>
          </Button>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12 md:py-16 bg-secondary/50">
        <div className="container text-center max-w-lg mx-auto">
          <h2 className="font-heading font-bold text-xl md:text-2xl mb-3 text-foreground">Subscribe for Updates & Discounts</h2>
          <p className="text-sm text-muted-foreground mb-6">Get early access to new courses and exclusive student discounts.</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <Button className="gradient-accent text-accent-foreground border-0">Subscribe</Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
