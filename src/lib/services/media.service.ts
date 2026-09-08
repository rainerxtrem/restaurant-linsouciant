import sharp from "sharp";
import { prisma } from "@/lib/db/prisma";
import { getStorageProvider } from "@/lib/storage";
import { MAX_UPLOAD_SIZE_BYTES, resolveMediaType } from "@/lib/media/limits";

export class MediaUploadError extends Error {}

export async function uploadMedia(file: File, uploadedById?: string) {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new MediaUploadError("Fichier trop volumineux (8 Mo maximum).");
  }
  const type = resolveMediaType(file.type);
  if (!type) throw new MediaUploadError("Format de fichier non pris en charge.");

  const buffer = Buffer.from(await file.arrayBuffer());

  let width: number | undefined;
  let height: number | undefined;
  if (type === "IMAGE" && file.type !== "image/svg+xml") {
    try {
      const meta = await sharp(buffer).metadata();
      width = meta.width;
      height = meta.height;
    } catch {
      // métadonnées indisponibles — non bloquant
    }
  }

  const stored = await getStorageProvider().upload({
    buffer,
    filename: file.name,
    mimeType: file.type,
  });

  return prisma.media.create({
    data: {
      filename: file.name,
      url: stored.url,
      storageKey: stored.key,
      type,
      mimeType: file.type,
      size: file.size,
      width,
      height,
      uploadedById: uploadedById ?? null,
    },
  });
}

export function listMedia() {
  return prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
}

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;
  await getStorageProvider().delete(media.storageKey).catch(() => {});
  await prisma.media.delete({ where: { id } });
}
