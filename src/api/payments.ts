// File: src/api/payments.ts
// Payment calls matching flat PHP backend (api/payments.php):
//   GET    /api/payments           → Admin: list all payments (+ ?status=pending filter)
//   GET    /api/payments/my        → Student: own payment history
//   POST   /api/payments           → Student: submit bank transfer proof (multipart)
//   PUT    /api/payments/{id}      → Admin: approve or reject a payment (JSON)

import client from "./client";

// ── Enums / Literals ─────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "approved" | "rejected";

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A single payment record as returned by the backend */
export interface Payment {
  id: number;
  user_id: number;
  course_id: number;
  amount: number;
  proof_image: string | null;
  status: PaymentStatus;
  rejection_reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;

  // Joined fields — present on admin list view
  user_name?: string;
  user_email?: string;

  // Joined fields — present on student "my" view + admin list view
  course_title?: string;
  course_price?: number;
}

/** Response shape for list endpoints */
export interface PaymentsResponse {
  payments: Payment[];
}

/** Filters accepted by GET /payments (admin) */
export interface PaymentsFilter {
  status?: PaymentStatus;
}

/** Body for PUT /payments/{id} (admin approve/reject) */
export interface ReviewPaymentPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Admin — list all payments, optionally filtered by status.
 * GET /payments?status=pending
 */
export async function getPayments(
  filter: PaymentsFilter = {}
): Promise<Payment[]> {
  const res = await client.get<PaymentsResponse>("/payments", {
    params: filter,
  });
  return res.data.payments;
}

/**
 * Student — get own payment history.
 * GET /payments/my
 */
export async function getMyPayments(): Promise<Payment[]> {
  const res = await client.get<PaymentsResponse>("/payments/my");
  return res.data.payments;
}

/**
 * Student — submit a bank transfer payment with proof image.
 * POST /payments  (multipart/form-data)
 *
 * @example
 * const form = new FormData();
 * form.append("course_id", String(courseId));
 * form.append("amount", String(amount));
 * form.append("proof_image", fileInputRef.current.files[0]);
 * await submitPayment(form);
 */
export async function submitPayment(formData: FormData): Promise<{
  message: string;
  payment_id: number;
  status: "pending";
}> {
  const res = await client.post("/payments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Admin — approve or reject a pending payment.
 * PUT /payments/{id}
 *
 * @example
 * await reviewPayment(42, { status: "approved" });
 * await reviewPayment(42, { status: "rejected", rejection_reason: "Wrong amount sent" });
 */
export async function reviewPayment(
  id: number,
  payload: ReviewPaymentPayload
): Promise<{ message: string; status: PaymentStatus }> {
  const res = await client.put(`/payments/${id}`, payload);
  return res.data;
}
