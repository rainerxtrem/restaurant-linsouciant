"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { giftVoucherPurchaseSchema } from "@/lib/validation/gift-voucher";
import { createVoucherCheckout } from "@/lib/services/gift-voucher.service";
import { checkRateLimit } from "@/lib/rate-limit";

export type GiftVoucherPurchaseState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function purchaseVoucherAction(
  _prev: GiftVoucherPurchaseState,
  formData: FormData
): Promise<GiftVoucherPurchaseState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`gift-voucher:${ip}`, 5, 10 * 60 * 1000)) {
    return { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." };
  }

  const parsed = giftVoucherPurchaseSchema.safeParse({
    amount: formData.get("amount"),
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
    recipientName: formData.get("recipientName") ?? "",
    recipientEmail: formData.get("recipientEmail") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.website) redirect("/bons-cadeaux");

  let checkoutUrl: string | null = null;
  try {
    checkoutUrl = (await createVoucherCheckout(parsed.data)).checkoutUrl;
  } catch (error) {
    console.error("Création de la session de paiement échouée:", error);
  }

  if (!checkoutUrl) {
    return { error: "Le paiement n'est pas disponible pour le moment. Merci de réessayer plus tard." };
  }
  redirect(checkoutUrl);
}
