// ── Review Modal ──────────────────────────────────────────────────────
// Replace your existing ReviewModal component with this version.
// Fix: added null/undefined guards on reviews, stats, distribution
// so the component never crashes on undefined.length
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Star, MessageSquare, AlertCircle, Edit3, Trash2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCourseReviews, getMyReview, submitReview, deleteReview } from "@/api/reviews";
import type { Review, ReviewStats } from "@/api/reviews";
import type { EnrolledCourse } from "@/api/enrollments";

const TEAL  = "#0d9488";
const TEAL2 = "#0f766e";
const NAVY  = "#0b1f3a";

// ── Helpers ──────────────────────────────────────────────────────────
const CourseThumb = ({ image, title, size = 44 }: { image?: string | null; title?: string; size?: number }) => {
  const cols = [TEAL, "#0891b2", "#7c3aed", "#db2777", "#d97706", "#16a34a"];
  const col  = cols[(title?.charCodeAt(0) ?? 0) % cols.length];
  return image ? (
    <img src={image} alt={title} style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 10, background: col + "18", border: `1px solid ${col}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <MessageSquare size={Math.round(size * 0.38)} style={{ color: col }} />
    </div>
  );
};

const Stars = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} style={{ fill: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0", color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0" }} />
    ))}
  </span>
);

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1 }}
        >
          <Star size={28} style={{ fill: n <= (hovered || value) ? "#f59e0b" : "#e2e8f0", color: n <= (hovered || value) ? "#f59e0b" : "#e2e8f0", transition: "all .15s" }} />
        </button>
      ))}
    </div>
  );
};

// ── Safe defaults ─────────────────────────────────────────────────────
const EMPTY_STATS: ReviewStats = { total: 0, avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

// ── Component ─────────────────────────────────────────────────────────
interface ReviewModalProps {
  course: EnrolledCourse;
  onClose: () => void;
}

export default function ReviewModal({ course, onClose }: ReviewModalProps) {
  const [reviews,    setReviews]    = useState<Review[]>([]);
  const [stats,      setStats]      = useState<ReviewStats>(EMPTY_STATS);
  const [myReview,   setMyReview]   = useState<Review | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [rating,     setRating]     = useState(0);
  const [comment,    setComment]    = useState("");

  // Load everything
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [reviewsResult, mine] = await Promise.all([
          getCourseReviews(course.id),
          getMyReview(course.id),
        ]);

        if (cancelled) return;

        // ── Safe extraction with fallbacks ──
        const safeReviews: Review[] = Array.isArray(reviewsResult?.reviews)
          ? reviewsResult.reviews
          : [];

        const rawStats = reviewsResult?.stats;
        const safeStats: ReviewStats = {
          total:        rawStats?.total        ?? safeReviews.length,
          avg:          rawStats?.avg          ?? 0,
          distribution: rawStats?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
        // Ensure all 5 keys exist in distribution
        [1, 2, 3, 4, 5].forEach(n => {
          if (safeStats.distribution[n] == null) safeStats.distribution[n] = 0;
        });

        setReviews(safeReviews);
        setStats(safeStats);

        const safeMine = mine ?? null;
        setMyReview(safeMine);
        if (safeMine) {
          setRating(safeMine.rating ?? 0);
          setComment(safeMine.comment ?? "");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("ReviewModal load error:", err);
        toast({ title: "Failed to load reviews", variant: "destructive" });
        // Set safe empty state so UI doesn't crash
        setReviews([]);
        setStats(EMPTY_STATS);
        setMyReview(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [course.id]);

  const reload = async () => {
    try {
      const [reviewsResult, mine] = await Promise.all([
        getCourseReviews(course.id),
        getMyReview(course.id),
      ]);
      const safeReviews: Review[] = Array.isArray(reviewsResult?.reviews) ? reviewsResult.reviews : [];
      const rawStats = reviewsResult?.stats;
      const safeStats: ReviewStats = {
        total:        rawStats?.total        ?? safeReviews.length,
        avg:          rawStats?.avg          ?? 0,
        distribution: rawStats?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
      [1, 2, 3, 4, 5].forEach(n => { if (safeStats.distribution[n] == null) safeStats.distribution[n] = 0; });
      setReviews(safeReviews);
      setStats(safeStats);
      const safeMine = mine ?? null;
      setMyReview(safeMine);
      if (safeMine) { setRating(safeMine.rating ?? 0); setComment(safeMine.comment ?? ""); }
    } catch (err) {
      console.error("ReviewModal reload error:", err);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast({ title: "Please select a star rating", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await submitReview(course.id, rating, comment);
      toast({ title: myReview ? "Review updated! ✨" : "Review submitted! 🎉" });
      await reload();
      setEditMode(false);
    } catch (err: any) {
      toast({ title: err?.response?.data?.error ?? "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your review?")) return;
    setDeleting(true);
    try {
      await deleteReview(course.id);
      toast({ title: "Review deleted" });
      setMyReview(null);
      setRating(0);
      setComment("");
      await reload();
    } catch {
      toast({ title: "Failed to delete review", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const showForm = !myReview || editMode;
  // Safe values
  const safeReviews   = reviews  ?? [];
  const safeStats     = stats    ?? EMPTY_STATS;
  const safeDist      = safeStats.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const safeTotal     = safeStats.total ?? 0;
  const safeAvg       = safeStats.avg   ?? 0;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 20, maxWidth: 520, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <CourseThumb title={course.title} image={course.image} size={44} />
            <div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, marginBottom: 2 }}>Course Reviews</h3>
              <p style={{ fontSize: 12, color: "#64748b", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 24, lineHeight: 1, flexShrink: 0, padding: "0 4px" }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* Stats bar */}
          {!loading && (
            <div style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 32, color: NAVY, lineHeight: 1 }}>
                  {safeTotal > 0 ? (safeAvg || 0).toFixed(1) : "—"}
                </p>
                <Stars rating={safeAvg} size={14} />
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{safeTotal} review{safeTotal !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                {[5, 4, 3, 2, 1].map(n => {
                  const count = safeDist[n] ?? 0;
                  const pct   = safeTotal > 0 ? Math.round((count / safeTotal) * 100) : 0;
                  return (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", width: 8, flexShrink: 0 }}>{n}</span>
                      <Star size={11} style={{ fill: "#f59e0b", color: "#f59e0b", flexShrink: 0 }} />
                      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 99, transition: "width .5s ease" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8", width: 20, textAlign: "right", flexShrink: 0 }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Write / edit section */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            {!course.completed ? (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <AlertCircle size={15} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "#92400e" }}>Complete this course to leave a review. You can still read others' reviews below.</p>
              </div>
            ) : myReview && !editMode ? (
              // Show existing review
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: 0.5 }}>Your Review</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#64748b", fontFamily: "inherit" }}>
                      <Edit3 size={11} /> Edit
                    </button>
                    <button onClick={handleDelete} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 4, background: "#fee2e2", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#ef4444", fontFamily: "inherit" }}>
                      <Trash2 size={11} /> {deleting ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <Stars rating={myReview.rating ?? 0} />
                  {myReview.comment && (
                    <p style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 1.6 }}>{myReview.comment}</p>
                  )}
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                    {myReview.created_at ? new Date(myReview.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
              </div>
            ) : (
              // Write / edit form
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
                  {myReview ? "Edit Your Review" : "Leave a Review"}
                </p>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Your Rating</p>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                    Comment <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
                  </p>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience with this course…"
                    rows={3}
                    style={{ width: "100%", borderRadius: 10, border: "1.5px solid #e2e8f0", padding: "10px 14px", fontSize: 13, fontFamily: "inherit", color: NAVY, resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {editMode && (
                    <button onClick={() => { setEditMode(false); setRating(myReview!.rating ?? 0); setComment(myReview!.comment ?? ""); }}
                      style={{ flex: 1, padding: "10px 0", border: "1px solid #e2e8f0", borderRadius: 10, background: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, color: "#64748b" }}>
                      Cancel
                    </button>
                  )}
                  <button onClick={handleSubmit} disabled={submitting || rating === 0}
                    style={{ flex: 2, padding: "10px 0", background: rating > 0 ? `linear-gradient(135deg,${TEAL},${TEAL2})` : "#e2e8f0", color: rating > 0 ? "#fff" : "#94a3b8", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: rating > 0 ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all .2s" }}>
                    {submitting ? "Saving…" : myReview ? "Update Review" : "Submit Review"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reviews list */}
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {loading ? (
              // Skeleton
              [1, 2, 3].map(i => (
                <div key={i} style={{ padding: 14, background: "#f8fafc", borderRadius: 12 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e8edf2", flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ height: 12, width: "40%", background: "#e8edf2", borderRadius: 6 }} />
                      <div style={{ height: 10, width: "25%", background: "#f1f5f9", borderRadius: 6 }} />
                    </div>
                  </div>
                  <div style={{ height: 10, width: "85%", background: "#f1f5f9", borderRadius: 6 }} />
                </div>
              ))
            ) : safeReviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <MessageSquare size={28} style={{ color: "#cbd5e1", margin: "0 auto 8px", display: "block" }} />
                <p style={{ color: "#94a3b8", fontSize: 13 }}>
                  {course.completed ? "No reviews yet. Be the first!" : "No reviews yet for this course."}
                </p>
              </div>
            ) : (
              safeReviews.map((r, idx) => (
                <div key={r?.id ?? idx} style={{ padding: 14, background: "#f8fafc", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${TEAL},${NAVY})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                        {(r?.student_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{r?.student_name ?? "Anonymous"}</p>
                        <Stars rating={r?.rating ?? 0} size={11} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
                      {r?.created_at ? new Date(r.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </span>
                  </div>
                  {r?.comment && (
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginTop: 6 }}>{r.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
