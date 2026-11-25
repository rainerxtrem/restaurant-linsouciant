"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import { allFields, getPageDef, type ImageField, type TextField } from "@/lib/content/pages";
import { resolveDefault, type StoredData } from "@/lib/content/page-content";

export type PageContentState = { error?: string; success?: boolean };

const payloadSchema = z.object({
  texts: z.record(z.object({ fr: z.string().max(5000), en: z.string().max(5000) })),
  images: z.record(z.string().cuid().nullable()),
});

// Vidéo d'accueil : URL absolue ou chemin local (/hero-video.mp4).
const isUrlOrPath = (v: string) => v === "" || /^\/[^/]/.test(v) || z.string().url().safeParse(v).success;

export async function savePageContentAction(
  pageKey: string,
  _prev: PageContentState,
  formData: FormData
): Promise<PageContentState> {
  await requireAdmin();
  const def = getPageDef(pageKey);
  if (!def) return { error: "Page inconnue." };

  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Requête invalide." };
  const parsed = payloadSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return { error: "Texte trop long (5000 caractères max par champ)." };
  const { texts, images } = parsed.data;

  const row = await prisma.pageContent.findUnique({ where: { key: pageKey } });
  const data: StoredData = { ...((row?.data as StoredData | null) ?? {}) };
  const settingUpdate: Record<string, string | null> = {};

  for (const field of allFields(def)) {
    if (field.type === "link") continue;

    if (field.type === "image") {
      const f = field as ImageField;
      if (!(f.key in images)) continue;
      const id = images[f.key] ?? null;
      if (f.setting) settingUpdate[f.setting] = id;
      else if (id) data[f.key] = { mediaId: id };
      else delete data[f.key];
      continue;
    }

    const f = field as TextField;
    const value = texts[f.key];
    if (!value) continue;
    const fr = value.fr.trim();
    const en = value.en.trim();

    if (f.setting) {
      if (f.key === "heroVideo" && !isUrlOrPath(fr)) {
        return { error: "Vidéo de fond : adresse invalide (https://… ou /fichier.mp4)." };
      }
      if (f.required && !fr) return { error: `« ${f.label} » ne peut pas être vide.` };
      settingUpdate[f.setting.fr] = f.required ? fr : fr || null;
      if (f.setting.en) settingUpdate[f.setting.en] = en || null;
      continue;
    }

    // Texte identique à l'original (ou vide) : on ne stocke rien, la page
    // garde le texte d'origine (et suivra ses futures corrections).
    const [defFr, defEn] = await Promise.all([resolveDefault(f.default, "fr"), resolveDefault(f.default, "en")]);
    const entry: { fr?: string; en?: string } = {};
    if (fr && fr !== defFr.trim()) entry.fr = fr;
    if (en && en !== defEn.trim()) entry.en = en;
    if (entry.fr || entry.en) data[f.key] = entry;
    else delete data[f.key];
  }

  await prisma.$transaction([
    prisma.pageContent.upsert({
      where: { key: pageKey },
      create: { key: pageKey, data: data as Prisma.InputJsonValue },
      update: { data: data as Prisma.InputJsonValue },
    }),
    ...(Object.keys(settingUpdate).length
      ? [prisma.siteSetting.update({ where: { id: "singleton" }, data: settingUpdate })]
      : []),
  ]);

  revalidatePath("/", "layout");
  revalidatePath(`/admin/pages/site/${pageKey}`);
  return { success: true };
}
