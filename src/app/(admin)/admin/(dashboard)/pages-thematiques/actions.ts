"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { themePageSchema } from "@/lib/validation/theme-page";
import {
  upsertThemePage,
  setThemePageEnabled,
  deleteThemePage,
  ThemePageSlugError,
} from "@/lib/services/theme-page.service";

export type ThemePageActionState = { error?: string };

export async function saveThemePageAction(
  id: string | null,
  _prev: ThemePageActionState,
  formData: FormData
): Promise<ThemePageActionState> {
  await requireAdmin();
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Requête invalide." };

  const parsed = themePageSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where =
      issue?.path[0] === "products" && typeof issue.path[1] === "number"
        ? ` (produit n°${issue.path[1] + 1})`
        : issue
          ? ` (${String(issue.path[0])})`
          : "";
    return { error: `Merci de vérifier les champs${where}. Chaque produit doit avoir un nom.` };
  }

  try {
    await upsertThemePage(parsed.data, id ?? undefined);
  } catch (error) {
    if (error instanceof ThemePageSlugError) return { error: error.message };
    throw error;
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/pages-thematiques");
  redirect("/admin/pages-thematiques");
}

export async function toggleThemePageAction(formData: FormData) {
  await requireAdmin();
  await setThemePageEnabled(String(formData.get("id")), formData.get("enabled") === "true");
  revalidatePath("/", "layout");
  revalidatePath("/admin/pages-thematiques");
}

export async function deleteThemePageAction(formData: FormData) {
  await requireAdmin();
  await deleteThemePage(String(formData.get("id")));
  revalidatePath("/", "layout");
  revalidatePath("/admin/pages-thematiques");
  revalidatePath("/admin/menus");
}
