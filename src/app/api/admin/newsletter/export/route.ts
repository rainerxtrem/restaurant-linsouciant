import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { listConfirmedSubscribers } from "@/lib/services/newsletter.service";

export async function GET() {
  try {
    await requireAdmin();
    const subscribers = await listConfirmedSubscribers();
    const csv = [
      "email;langue;inscrit_le",
      ...subscribers.map((s) => `${s.email};${s.locale};${s.createdAt.toISOString().slice(0, 10)}`),
    ].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="abonnes-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
