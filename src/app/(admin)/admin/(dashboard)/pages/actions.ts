"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import { pageSchema } from "@/lib/validation/page";

export type PageActionState = { error?: string };

export async function savePageAction(
  id: string,
  _prev: PageActionState,
  formData: FormData
): Promise<PageActionState> {
  await requireAdmin();
  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    titleEn: formData.get("titleEn") ?? "",
    content: formData.get("content") ?? "",
    contentEn: formData.get("contentEn") ?? "",
    status: formData.get("status"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
  if (!parsed.success) return { error: "Merci de vérifier les champs." };

  const existing = await prisma.page.findUnique({ where: { id } });
  await prisma.page.update({
    where: { id },
    data: {
      title: parsed.data.title,
      titleEn: parsed.data.titleEn || null,
      content: parsed.data.content,
      contentEn: parsed.data.contentEn || null,
      status: parsed.data.status,
      publishedAt:
        parsed.data.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : null,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
    },
  });

  revalidatePath("/admin/pages");
  if (existing) revalidatePath(`/${existing.slug}`);
  redirect("/admin/pages");
}
