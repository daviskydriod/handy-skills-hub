// src/api/payments.ts
// Payment calls matching flat PHP backend (payments.php):
//   GET    /api/payments        → Admin: list all | Student: own (auto-detected by role)
//   GET    /api/payments/my     → Student: own payment history (explicit route)
//   POST   /api/payments        → Student: submit bank transfer proof (multipart)
//   PUT    /api/payments/{id}   → Admin: approve or reject a payment (JSON)

import client from "./client";

// ── Types ─────────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "approved" | "rejected";

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
  // Joined fields
  user_name?: string;
  user_email?: string;
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
 * GET /payments  |  GET /payments?status=pending
 */
export async function getPayments(
  filter: PaymentsFilter = {}
): Promise<Payment[]> {
  const params: Record<string, string> = {};
  if (filter.status) params.status = filter.status;

  const res = await client.get<PaymentsResponse>("/payments", { params });

  // ✅ FIX: Guard against { payments: null } or missing key
  return res.data?.payments ?? [];
}

/**
 * Student — get own payment history.
 * GET /payments/my
 *
 * ✅ FIX: Removed the broken 404/403 fallback that retried with
 *   ?path=my — that query param is not handled anywhere in index.php
 *   or payments.php, so the fallback always returned all payments (admin
 *   route) or another error. The /payments/my route works correctly after
 *   the payments.php fix (reading $GLOBALS['_METHOD'] not '_METHOD_OVERRIDE').
 *   If it ever 404s, we now return [] gracefully instead of a second bad request.
 */
export async function getMyPayments(): Promise<Payment[]> {
  try {
    const res = await client.get<PaymentsResponse>("/payments/my");
    return res.data?.payments ?? [];
  } catch (err: any) {
    // Swallow 404 gracefully (e.g. student has no payments yet)
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

/**
 * Student — submit a bank transfer payment with proof image.
 * POST /payments  (multipart/form-data)
 *
 * ✅ CRITICAL: Do NOT set Content-Type manually.
 *   Axios must set it automatically so it includes the multipart boundary.
 *   Without the boundary PHP cannot parse $_POST or $_FILES — the upload
 *   silently fails and the server gets an empty body.
 */
export async function submitPayment(formData: FormData): Promise<{
  message: string;
  payment_id: number;
  status: "pending";
}> {
  const res = await client.post("/payments", formData, {
    headers: {
      // ✅ Setting to undefined tells axios to auto-set with correct boundary
      "Content-Type": undefined,
    },
  });
  return res.data;
}

/**
 * Admin — approve or reject a pending payment.
 * PUT /payments/{id}
 * Body: { status: "approved"|"rejected", rejection_reason?: string }
 *
 * ✅ FIX: Fallback now uses ?id={id} in the query string (not a second PUT
 *   to /payments with params) because the client.ts interceptor converts
 *   all PUTs to POST+_method. The fallback path is the same handler in
 *   payments.php — it reads $_REQUEST['id'] which picks up query params.
 */
export async function reviewPayment(
  id: number,
  payload: ReviewPaymentPayload
): Promise<{ message: string; status: PaymentStatus }> {
  try {
    const res = await client.put(`/payments/${id}`, payload);
    return res.data;
  } catch (err: any) {
    // Retry without path segment — some hosts strip numeric path segments
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      const res = await client.put(`/payments`, payload, {
        params: { id },
      });
      return res.data;
    }
    throw err;
  }
}
