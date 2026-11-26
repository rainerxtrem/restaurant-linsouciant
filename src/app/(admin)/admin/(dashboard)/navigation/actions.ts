"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import { PAGE_KEYS, resolveNavOrder, type PageKey } from "@/lib/site-pages";

/** Affiche / masque une page du site (navigation, accès, sitemap). */
export async function togglePageAction(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("key")) as PageKey;
  const enable = formData.get("enable") === "true";

  if ((key as string) === "giftVouchers") {
    await prisma.siteSetting.update({ where: { id: "singleton" }, data: { giftVouchersEnabled: enable } });
  } else {
    if (!PAGE_KEYS.includes(key)) return;
    const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" }, select: { disabledPages: true } });
    const current = new Set(settings?.disabledPages ?? []);
    if (enable) current.delete(key);
    else current.add(key);
    await prisma.siteSetting.update({ where: { id: "singleton" }, data: { disabledPages: [...current] } });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/navigation");
}

/** Enregistre l'ordre des liens du menu (glisser-déposer). */
export async function saveNavOrderAction(order: string[]) {
  await requireAdmin();
  if (!Array.isArray(order) || order.length > 20) return { error: "Ordre invalide." };
  await prisma.siteSetting.update({ where: { id: "singleton" }, data: { navOrder: resolveNavOrder(order) } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/navigation");
  return { ok: true as const };
}
