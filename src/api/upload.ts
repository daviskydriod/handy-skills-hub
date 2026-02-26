// File: src/api/upload.ts
// Upload call matching flat PHP backend:
//   POST /api/upload/image → image.php

import client from "./client";

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await client.post<{ url: string }>("/upload/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
}
