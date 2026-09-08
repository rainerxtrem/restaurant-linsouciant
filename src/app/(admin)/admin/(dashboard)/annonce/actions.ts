"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import { announcementSchema } from "@/lib/validation/announcement";

export type AnnouncementActionState = { error?: string; success?: boolean };

function toDate(v: string | undefined) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function saveAnnouncementAction(
  _prev: AnnouncementActionState,
  formData: FormData
): Promise<AnnouncementActionState> {
  await requireAdmin();
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Requête invalide." };

  const parsed = announcementSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return { error: "Merci de vérifier les champs." };
  const d = parsed.data;
  const orNull = (v: string | undefined) => (v && v.length > 0 ? v : null);

  await prisma.announcement.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {
      enabled: d.enabled,
      startsAt: toDate(d.startsAt),
      endsAt: toDate(d.endsAt),
      imageId: d.imageId ?? null,
      content: d.content ?? "",
      contentEn: orNull(d.contentEn),
      buttonLabel: orNull(d.buttonLabel),
      buttonLabelEn: orNull(d.buttonLabelEn),
      buttonUrl: orNull(d.buttonUrl),
      dismissDays: d.dismissDays,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/annonce");
  return { success: true };
}
