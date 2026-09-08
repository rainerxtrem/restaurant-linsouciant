"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { menuSchema, type MenuInput } from "@/lib/validation/menu";
import { upsertMenu, deleteMenu } from "@/lib/services/menu.service";

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
