export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo

export const ALLOWED_MIME_TYPES: Record<string, "IMAGE" | "DOCUMENT"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/avif": "IMAGE",
  "image/gif": "IMAGE",
  "image/svg+xml": "IMAGE",
  "application/pdf": "DOCUMENT",
};

/**
 * Type MIME d'après l'extension, pour les navigateurs qui n'en fournissent
 * pas (fréquent pour .avif sous Windows).
 */
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export function resolveMimeType(declared: string, filename: string): string {
  if (declared && declared !== "application/octet-stream") return declared;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[ext] ?? declared;
}

export function resolveMediaType(mimeType: string): "IMAGE" | "DOCUMENT" | null {
  return ALLOWED_MIME_TYPES[mimeType] ?? null;
}
