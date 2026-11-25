import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/services/settings.service";
import { listAllThemePages } from "@/lib/services/theme-page.service";
import { TOGGLEABLE_PAGES } from "@/lib/site-pages";
import { togglePageAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const [settings, housePage, themePages] = await Promise.all([
    getSiteSettings(),
    prisma.page.findUnique({ where: { slug: "la-maison" }, select: { id: true, status: true } }),
    listAllThemePages(),
  ]);

  const rows = [
    ...TOGGLEABLE_PAGES.map((p) => ({
      key: p.key as string,
      label: p.label,
      href: p.href,
      enabled: !settings.disabledPages.includes(p.key),
      note:
        p.key === "house" && housePage?.status !== "PUBLISHED"
          ? "Le contenu de la page est en brouillon (Contenu du site → Pages) : elle reste masquée tant qu'il n'est pas publié."
          : null,
    })),
    {
      key: "giftVouchers",
      label: "Bons cadeaux",
      href: "/bons-cadeaux",
      enabled: settings.giftVouchersEnabled,
      note: "Les bons déjà vendus restent valables ; seule la vente en ligne est suspendue.",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Navigation</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        Une page masquée disparaît du menu et du pied de page, n&apos;est plus accessible (erreur 404) et sort du
        plan du site pour Google. Rien n&apos;est supprimé : il suffit de la réafficher.
      </p>

      <div className="mt-6 max-w-3xl overflow-hidden rounded-lg border border-ink-900/10 bg-white">
        <ul className="divide-y divide-ink-900/5">
          <li className="flex items-center justify-between px-5 py-4 text-sm">
            <div>
              <p className="font-medium text-ink-800">Accueil</p>
              <p className="text-xs text-ink-400">/ — toujours affiché</p>
            </div>
            <span className="text-xs text-green-700">Affichée</span>
          </li>
          {rows.map((r) => (
            <li key={r.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-ink-800">{r.label}</p>
                <p className="text-xs text-ink-400">{r.href}</p>
                {r.note ? <p className="mt-1 max-w-md text-xs text-amber-700">{r.note}</p> : null}
              </div>
              <form action={togglePageAction} className="flex items-center gap-4">
                <input type="hidden" name="key" value={r.key} />
                <input type="hidden" name="enable" value={r.enabled ? "false" : "true"} />
                <span className={r.enabled ? "text-xs text-green-700" : "text-xs text-ink-400"}>
                  {r.enabled ? "Affichée" : "Masquée"}
                </span>
                <button
                  type="submit"
                  className={
                    r.enabled
                      ? "rounded-md border border-ink-200 px-3 py-1.5 text-xs text-ink-700 hover:bg-cream-100"
                      : "rounded-md bg-wine-700 px-3 py-1.5 text-xs text-white hover:bg-wine-800"
                  }
                >
                  {r.enabled ? "Masquer" : "Afficher"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 max-w-3xl rounded-lg border border-ink-900/10 bg-white p-5 text-sm">
        <p className="font-medium text-ink-800">Pages thématiques</p>
        <p className="mt-1 text-xs text-ink-500">
          Elles apparaissent dans le menu quand elles sont activées ; à gérer dans{" "}
          <Link href="/admin/pages-thematiques" className="text-wine-700 underline">
            Pages thématiques
          </Link>
          .
        </p>
        {themePages.length ? (
          <ul className="mt-3 space-y-1 text-xs">
            {themePages.map((tp) => (
              <li key={tp.id} className="flex justify-between">
                <span className="text-ink-700">{tp.title}</span>
                <span className={tp.enabled ? "text-green-700" : "text-ink-400"}>{tp.enabled ? "Affichée" : "Masquée"}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
