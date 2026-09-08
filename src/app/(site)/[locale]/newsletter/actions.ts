"use server";

import { headers } from "next/headers";
import { newsletterSubscribeSchema } from "@/lib/validation/newsletter";
import { checkRateLimit } from "@/lib/rate-limit";
import { subscribeToNewsletter } from "@/lib/services/newsletter.service";

export type NewsletterState = { success?: boolean; error?: string };

export async function subscribeNewsletterAction(
  locale: string,
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000)) {
    return { error: "Trop de tentatives. Merci de réessayer plus tard." };
  }

  const parsed = newsletterSubscribeSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on",
    website: formData.get("website"),
  });
  if (!parsed.success) return { error: "Merci de vérifier votre adresse email et le consentement." };

  // Honeypot rempli → faux succès.
  if (parsed.data.website) return { success: true };

  try {
    await subscribeToNewsletter(parsed.data.email, locale === "en" ? "en" : "fr");
    return { success: true };
  } catch (error) {
    console.error("Inscription newsletter échouée:", error);
    return { error: "L'inscription a échoué. Merci de réessayer." };
  }
}
