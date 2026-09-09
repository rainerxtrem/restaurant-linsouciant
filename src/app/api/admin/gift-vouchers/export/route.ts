import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { listVouchersAdmin } from "@/lib/services/gift-voucher.service";

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  try {
    await requireAdmin();
    const vouchers = await listVouchersAdmin();
    const header = ["code", "montant_eur", "composition", "statut", "acheteur", "email_acheteur", "beneficiaire", "cree_le", "expire_le"];
    const rows = vouchers.map((v) =>
      [
        v.code,
        (v.amountCents / 100).toFixed(2),
        v.selectionLabel ?? "",
        v.status,
        v.buyerName,
        v.buyerEmail,
        v.recipientName ?? "",
        v.createdAt.toISOString().slice(0, 10),
        v.expiresAt ? v.expiresAt.toISOString().slice(0, 10) : "",
      ]
        .map(csvCell)
        .join(";")
    );
    const csv = [header.join(";"), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bons-cadeaux-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
