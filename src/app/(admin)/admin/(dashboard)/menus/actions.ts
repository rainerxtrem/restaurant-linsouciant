"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { menuSchema, type MenuInput } from "@/lib/validation/menu";
import { upsertMenu, deleteMenu, duplicateMenu } from "@/lib/services/menu.service";
import { prisma } from "@/lib/db/prisma";
import { seasonLabelSchema } from "@/lib/validation/house";

export type MenuActionState = { error?: string };

export async function saveMenuAction(
  id: string | null,
  _prev: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  await requireAdmin();
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Requête invalide." };

  let parsedInput: MenuInput;
  try {
    parsedInput = menuSchema.parse(JSON.parse(raw));
  } catch {
    return { error: "Merci de vérifier les champs du menu." };
  }

  await upsertMenu(parsedInput, id ?? undefined);
  revalidatePath("/admin/menus");
  revalidatePath("/menus");
  redirect("/admin/menus");
}

export async function deleteMenuAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await deleteMenu(id);
  revalidatePath("/admin/menus");
  revalidatePath("/menus");
}

export type SeasonLabelState = { error?: string; success?: boolean };

/** Libellé de la carte du moment (« Carte d'automne · novembre 2026 »). */
export async function saveSeasonLabelAction(_prev: SeasonLabelState, formData: FormData): Promise<SeasonLabelState> {
  await requireAdmin();
  const parsed = seasonLabelSchema.safeParse({
    label: formData.get("label") ?? "",
    labelEn: formData.get("labelEn") ?? "",
  });
  if (!parsed.success) return { error: "Libellé trop long (120 caractères max)." };
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", menusSeasonLabel: parsed.data.label || null, menusSeasonLabelEn: parsed.data.labelEn || null },
    update: { menusSeasonLabel: parsed.data.label || null, menusSeasonLabelEn: parsed.data.labelEn || null },
  });
  revalidatePath("/menus");
  revalidatePath("/admin/menus");
  return { success: true };
}

export async function duplicateMenuAction(formData: FormData) {
  await requireAdmin();
  const copy = await duplicateMenu(String(formData.get("id")));
  revalidatePath("/admin/menus");
  redirect(`/admin/menus/${copy.id}`);
}
