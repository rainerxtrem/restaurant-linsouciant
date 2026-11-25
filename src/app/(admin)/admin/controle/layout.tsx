import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { VOUCHER_ROLES } from "@/lib/auth/permissions";
import { logoutAction } from "@/app/(admin)/admin/(dashboard)/actions";

export const dynamic = "force-dynamic";

/**
 * Écran de salle : vérification des bons cadeaux. Hors du tableau de bord,
 * pour qu'un compte « Contrôle des bons cadeaux » n'ait accès à rien d'autre.
 */
export default async function VoucherCheckLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !VOUCHER_ROLES.includes(session.user.role)) redirect("/admin/login");
  const isAdmin = session.user.role !== "VOUCHER_CHECKER";

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800">
      <header className="border-b border-ink-900/10 bg-white">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <div>
            <p className="font-display text-lg leading-tight text-ink-900">L&apos;Insouciant</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Contrôle des bons cadeaux</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {isAdmin ? (
              <Link href="/admin/bons-cadeaux" className="text-wine-700 hover:underline">
                Administration
              </Link>
            ) : null}
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-1.5 text-ink-500 hover:text-ink-800" aria-label="Se déconnecter">
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-8">{children}</main>
      <p className="pb-8 text-center text-xs text-ink-400">Connecté : {session.user.name}</p>
    </div>
  );
}
