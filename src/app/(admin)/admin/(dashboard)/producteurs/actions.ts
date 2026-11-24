"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { producerListSchema } from "@/lib/validation/house";
import { replaceProducers } from "@/lib/services/house.service";
import type { ListActionState } from "@/components/admin/list-editor";

export async function saveProducersAction(_prev: ListActionState, formData: FormData): Promise<ListActionState> {
  await requireAdmin();
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Requête invalide." };
  const parsed = producerListSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const i = parsed.error.issues[0]?.path[0];
    return { error: `Merci de vérifier le producteur n°${typeof i === "number" ? i + 1 : "?"} (nom obligatoire, lien valide).` };
  }
  await replaceProducers(parsed.data);
  revalidatePath("/", "layout");
  revalidatePath("/admin/producteurs");
  return { success: true };
}
