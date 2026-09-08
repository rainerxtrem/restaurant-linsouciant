import { prisma } from "@/lib/db/prisma";
import { getStripeClient } from "@/lib/stripe";
import { generateUniqueVoucherCode } from "@/lib/gift-voucher-code";
import { sendMail } from "@/lib/mailer";
import { renderEmail, emailButton } from "@/lib/email-template";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";
import { generateVoucherPdf } from "@/lib/services/gift-voucher-pdf";
import type { GiftVoucherPurchaseInput, AdminGiftVoucherCreateInput } from "@/lib/validation/gift-voucher";
import type { GiftVoucher, GiftVoucherStatus } from "@prisma/client";

// Durée de validité légale usuelle pour une carte cadeau en France.
const VALIDITY_MONTHS = 12;

export class VoucherNotFoundError extends Error {
  constructor() {
    super("Aucun bon cadeau ne correspond à ce code.");
    this.name = "VoucherNotFoundError";
  }
}

function expiryFrom(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + VALIDITY_MONTHS);
  return d;
}

// ---------------------------------------------------------------------------
// Achat en ligne
// ---------------------------------------------------------------------------

export async function createVoucherCheckout(input: GiftVoucherPurchaseInput) {
  const code = await generateUniqueVoucherCode();
  const amountCents = Math.round(input.amount * 100);

  const voucher = await prisma.giftVoucher.create({
    data: {
      code,
      amountCents,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      recipientName: input.recipientName || null,
      recipientEmail: input.recipientEmail || null,
      message: input.message || null,
    },
  });

  const settings = await getSiteSettings();
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.buyerEmail,
    allow_promotion_codes: true,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: `Bon cadeau ${settings.siteName}`,
            description: `Bon cadeau d'une valeur de ${(amountCents / 100).toFixed(2)} € à valoir au restaurant ${settings.siteName}.`,
          },
        },
      },
    ],
    metadata: { voucherId: voucher.id, voucherCode: code },
    success_url: absoluteUrl(`/bons-cadeaux/succes?code=${code}`),
    cancel_url: absoluteUrl("/bons-cadeaux"),
  });

  await prisma.giftVoucher.update({
    where: { id: voucher.id },
    data: { stripeSessionId: session.id },
  });

  return { checkoutUrl: session.url };
}

/** Appelé par le webhook Stripe une fois le paiement confirmé. */
export async function activateVoucherFromCheckout(sessionId: string, paymentIntentId: string | null) {
  const voucher = await prisma.giftVoucher.findUnique({ where: { stripeSessionId: sessionId } });
  if (!voucher) {
    console.error("Webhook Stripe : aucun bon cadeau pour la session", sessionId);
    return;
  }
  if (voucher.status !== "PENDING_PAYMENT") return; // idempotence

  const now = new Date();
  const activated = await prisma.giftVoucher.update({
    where: { id: voucher.id },
    data: {
      status: "ACTIVE",
      issuedAt: now,
      expiresAt: expiryFrom(now),
      stripePaymentIntentId: paymentIntentId,
    },
  });

  await sendVoucherEmail(activated);
}

// ---------------------------------------------------------------------------
// Création manuelle (admin)
// ---------------------------------------------------------------------------

export async function createVoucherManually(input: AdminGiftVoucherCreateInput) {
  const code = await generateUniqueVoucherCode();
  const now = new Date();

  const voucher = await prisma.giftVoucher.create({
    data: {
      code,
      amountCents: Math.round(input.amount * 100),
      status: "ACTIVE",
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      recipientName: input.recipientName || null,
      recipientEmail: input.recipientEmail || null,
      message: input.message || null,
      issuedAt: now,
      expiresAt: expiryFrom(now),
    },
  });

  if (input.sendEmail) await sendVoucherEmail(voucher);
  return voucher;
}

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

async function sendVoucherEmail(voucher: GiftVoucher) {
  const settings = await getSiteSettings();
  const amount = (voucher.amountCents / 100).toFixed(2);
  const to = voucher.recipientEmail || voucher.buyerEmail;
  const isGift = Boolean(voucher.recipientEmail && voucher.recipientEmail !== voucher.buyerEmail);
  const expiryLabel = voucher.expiresAt
    ? voucher.expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  let pdfAttachment: { filename: string; content: string }[] | undefined;
  try {
    const pdfBuffer = await generateVoucherPdf({
      amountLabel: amount,
      code: voucher.code,
      expiryLabel,
      buyerName: voucher.buyerName,
      recipientName: isGift ? voucher.recipientName : null,
      logoUrl: settings.logo?.url ?? null,
      siteName: settings.siteName,
      contactEmail: settings.email || null,
    });
    pdfAttachment = [{ filename: `bon-cadeau-${voucher.code}.pdf`, content: pdfBuffer.toString("base64") }];
  } catch (error) {
    console.error("Génération du PDF bon cadeau échouée:", error);
  }

  const bodyHtml = `
    <p style="margin:0 0 16px;">Bonjour${isGift && voucher.recipientName ? " " + voucher.recipientName : ""},</p>
    <p style="margin:0 0 16px;">
      ${
        isGift
          ? `<strong>${voucher.buyerName}</strong> vous offre un bon cadeau de <strong>${amount} €</strong> à valoir au restaurant ${settings.siteName}.`
          : `Merci pour votre achat ! Voici votre bon cadeau de <strong>${amount} €</strong>, à valoir au restaurant ${settings.siteName}.`
      }
    </p>
    ${voucher.message && isGift ? `<p style="margin:0 0 16px; padding:14px; background-color:#faf6ee; border-radius:3px; font-style:italic;">« ${voucher.message} »</p>` : ""}
    <div style="text-align:center; margin:24px 0; padding:20px; background-color:#faf6ee; border-radius:4px;">
      <p style="margin:0 0 6px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#8d8471;">Votre code</p>
      <p style="margin:0; font-family:'Courier New', monospace; font-size:24px; letter-spacing:2px; color:#231e1a; font-weight:bold;">${voucher.code}</p>
    </div>
    <p style="margin:0 0 8px; font-size:13px; color:#6f6455;">
      Votre bon cadeau, prêt à imprimer, se trouve en pièce jointe (PDF). Présentez-le lors de votre venue, de préférence sur réservation.
      ${expiryLabel ? `Valable jusqu'au ${expiryLabel}.` : ""}
    </p>
    ${emailButton("Réserver une table", absoluteUrl("/reservation"))}
  `;

  await sendMail({
    to,
    subject: isGift ? `${voucher.buyerName} vous offre un bon cadeau !` : "Votre bon cadeau",
    text: `Votre bon cadeau de ${amount} € : ${voucher.code}\n\nÀ valoir au restaurant ${settings.siteName}.${expiryLabel ? ` Valable jusqu'au ${expiryLabel}.` : ""}\n\nVotre certificat est en pièce jointe (PDF).`,
    html: renderEmail({
      siteName: settings.siteName,
      tagline: settings.tagline,
      preheader: `Votre bon cadeau de ${amount} € — code ${voucher.code}`,
      bodyHtml,
    }),
    attachments: pdfAttachment,
  }).catch((error) => console.error("Envoi email bon cadeau échoué:", error));

  if (isGift) {
    await sendMail({
      to: voucher.buyerEmail,
      subject: "Confirmation de votre achat de bon cadeau",
      text: `Votre bon cadeau de ${amount} € a bien été envoyé à ${voucher.recipientEmail}.`,
      html: renderEmail({
        siteName: settings.siteName,
        tagline: settings.tagline,
        preheader: `Votre bon cadeau de ${amount} € a été envoyé`,
        bodyHtml: `<p style="margin:0 0 16px;">Bonjour ${voucher.buyerName},</p><p style="margin:0;">Votre bon cadeau de <strong>${amount} €</strong> a bien été envoyé à <strong>${voucher.recipientEmail}</strong>. Merci pour votre achat !</p>`,
      }),
    }).catch((error) => console.error("Envoi email confirmation acheteur échoué:", error));
  }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export function listVouchersAdmin() {
  return prisma.giftVoucher.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getVoucherById(id: string) {
  const voucher = await prisma.giftVoucher.findUnique({ where: { id } });
  if (!voucher) throw new VoucherNotFoundError();
  return voucher;
}

export function getVoucherByCode(code: string) {
  return prisma.giftVoucher.findUnique({ where: { code: code.trim().toUpperCase() } });
}

export async function resendVoucherEmailById(id: string) {
  await sendVoucherEmail(await getVoucherById(id));
}

export async function setVoucherStatus(id: string, status: GiftVoucherStatus) {
  const voucher = await getVoucherById(id);
  const data: Record<string, unknown> = { status };

  if (status === "REDEEMED" && voucher.status !== "REDEEMED") data.redeemedAt = new Date();
  if (status !== "REDEEMED" && voucher.status === "REDEEMED") data.redeemedAt = null;
  if (status === "ACTIVE" && !voucher.issuedAt) {
    const now = new Date();
    data.issuedAt = now;
    data.expiresAt = expiryFrom(now);
  }

  return prisma.giftVoucher.update({ where: { id }, data });
}

export async function deleteVoucher(id: string) {
  await getVoucherById(id);
  await prisma.giftVoucher.delete({ where: { id } });
}

export async function generateVoucherPdfById(id: string) {
  const voucher = await getVoucherById(id);
  const settings = await getSiteSettings();
  const isGift = Boolean(voucher.recipientEmail && voucher.recipientEmail !== voucher.buyerEmail);
  const buffer = await generateVoucherPdf({
    amountLabel: (voucher.amountCents / 100).toFixed(2),
    code: voucher.code,
    expiryLabel: voucher.expiresAt
      ? voucher.expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : null,
    buyerName: voucher.buyerName,
    recipientName: isGift ? voucher.recipientName : null,
    logoUrl: settings.logo?.url ?? null,
    siteName: settings.siteName,
    contactEmail: settings.email || null,
  });
  return { buffer, voucher };
}

// ---------------------------------------------------------------------------
// Relances avant expiration (déclenché par cron GitHub Actions)
// ---------------------------------------------------------------------------

export async function sendExpiryReminders(): Promise<{ sent: number; checked: number }> {
  const now = new Date();
  const window = new Date(now);
  window.setDate(window.getDate() + 30);

  const candidates = await prisma.giftVoucher.findMany({
    where: {
      status: "ACTIVE",
      expiryReminderSentAt: null,
      expiresAt: { gt: now, lte: window },
    },
  });

  const settings = await getSiteSettings();
  let sent = 0;

  for (const voucher of candidates) {
    const amount = (voucher.amountCents / 100).toFixed(2);
    const to = voucher.recipientEmail || voucher.buyerEmail;
    const expiryLabel = voucher.expiresAt
      ? voucher.expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : null;
    try {
      await sendMail({
        to,
        subject: "Votre bon cadeau expire bientôt",
        text: `Votre bon cadeau de ${amount} € (code ${voucher.code}) expire${expiryLabel ? ` le ${expiryLabel}` : " bientôt"}. Pensez à réserver une table au restaurant ${settings.siteName}.`,
        html: renderEmail({
          siteName: settings.siteName,
          tagline: settings.tagline,
          preheader: `Votre bon cadeau de ${amount} € expire bientôt`,
          bodyHtml: `<p style="margin:0 0 16px;">Bonjour,</p><p style="margin:0 0 16px;">Votre bon cadeau de <strong>${amount} €</strong> (code <strong>${voucher.code}</strong>) expire${expiryLabel ? ` le <strong>${expiryLabel}</strong>` : " bientôt"}. Pensez à réserver votre table.</p>${emailButton("Réserver une table", absoluteUrl("/reservation"))}`,
        }),
      });
      sent++;
    } catch (error) {
      console.error(`Relance bon cadeau ${voucher.code} échouée:`, error);
    }
    await prisma.giftVoucher.update({
      where: { id: voucher.id },
      data: { expiryReminderSentAt: now },
    });
  }

  return { sent, checked: candidates.length };
}

// ---------------------------------------------------------------------------
// Statistiques (tableau de bord admin)
// ---------------------------------------------------------------------------

export async function getGiftVoucherStats() {
  const vouchers = await prisma.giftVoucher.findMany();
  const byStatus: Record<GiftVoucherStatus, number> = {
    PENDING_PAYMENT: 0,
    ACTIVE: 0,
    REDEEMED: 0,
    EXPIRED: 0,
    CANCELLED: 0,
  };
  let soldCents = 0;
  let redeemedCents = 0;
  for (const v of vouchers) {
    byStatus[v.status]++;
    if (v.status === "ACTIVE" || v.status === "REDEEMED") soldCents += v.amountCents;
    if (v.status === "REDEEMED") redeemedCents += v.amountCents;
  }
  return { total: vouchers.length, byStatus, soldCents, redeemedCents };
}
