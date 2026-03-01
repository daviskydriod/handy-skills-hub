// ── PaymentModal ────────────────────────────────────────────────────────
// Reusable bank-transfer + receipt-upload flow.
// Used by StudentDashboard (and any future dashboard that needs enrollment payment).

import { useState, useRef } from "react";
import { X, Check, Copy, AlertCircle, Upload, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { submitPayment } from "@/api/payments";
import type { Course } from "@/api/courses";
import { NAVY, GOLD, GOLD2, BANK_DETAILS } from "../../theme";

interface PaymentModalProps {
  course: Course;
  onClose: () => void;
  onSubmitted: () => void;
}

export function PaymentModal({ course, onClose, onSubmitted }: PaymentModalProps) {
  const [step, setStep]       = useState<"bank" | "upload" | "done">("bank");
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSub]  = useState(false);
  const [copied, setCopied]   = useState(false);
  const fileRef               = useRef<HTMLInputElement>(null);

  const copyAcct = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!file) { toast({ title: "Please upload your payment receipt", variant: "destructive" }); return; }
    setSub(true);
    try {
      const fd = new FormData();
      fd.append("course_id",   String(course.id));
      fd.append("amount",      String(course.price));
      fd.append("proof_image", file);
      await submitPayment(fd);
      setStep("done");
      onSubmitted();
    } catch (err: any) {
      toast({ title: err.response?.data?.error ?? "Failed to submit. Please try again.", variant: "destructive" });
    } finally { setSub(false); }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        zIndex: 200, display: "flex", alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: "20px 20px 0 0",
          padding: "8px 0 0", maxWidth: 480, width: "100%",
          maxHeight: "92vh", overflowY: "auto", animation: "slideUp .25s ease",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 99, margin: "0 auto 20px" }} />
        <div style={{ padding: "0 24px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: NAVY, marginBottom: 3 }}>
                {step === "done" ? "Payment Submitted! 🎉" : "Enroll in Course"}
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
                {course.title}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: "#f1f5f9", border: "none", cursor: "pointer",
              color: "#64748b", width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={16} />
            </button>
          </div>

          {/* ── Step: Bank details ── */}
          {step === "bank" && (
            <div>
              <div style={{
                background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
                border: `1px solid ${GOLD}55`, borderRadius: 16, padding: 20, marginBottom: 18,
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Amount to Pay</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 32, color: NAVY, marginBottom: 16 }}>₦{course.price.toLocaleString()}</p>
                <div style={{ height: 1, background: `${GOLD}30`, marginBottom: 16 }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Bank Transfer Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[["Bank Name", BANK_DETAILS.bankName], ["Account Name", BANK_DETAILS.accountName]].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{val}</p>
                    </div>
                  ))}
                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Account Number</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: 3 }}>{BANK_DETAILS.accountNumber}</p>
                      <button
                        onClick={copyAcct}
                        style={{
                          background: copied ? "#d1fae5" : "#fff",
                          border: `1px solid ${copied ? "#a7f3d0" : "#e2e8f0"}`,
                          borderRadius: 10, padding: "6px 14px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          fontSize: 12, fontWeight: 700,
                          color: copied ? "#065f46" : "#64748b", transition: "all .2s",
                        }}
                      >
                        {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a",
                borderRadius: 12, padding: 14, display: "flex", gap: 10, marginBottom: 20,
              }}>
                <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>
                  Make the transfer, take a screenshot of your receipt, then tap Next.
                </p>
              </div>
              <button
                onClick={() => setStep("upload")}
                className="btn-gold"
                style={{ width: "100%", padding: 16, fontSize: 15, borderRadius: 14, justifyContent: "center" }}
              >
                I've Made the Transfer →
              </button>
            </div>
          )}

          {/* ── Step: Upload proof ── */}
          {step === "upload" && (
            <div>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                Upload a screenshot of your payment receipt for verification.
              </p>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }}
              />
              {!preview ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: "100%", padding: "40px 16px",
                    border: `2px dashed ${GOLD}60`, borderRadius: 16,
                    background: "#fffbeb", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 20,
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: GOLD + "20", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Upload size={24} style={{ color: GOLD2 }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Tap to upload receipt</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>JPG, PNG — screenshot or photo</p>
                  </div>
                </button>
              ) : (
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <img src={preview} alt="Receipt" style={{
                    width: "100%", borderRadius: 14, border: "1px solid #e2e8f0",
                    maxHeight: 280, objectFit: "contain", background: "#f8fafc",
                  }} />
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      width: 28, height: 28, borderRadius: "50%",
                      background: "#ef4444", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={13} color="#fff" />
                  </button>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setStep("bank")}
                  style={{
                    flex: 1, padding: 14, border: "1px solid #e2e8f0",
                    borderRadius: 14, background: "none", cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: "#64748b",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!file || submitting}
                  className="btn-gold"
                  style={{
                    flex: 2, padding: 14, borderRadius: 14, justifyContent: "center",
                    fontSize: 14, opacity: file ? 1 : 0.5, cursor: file ? "pointer" : "not-allowed",
                  }}
                >
                  {submitting ? "Submitting…" : "Submit for Approval"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Done ── */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "#d1fae5", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 20px",
              }}>
                <CheckCircle size={34} style={{ color: "#065f46" }} />
              </div>
              <p style={{ fontSize: 15, color: "#475569", marginBottom: 8, lineHeight: 1.7 }}>
                Your receipt has been submitted. Our team will review it shortly.
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: GOLD2, marginBottom: 28 }}>
                You'll be notified once your enrollment is confirmed.
              </p>
              <button
                onClick={onClose}
                className="btn-gold"
                style={{ padding: "14px 36px", borderRadius: 99, fontSize: 14, justifyContent: "center" }}
              >
                Got it!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
