export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo

export const ALLOWED_MIME_TYPES: Record<string, "IMAGE" | "DOCUMENT"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "image/svg+xml": "IMAGE",
  "application/pdf": "DOCUMENT",
};

export function resolveMediaType(mimeType: string): "IMAGE" | "DOCUMENT" | null {
  return ALLOWED_MIME_TYPES[mimeType] ?? null;
}
