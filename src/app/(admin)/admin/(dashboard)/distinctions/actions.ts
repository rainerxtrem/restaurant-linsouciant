"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { distinctionListSchema } from "@/lib/validation/house";
import { replaceDistinctions } from "@/lib/services/house.service";
import type { ListActionState } from "@/components/admin/list-editor";

export async function saveDistinctionsAction(_prev: ListActionState, formData: FormData): Promise<ListActionState> {
  await requireAdmin();
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Requête invalide." };
  const parsed = distinctionListSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const i = parsed.error.issues[0]?.path[0];
    return { error: `Merci de vérifier la distinction n°${typeof i === "number" ? i + 1 : "?"} (nom obligatoire, lien valide).` };
  }
  await replaceDistinctions(parsed.data);
  revalidatePath("/", "layout");
  revalidatePath("/admin/distinctions");
  return { success: true };
}
