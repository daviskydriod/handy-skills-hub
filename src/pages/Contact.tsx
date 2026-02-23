import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, MessageCircle, Instagram,
  Send, Sparkles, ArrowRight, CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { BUSINESS_INFO } from "@/data/mockData";

const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const whatsappMsg = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(
  "Hello HandyGidi! I have a question."
)}`;

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-colors";
const inputFocus = (e) => (e.currentTarget.style.borderColor = GOLD);
const inputBlur  = (e) => (e.currentTarget.style.borderColor = "#e2e8f0");

const SectionLabel = ({ children }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
    style={{ background: "rgba(234,179,8,0.10)", color: GOLD2, border: "1px solid rgba(234,179,8,0.22)" }}
  >
    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: GOLD }} />
    {children}
  </span>
);

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MainLayout>
      {/* HERO */}
      <section
        className="relative overflow-hidden py-14 md:py-20"
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
          <div className="absolute top-0 right-0 w-80 h-80 opacity-15 rounded-full -translate-y-1/3 translate-x-1/3"
            style={{ background: `radial-gradient(circle,${GOLD},transparent 70%)` }} />
        </div>
        <div className="container relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial="hidden" animate="visible">
            <motion.span variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.28)", color: GOLD }}>
              <Sparkles size={11} /> We'd Love to Hear From You
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1}
              className="font-heading font-extrabold text-white mb-4"
              style={{ fontSize: "clamp(1.9rem,4.5vw,3rem)" }}>
              Get in <span style={{ color: GOLD }}>Touch</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-slate-300 text-base leading-relaxed">
              Have questions about our courses? Ready to enroll? Visit us in Lugbe, Abuja — or reach out any way you prefer.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* QUICK CONTACT CHIPS */}
      <div className="bg-white border-b border-slate-100">
        <div className="container py-5">
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${BUSINESS_INFO.phone}`}
              className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all hover:scale-105"
              style={{ borderColor: "rgba(234,179,8,0.3)", color: GOLD2, background: "rgba(234,179,8,0.05)" }}>
              <Phone size={12} /> {BUSINESS_INFO.phone}
            </a>
            <a href={`mailto:${BUSINESS_INFO.email}`}
              className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all hover:scale-105"
              style={{ borderColor: "rgba(234,179,8,0.3)", color: GOLD2, background: "rgba(234,179,8,0.05)" }}>
              <Mail size={12} /> {BUSINESS_INFO.email}
            </a>
            <a href={BUSINESS_INFO.instagram} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all hover:scale-105"
              style={{ borderColor: "rgba(234,179,8,0.3)", color: GOLD2, background: "rgba(234,179,8,0.05)" }}>
              <Instagram size={12} /> @Handygiditrainingcentre
            </a>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">

            {/* LEFT: form */}
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3"
                style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                  <Send size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="font-heading font-extrabold text-white text-base leading-tight">Send us a Message</h2>
                  <p className="text-[11px] text-slate-400">We typically reply within 24 hours</p>
                </div>
              </div>

              <div className="p-7">
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                      <CheckCircle size={28} className="text-white" />
                    </div>
                    <h3 className="font-heading font-extrabold text-xl mb-2" style={{ color: NAVY }}>Message Sent!</h3>
                    <p className="text-slate-400 text-sm mb-6">Thanks for reaching out. We'll get back to you shortly.</p>
                    <button onClick={() => { setSubmitted(false); setForm({ name:"", email:"", subject:"", message:"" }); }}
                      className="text-xs font-bold px-5 py-2 rounded-full transition-all hover:scale-105"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c" }}>
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                        <input required placeholder="e.g. Amina Bakare" value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className={inputCls} onFocus={inputFocus} onBlur={inputBlur} />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Email *</label>
                        <input required type="email" placeholder="your@email.com" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className={inputCls} onFocus={inputFocus} onBlur={inputBlur} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Subject</label>
                      <input placeholder="e.g. Course enquiry, Enrollment, General question" value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className={inputCls} onFocus={inputFocus} onBlur={inputBlur} />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Message *</label>
                      <textarea required rows={5} placeholder="Tell us how we can help you…" value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className={inputCls + " resize-none"} onFocus={inputFocus} onBlur={inputBlur} />
                    </div>
                    <button type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-xl text-sm transition-all hover:scale-[1.02]"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c", boxShadow: "0 6px 24px rgba(234,179,8,0.3)" }}>
                      <Send size={14} /> Send Message
                    </button>
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-[11px] text-slate-400 font-medium">or</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <a href={whatsappMsg} target="_blank" rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm border-2 transition-all hover:scale-[1.02] hover:bg-green-50"
                      style={{ borderColor: "#22c55e", color: "#16a34a" }}>
                      <MessageCircle size={15} /> Chat on WhatsApp Instead
                    </a>
                  </form>
                )}
              </div>
            </motion.div>

            {/* RIGHT: info + map + hours */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex flex-col gap-5">

              {/* contact info */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100"
                  style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
                  <h2 className="font-heading font-extrabold text-white text-base">Contact Information</h2>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {[
                    { icon: MapPin,    label: "Address",           value: BUSINESS_INFO.address, href: `https://maps.google.com/?q=${BUSINESS_INFO.mapQuery}` },
                    { icon: Phone,     label: "Phone / WhatsApp",  value: BUSINESS_INFO.phone,   href: `tel:${BUSINESS_INFO.phone}` },
                    { icon: Mail,      label: "Email",             value: BUSINESS_INFO.email,   href: `mailto:${BUSINESS_INFO.email}` },
                    { icon: Instagram, label: "Instagram",         value: "@Handygiditrainingcentre", href: BUSINESS_INFO.instagram },
                  ].map((item) => (
                    <a key={item.label} href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                        style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                        <item.icon size={16} style={{ color: GOLD }} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-slate-700 leading-snug group-hover:underline"
                          style={{ textDecorationColor: GOLD }}>
                          {item.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* map */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
                  <h2 className="font-heading font-extrabold text-white text-base">Find Us</h2>
                  <a href={`https://maps.google.com/?q=${BUSINESS_INFO.mapQuery}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
                    style={{ color: GOLD }}>
                    Open in Maps <ArrowRight size={10} />
                  </a>
                </div>
                <div className="h-52 overflow-hidden">
                  <iframe title="HandyGidi Location"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${BUSINESS_INFO.mapQuery}`}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                </div>
              </div>

              {/* hours */}
              <div className="rounded-2xl p-5 border"
                style={{ background: "rgba(234,179,8,0.05)", borderColor: "rgba(234,179,8,0.2)" }}>
                <p className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: GOLD2 }}>
                  🕐 Training Hours
                </p>
                <div className="flex flex-col gap-2 text-xs text-slate-600">
                  {[
                    { day: "Monday – Friday", time: "8:00 AM – 6:00 PM", open: true },
                    { day: "Saturday",        time: "9:00 AM – 3:00 PM", open: true },
                    { day: "Sunday",          time: "Closed",            open: false },
                  ].map(h => (
                    <div key={h.day} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="font-semibold text-slate-700">{h.day}</span>
                      <span className="font-bold" style={{ color: h.open ? GOLD2 : "#f87171" }}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-14" style={{ background: `linear-gradient(135deg,#060d1c,${NAVY2})` }}>
        <div className="container text-center max-w-xl mx-auto">
          <SectionLabel>Ready to Start?</SectionLabel>
          <h2 className="font-heading font-extrabold text-white text-2xl md:text-3xl mb-3">
            Skip the form — enroll directly
          </h2>
          <p className="text-slate-400 text-sm mb-7 leading-relaxed">
            Ready to start learning? Register now or reach out on WhatsApp and we'll guide you through enrollment.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register"
              className="inline-flex items-center gap-2 font-extrabold px-8 py-3.5 rounded-full text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c", boxShadow: "0 8px 32px rgba(234,179,8,0.35)" }}>
              Register Now
            </Link>
            <a href={whatsappMsg} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-full text-sm border-2 transition-all hover:bg-green-950/20"
              style={{ borderColor: "#22c55e", color: "#4ade80" }}>
              <MessageCircle size={15} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
