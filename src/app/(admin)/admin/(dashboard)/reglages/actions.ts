"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import { siteSettingSchema } from "@/lib/validation/settings";

export type SettingsActionState = { error?: string; success?: boolean };

export async function saveSettingsAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireAdmin();

  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Requête invalide." };

  const parsed = siteSettingSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return { error: "Merci de vérifier les champs (URL, email, horaires)." };
  }
  const d = parsed.data;
  const orNull = (v: string | undefined) => (v && v.length > 0 ? v : null);

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", siteName: d.siteName, tagline: d.tagline },
    update: {
      siteName: d.siteName,
      siteNameEn: orNull(d.siteNameEn),
      tagline: d.tagline,
      taglineEn: orNull(d.taglineEn),
      intro: orNull(d.intro),
      introEn: orNull(d.introEn),
      addressLine: d.addressLine ?? "",
      postalCode: d.postalCode ?? "",
      city: d.city ?? "",
      phone: d.phone ?? "",
      email: d.email ?? "",
      openingHours: d.openingHours,
      parkingNote: orNull(d.parkingNote),
      parkingNoteEn: orNull(d.parkingNoteEn),
      servicesNote: orNull(d.servicesNote),
      servicesNoteEn: orNull(d.servicesNoteEn),
      paymentNote: orNull(d.paymentNote),
      paymentNoteEn: orNull(d.paymentNoteEn),
      zenchefBookingUrl: orNull(d.zenchefBookingUrl),
      zenchefNewsletterUrl: orNull(d.zenchefNewsletterUrl),
      zenchefRestaurantId: orNull(d.zenchefRestaurantId),
      facebookUrl: orNull(d.facebookUrl),
      instagramUrl: orNull(d.instagramUrl),
      googleMapsUrl: orNull(d.googleMapsUrl),
      mapEmbedUrl: orNull(d.mapEmbedUrl),
      logoId: d.logoId ?? null,
      faviconId: d.faviconId ?? null,
      ogImageId: d.ogImageId ?? null,
      heroImageId: d.heroImageId ?? null,
      legalCompanyName: orNull(d.legalCompanyName),
      legalSiret: orNull(d.legalSiret),
      legalCapital: orNull(d.legalCapital),
      legalPublicationDirector: orNull(d.legalPublicationDirector),
      legalHost: orNull(d.legalHost),
      legalRcsCity: orNull(d.legalRcsCity),
      legalVatNumber: orNull(d.legalVatNumber),
      seoDefaultTitle: orNull(d.seoDefaultTitle),
      seoDefaultDescription: orNull(d.seoDefaultDescription),
      footerText: orNull(d.footerText),
      footerTextEn: orNull(d.footerTextEn),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/reglages");
  return { success: true };
}
