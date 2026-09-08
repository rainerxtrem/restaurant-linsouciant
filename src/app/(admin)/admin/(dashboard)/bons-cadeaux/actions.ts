"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { adminGiftVoucherCreateSchema } from "@/lib/validation/gift-voucher";
import {
  createVoucherManually,
  setVoucherStatus,
  deleteVoucher,
  resendVoucherEmailById,
} from "@/lib/services/gift-voucher.service";
import type { GiftVoucherStatus } from "@prisma/client";

export type VoucherActionState = { error?: string; success?: string };

export async function createVoucherAction(
  _prev: VoucherActionState,
  formData: FormData
): Promise<VoucherActionState> {
  await requireAdmin();
  const parsed = adminGiftVoucherCreateSchema.safeParse({
    amount: formData.get("amount"),
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
    recipientName: formData.get("recipientName") ?? "",
    recipientEmail: formData.get("recipientEmail") ?? "",
    message: formData.get("message") ?? "",
    sendEmail: formData.get("sendEmail") === "on",
  });
  if (!parsed.success) return { error: "Merci de vérifier les champs." };

  const voucher = await createVoucherManually(parsed.data);
  revalidatePath("/admin/bons-cadeaux");
  return { success: `Bon ${voucher.code} créé.` };
}

export async function setVoucherStatusAction(formData: FormData) {
  await requireAdmin();
  await setVoucherStatus(String(formData.get("id")), String(formData.get("status")) as GiftVoucherStatus);
  revalidatePath("/admin/bons-cadeaux");
}

export async function resendVoucherAction(formData: FormData) {
  await requireAdmin();
  await resendVoucherEmailById(String(formData.get("id")));
  revalidatePath("/admin/bons-cadeaux");
}

export async function deleteVoucherAction(formData: FormData) {
  await requireAdmin();
  await deleteVoucher(String(formData.get("id")));
  revalidatePath("/admin/bons-cadeaux");
}
