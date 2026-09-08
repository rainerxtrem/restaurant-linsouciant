"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin } from "@/lib/auth/permissions";
import { createUserSchema } from "@/lib/validation/auth";

export type UserActionState = { error?: string; success?: string };

export async function createUserAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  await requireSuperAdmin();
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Un compte existe déjà avec cet email." };

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role,
    },
  });
  revalidatePath("/admin/administrateurs");
  return { success: "Compte créé." };
}

export async function toggleUserActiveAction(formData: FormData) {
  const session = await requireSuperAdmin();
  const id = String(formData.get("id"));
  if (id === session.user.id) return;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  revalidatePath("/admin/administrateurs");
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireSuperAdmin();
  const id = String(formData.get("id"));
  if (id === session.user.id) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/administrateurs");
}
