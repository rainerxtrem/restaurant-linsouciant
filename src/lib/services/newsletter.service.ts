import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { sendMail } from "@/lib/mailer";
import { renderEmail, emailButton } from "@/lib/email-template";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";

function token() {
  return randomBytes(24).toString("hex");
}

/**
 * Inscription en double opt-in : on enregistre l'abonné (non confirmé) et on
 * lui envoie un email avec un lien de confirmation. Tant qu'il n'a pas
 * cliqué, il ne compte pas comme abonné et ne reçoit rien d'autre.
 */
export async function subscribeToNewsletter(email: string, locale: string) {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.confirmedAt && !existing.unsubscribedAt) {
    return { alreadySubscribed: true };
  }

  const confirmToken = existing?.confirmToken ?? token();
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { locale, unsubscribedAt: null, confirmToken },
    create: {
      email,
      locale,
      confirmToken,
      unsubscribeToken: token(),
    },
  });

  const settings = await getSiteSettings();
  const confirmUrl = absoluteUrl(
    `${locale === "en" ? "/en" : ""}/newsletter/confirmation?token=${subscriber.confirmToken}`
  );

  await sendMail({
    to: email,
    subject:
      locale === "en"
        ? "Confirm your newsletter subscription"
        : "Confirmez votre inscription à la newsletter",
    text:
      locale === "en"
        ? `Please confirm your subscription: ${confirmUrl}`
        : `Merci de confirmer votre inscription : ${confirmUrl}`,
    html: renderEmail({
      siteName: settings.siteName,
      tagline: settings.tagline,
      preheader:
        locale === "en" ? "One last click to confirm." : "Un dernier clic pour confirmer.",
      bodyHtml:
        locale === "en"
          ? `<p style="margin:0 0 12px;">Thank you for subscribing to the ${settings.siteName} newsletter.</p><p style="margin:0;">Please confirm your email address:</p>${emailButton("Confirm my subscription", confirmUrl)}`
          : `<p style="margin:0 0 12px;">Merci de votre intérêt pour la newsletter de ${settings.siteName}.</p><p style="margin:0;">Confirmez votre adresse email :</p>${emailButton("Confirmer mon inscription", confirmUrl)}`,
    }),
  });

  return { alreadySubscribed: false };
}

export async function confirmSubscription(confirmToken: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken } });
  if (!subscriber) return { ok: false as const };
  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { confirmedAt: subscriber.confirmedAt ?? new Date(), unsubscribedAt: null },
  });
  return { ok: true as const };
}

export async function unsubscribe(unsubscribeToken: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken } });
  if (!subscriber) return { ok: false as const };
  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { unsubscribedAt: new Date() },
  });
  return { ok: true as const };
}

export function listConfirmedSubscribers() {
  return prisma.newsletterSubscriber.findMany({
    where: { confirmedAt: { not: null }, unsubscribedAt: null },
    orderBy: { createdAt: "desc" },
  });
}
