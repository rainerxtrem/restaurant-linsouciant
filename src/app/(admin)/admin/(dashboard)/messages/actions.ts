"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import type { ContactMessageStatus } from "@prisma/client";

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  await prisma.contactMessage.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status")) as ContactMessageStatus },
  });
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/messages");
}
