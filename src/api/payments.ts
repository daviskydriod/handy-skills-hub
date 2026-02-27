// File: src/api/payments.ts
// Payment calls matching flat PHP backend (api/payments.php):
//   GET    /api/payments           → Admin: list all payments (+ ?status=pending filter)
//   GET    /api/payments/my        → Student: own payment history
//   POST   /api/payments           → Student: submit bank transfer proof (multipart)
//   PUT    /api/payments/{id}      → Admin: approve or reject a payment (JSON)

import client from "./client";

// ── Enums / Literals ──────────────────────────────────────────────────
export type PaymentStatus = "pending" | "approved" | "rejected";

// ── Interfaces ────────────────────────────────────────────────────────
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
  updated_at?: string;
  // Joined — admin list view
  user_name?: string;
  user_email?: string;
  // Joined — student "my" view + admin list
  course_title?: string;
  course_price?: number;
}

export interface PaymentsResponse {
  payments: Payment[];
}

export interface PaymentsFilter {
  status?: PaymentStatus;
}

export interface ReviewPaymentPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
}

// ── API Functions ─────────────────────────────────────────────────────

/**
 * Admin — list all payments, optionally filtered by status.
 * GET /payments
 * GET /payments?status=pending
 */
export async function getPayments(
  filter: PaymentsFilter = {}
): Promise<Payment[]> {
  // Only send status if it's a real value
  const params: Record<string, string> = {};
  if (filter.status) params.status = filter.status;

  const res = await client.get<PaymentsResponse>("/payments", { params });
  return res.data.payments;
}

/**
 * Student — get own payment history.
 * GET /payments/my
 *
 * Falls back to GET /payments?path=my if the server doesn't support
 * PATH_INFO (common on shared/flat PHP hosting).
 */
export async function getMyPayments(): Promise<Payment[]> {
  try {
    // Primary: /payments/my  (works if server has PATH_INFO or URL rewriting)
    const res = await client.get<PaymentsResponse>("/payments/my");
    return res.data.payments;
  } catch (err: any) {
    // Fallback: /payments?path=my  (works on flat PHP setups)
    if (err?.response?.status === 404 || err?.response?.status === 403) {
      const res = await client.get<PaymentsResponse>("/payments", {
        params: { path: "my" },
      });
      return res.data.payments;
    }
    throw err;
  }
}

/**
 * Student — submit a bank transfer payment with proof image.
 * POST /payments  (multipart/form-data)
 *
 * @example
 * const form = new FormData();
 * form.append("course_id", String(courseId));
 * form.append("amount",    String(amount));
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
 * Falls back to PUT /payments?id={id} if PATH_INFO isn't supported.
 *
 * @example
 * await reviewPayment(42, { status: "approved" });
 * await reviewPayment(42, { status: "rejected", rejection_reason: "Wrong amount" });
 */
export async function reviewPayment(
  id: number,
  payload: ReviewPaymentPayload
): Promise<{ message: string; status: PaymentStatus }> {
  try {
    // Primary: /payments/{id}
    const res = await client.put(`/payments/${id}`, payload);
    return res.data;
  } catch (err: any) {
    // Fallback: /payments?id={id}
    if (err?.response?.status === 404 || err?.response?.status === 400) {
      const res = await client.put(`/payments`, payload, {
        params: { id },
      });
      return res.data;
    }
    throw err;
  }
}
