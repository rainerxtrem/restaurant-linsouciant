import { prisma } from "@/lib/db/prisma";

const albumInclude = {
  images: {
    orderBy: { order: "asc" },
    include: { media: true },
  },
} as const;

export function listAlbumsWithImages() {
  return prisma.galleryAlbum.findMany({ orderBy: { order: "asc" }, include: albumInclude });
}

export function listAlbums() {
  return prisma.galleryAlbum.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { images: true } } },
  });
}

export function getAlbum(id: string) {
  return prisma.galleryAlbum.findUnique({ where: { id }, include: albumInclude });
}

export type AlbumWithImages = NonNullable<Awaited<ReturnType<typeof getAlbum>>>;

export async function addImagesToAlbum(albumId: string, mediaIds: string[]) {
  const last = await prisma.galleryImage.findFirst({
    where: { albumId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  let order = (last?.order ?? -1) + 1;
  await prisma.galleryImage.createMany({
    data: mediaIds.map((mediaId) => ({ albumId, mediaId, order: order++ })),
  });
}

export async function reorderAlbumImages(albumId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, order) =>
      prisma.galleryImage.updateMany({ where: { id, albumId }, data: { order } })
    )
  );
}
