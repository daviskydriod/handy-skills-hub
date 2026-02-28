// src/api/upload.ts
// Upload call matching flat PHP backend:
//   POST /api/upload/image → image.php

import client from "./client";

/**
 * Upload an image file and get back its public URL.
 *
 * ✅ FIX: Removed the manual `Content-Type: multipart/form-data` header.
 *   When you set Content-Type manually for a FormData request, you omit the
 *   multipart boundary token that PHP needs to parse the fields and files.
 *   PHP receives an empty $_FILES and the upload always fails silently.
 *
 *   The fix is to let axios detect that the body is FormData and set the
 *   full header automatically:
 *     Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXXX
 *
 *   This is also consistent with how submitPayment() works in payments.ts.
 */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await client.post<{ url: string }>("/upload/image", form, {
    // ✅ No Content-Type header — axios sets it with the correct boundary
    timeout: 60_000, // images can be large; give more time than the default 30s
  });

  // ✅ FIX: Guard against missing url in response
  if (!res.data?.url) {
    throw new Error("Upload succeeded but server returned no file URL");
  }

  return res.data.url;
}
