import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { generateVoucherPdfById } from "@/lib/services/gift-voucher.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { buffer, voucher } = await generateVoucherPdfById(id);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bon-cadeau-${voucher.code}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
