import { NextResponse, type NextRequest } from "next/server";
import { sendExpiryReminders } from "@/lib/services/gift-voucher.service";

// Déclenchée par GitHub Actions (.github/workflows/gift-voucher-reminders.yml)
// — Railway n'offre pas de cron pour un service web toujours démarré.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await sendExpiryReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Relances bons cadeaux échouées:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
