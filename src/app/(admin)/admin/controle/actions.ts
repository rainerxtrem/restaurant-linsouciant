"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireVoucherAccess } from "@/lib/auth/permissions";
import { normalizeVoucherCode } from "@/lib/voucher-code-format";

/** Ce que voit l'équipe de salle : pas d'e-mail ni de données de paiement. */
export interface VoucherCheckView {
  id: string;
  code: string;
  amountCents: number;
  /** Statut effectif : un bon actif dont la date est passée est « EXPIRED ». */
  state: "VALID" | "REDEEMED" | "EXPIRED" | "UNPAID" | "CANCELLED";
  recipientName: string | null;
  buyerName: string;
  selectionLabel: string | null;
  message: string | null;
  expiresAt: string | null;
  redeemedAt: string | null;
  redeemedByName: string | null;
}

export type CheckState = { view?: VoucherCheckView; error?: string; notice?: string; query?: string };

async function toView(id: string): Promise<VoucherCheckView | null> {
  const v = await prisma.giftVoucher.findUnique({ where: { id } });
  if (!v) return null;
  const now = new Date();
  const state: VoucherCheckView["state"] =
    v.status === "REDEEMED"
      ? "REDEEMED"
      : v.status === "PENDING_PAYMENT"
        ? "UNPAID"
        : v.status === "CANCELLED"
          ? "CANCELLED"
          : v.status === "EXPIRED" || (v.expiresAt && v.expiresAt <= now)
            ? "EXPIRED"
            : "VALID";
  return {
    id: v.id,
    code: v.code,
    amountCents: v.amountCents,
    state,
    recipientName: v.recipientName,
    buyerName: v.buyerName,
    selectionLabel: v.selectionLabel,
    message: v.message,
    expiresAt: v.expiresAt?.toISOString() ?? null,
    redeemedAt: v.redeemedAt?.toISOString() ?? null,
    redeemedByName: v.redeemedByName,
  };
}

export async function lookupVoucherAction(_prev: CheckState, formData: FormData): Promise<CheckState> {
  await requireVoucherAccess();
  const query = String(formData.get("code") ?? "");
  const code = normalizeVoucherCode(query);
  if (!code) return { error: "Saisissez un code.", query };

  const found = await prisma.giftVoucher.findUnique({ where: { code }, select: { id: true } });
  if (!found) return { error: `Aucun bon cadeau ne porte le code ${code}.`, query: code };
  return { view: (await toView(found.id)) ?? undefined, query: code };
}

export async function redeemVoucherAction(_prev: CheckState, formData: FormData): Promise<CheckState> {
  const session = await requireVoucherAccess();
  const id = String(formData.get("id") ?? "");
  const now = new Date();

  // Mise à jour conditionnelle : un seul passage peut valider le bon, même
  // si deux personnes appuient en même temps.
  const { count } = await prisma.giftVoucher.updateMany({
    where: { id, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    data: { status: "REDEEMED", redeemedAt: now, redeemedByName: session.user.name },
  });

  const view = await toView(id);
  if (!view) return { error: "Bon cadeau introuvable." };
  revalidatePath("/admin/bons-cadeaux");
  if (count === 0) {
    return { view, query: view.code, error: "Ce bon n'a pas pu être validé : il n'est plus valable." };
  }
  return { view, query: view.code, notice: "Bon validé. Il est maintenant marqué comme utilisé." };
}
