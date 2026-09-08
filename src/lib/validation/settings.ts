import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalUrl = z.string().trim().url("URL invalide").optional().or(z.literal(""));

const slotSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});
const daySchema = z.object({
  day: z.enum(["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]),
  closed: z.boolean(),
  slots: z.array(slotSchema),
});

export const siteSettingSchema = z.object({
  siteName: z.string().trim().min(2).max(150),
  siteNameEn: optionalText(150),
  tagline: z.string().trim().max(200),
  taglineEn: optionalText(200),
  intro: optionalText(2000),
  introEn: optionalText(2000),

  addressLine: optionalText(200),
  postalCode: optionalText(20),
  city: optionalText(100),
  phone: optionalText(30),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),

  openingHours: z.array(daySchema).max(7),

  parkingNote: optionalText(300),
  parkingNoteEn: optionalText(300),
  servicesNote: optionalText(1000),
  servicesNoteEn: optionalText(1000),
  paymentNote: optionalText(1000),
  paymentNoteEn: optionalText(1000),

  zenchefBookingUrl: optionalUrl,
  zenchefNewsletterUrl: optionalUrl,
  zenchefRestaurantId: optionalText(40),

  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  mapEmbedUrl: optionalText(4000),

  logoId: z.string().cuid().optional().nullable(),
  faviconId: z.string().cuid().optional().nullable(),
  ogImageId: z.string().cuid().optional().nullable(),
  heroImageId: z.string().cuid().optional().nullable(),
  aboutImageId: z.string().cuid().optional().nullable(),
  heroVideoUrl: optionalUrl,

  legalCompanyName: optionalText(200),
  legalSiret: optionalText(40),
  legalCapital: optionalText(60),
  legalPublicationDirector: optionalText(120),
  legalHost: optionalText(1000),
  legalRcsCity: optionalText(80),
  legalVatNumber: optionalText(40),

  seoDefaultTitle: optionalText(70),
  seoDefaultDescription: optionalText(180),

  footerText: optionalText(2000),
  footerTextEn: optionalText(2000),
  pressMentions: optionalText(1000),
});

export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
