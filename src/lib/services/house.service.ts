import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import type { DistinctionInput, ProducerInput } from "@/lib/validation/house";

export function listProducers() {
  return prisma.producer.findMany({ orderBy: { order: "asc" }, include: { image: true } });
}
export type ProducerWithImage = Awaited<ReturnType<typeof listProducers>>[number];

/** Distinctions (pied de page, donc à chaque rendu : dédupliqué par `cache`). */
export const listDistinctions = cache(() =>
  prisma.distinction.findMany({ orderBy: { order: "asc" }, include: { image: true } })
);
export type DistinctionWithImage = Awaited<ReturnType<typeof listDistinctions>>[number];

const orNull = (v: string | undefined) => (v && v.length > 0 ? v : null);

/** Remplace toute la liste des producteurs (ordre = ordre du formulaire). */
export function replaceProducers(items: ProducerInput[]) {
  return prisma.$transaction([
    prisma.producer.deleteMany({}),
    prisma.producer.createMany({
      data: items.map((p, order) => ({
        name: p.name,
        craft: orNull(p.craft),
        craftEn: orNull(p.craftEn),
        location: orNull(p.location),
        description: orNull(p.description),
        descriptionEn: orNull(p.descriptionEn),
        imageId: p.imageId ?? null,
        url: orNull(p.url),
        order,
      })),
    }),
  ]);
}

/** Remplace toute la liste des distinctions (ordre = ordre du formulaire). */
export function replaceDistinctions(items: DistinctionInput[]) {
  return prisma.$transaction([
    prisma.distinction.deleteMany({}),
    prisma.distinction.createMany({
      data: items.map((d, order) => ({
        name: d.name,
        detail: orNull(d.detail),
        detailEn: orNull(d.detailEn),
        imageId: d.imageId ?? null,
        url: orNull(d.url),
        order,
      })),
    }),
  ]);
}
