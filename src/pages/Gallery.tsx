import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import gallery1 from "@/assets/gallery1.mp4";
import gallery2 from "@/assets/gallery2.mp4";
import gallery3 from "@/assets/gallery3.mp4";
import gallery4 from "@/assets/gallery4.mp4";
import gallery5 from "@/assets/gallery5.mp4";
import gallery6 from "@/assets/gallery6.mp4";
import gallery7 from "@/assets/gallery7.mp4";
import image1 from "@/assets/image1.jpg";
import image2 from "@/assets/image2.jpg";
import image3 from "@/assets/image3.jpg";
import image4 from "@/assets/image4.jpg";
import image5 from "@/assets/image5.jpg";

/* ─── tokens ─────────────────────────────────────────────── */
const NAVY  = "#0b1f3a";
const NAVY2 = "#0f2d56";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

/* ─── media list ─────────────────────────────────────────── */
type MediaItem = { id: number; type: "video" | "image"; src: string };

const allMedia: MediaItem[] = [
  { id: 1,  type: "video", src: gallery1 },
  { id: 2,  type: "video", src: gallery2 },
  { id: 3,  type: "video", src: gallery3 },
  { id: 4,  type: "video", src: gallery4 },
  { id: 5,  type: "image", src: image1   },
  { id: 6,  type: "image", src: image2   },
  { id: 7,  type: "video", src: gallery5 },
  { id: 8,  type: "video", src: gallery6 },
  { id: 9,  type: "image", src: image3   },
  { id: 10, type: "video", src: gallery7 },
  { id: 11, type: "image", src: image4   },
  { id: 12, type: "image", src: image5   },
];

const videos = allMedia.filter(m => m.type === "video");
const images = allMedia.filter(m => m.type === "image");

/* ─── animation ─────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ════════════════════════════════════════════════════════════
   GALLERY PAGE
════════════════════════════════════════════════════════════ */
export default function Gallery() {
  const [activeId, setActiveId]   = useState<number | null>(null);
  const [tab, setTab]             = useState<"all" | "videos" | "photos">("all");

  const filtered = tab === "all" ? allMedia : tab === "videos" ? videos : images;
  const activeItem = allMedia.find(m => m.id === activeId) ?? null;

  const close = () => setActiveId(null);
  const prev  = () => {
    if (activeId === null) return;
    const idx = filtered.findIndex(m => m.id === activeId);
    setActiveId(filtered[(idx - 1 + filtered.length) % filtered.length].id);
  };
  const next  = () => {
    if (activeId === null) return;
    const idx = filtered.findIndex(m => m.id === activeId);
    setActiveId(filtered[(idx + 1) % filtered.length].id);
  };

  return (
    <MainLayout>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 55%,${NAVY2} 100%)` }}
      >
        {/* grid bg */}
        <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <pattern id="ggrid" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAB308" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ggrid)" />
        </svg>
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"
          style={{ background: `radial-gradient(circle,${GOLD},transparent 70%)` }} />

        <div className="container relative z-10 text-center max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.28)", color: GOLD }}>
            <Sparkles size={11} /> Our Gallery
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="font-heading font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}>
            Life at <span style={{ color: GOLD }}>HandyGidi</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="text-slate-300 text-base leading-relaxed">
            Moments from our training sessions, graduations, workshops and community activities.
          </motion.p>
        </div>

        {/* angled bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white"
          style={{ clipPath: "polygon(0 100%,100% 100%,100% 0)" }} />
      </section>


      {/* ── Filter tabs ── */}
      <section className="bg-white pt-12 pb-6">
        <div className="container flex justify-center">
          <div className="inline-flex rounded-2xl p-1 gap-1"
            style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
            {(["all", "videos", "photos"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-6 py-2 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-all duration-200"
                style={tab === t
                  ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#060d1c", boxShadow: "0 4px 16px rgba(234,179,8,0.3)" }
                  : { color: "#64748b" }
                }
              >
                {t === "all" ? `All (${allMedia.length})` : t === "videos" ? `Videos (${videos.length})` : `Photos (${images.length})`}
              </button>
            ))}
          </div>
        </div>
      </section>


      {/* ── Grid ── */}
      <section className="bg-white pb-24 pt-6">
        <div className="container max-w-6xl mx-auto">

          {/* Videos section */}
          {(tab === "all" || tab === "videos") && (
            <>
              {tab === "all" && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom,${GOLD},${GOLD2})` }} />
                  <p className="font-heading font-extrabold text-sm uppercase tracking-widest" style={{ color: NAVY }}>Videos</p>
                </div>
              )}

              {/* Responsive masonry-style video grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
                {(tab === "all" ? videos : filtered.filter(m => m.type === "video")).map((item, i) => (
                  <motion.div
                    key={item.id}
                    variants={fadeUp} custom={i}
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer"
                    style={{
                      aspectRatio: i % 5 === 0 ? "1/1" : "9/12",
                      background: NAVY,
                      gridRow: i % 7 === 0 ? "span 2" : "span 1",
                    }}
                    onClick={() => setActiveId(item.id)}
                  >
                    <video
                      src={item.src}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      muted preload="metadata"
                    />
                    <div className="absolute inset-0 transition-opacity duration-300"
                      style={{ background: "rgba(6,13,28,0.25)" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-125"
                        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 6px 20px rgba(234,179,8,0.5)` }}
                      >
                        <Play size={16} className="text-white" style={{ marginLeft: 2 }} />
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-300 pointer-events-none" />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Photos section */}
          {(tab === "all" || tab === "photos") && (
            <>
              {tab === "all" && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom,${GOLD},${GOLD2})` }} />
                  <p className="font-heading font-extrabold text-sm uppercase tracking-widest" style={{ color: NAVY }}>Photos</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(tab === "all" ? images : filtered.filter(m => m.type === "image")).map((item, i) => (
                  <motion.div
                    key={item.id}
                    variants={fadeUp} custom={i}
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer"
                    style={{
                      aspectRatio: i === 0 || i === 3 ? "4/5" : "1/1",
                      gridColumn: i === 0 ? "span 2" : "span 1",
                    }}
                    onClick={() => setActiveId(item.id)}
                  >
                    <img
                      src={item.src}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "rgba(234,179,8,0.12)" }} />
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-300 pointer-events-none" />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>


      {/* ── Lightbox ── */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(6,13,28,0.97)", backdropFilter: "blur(18px)" }}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(234,179,8,0.18)" }}
              onClick={e => e.stopPropagation()}
            >
              {activeItem.type === "video" ? (
                <video
                  key={activeItem.src}
                  src={activeItem.src}
                  className="w-full block"
                  style={{ aspectRatio: "16/9" }}
                  controls autoPlay
                />
              ) : (
                <img
                  src={activeItem.src}
                  alt=""
                  className="w-full block"
                  style={{ maxHeight: "85vh", objectFit: "contain", background: "#060d1c" }}
                />
              )}

              {/* close */}
              <button onClick={close}
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(6,13,28,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <X size={16} className="text-white" />
              </button>

              {/* prev */}
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(6,13,28,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <ChevronLeft size={20} className="text-white" />
              </button>

              {/* next */}
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(6,13,28,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <ChevronRight size={20} className="text-white" />
              </button>

              {/* dot indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {filtered.map(m => (
                  <button key={m.id} onClick={() => setActiveId(m.id)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:  m.id === activeId ? 20 : 6,
                      height: 6,
                      background: m.id === activeId ? GOLD : "rgba(255,255,255,0.3)",
                    }} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </MainLayout>
  );
}
