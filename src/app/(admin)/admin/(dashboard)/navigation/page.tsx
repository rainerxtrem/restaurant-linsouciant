import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/services/settings.service";
import { listAllThemePages } from "@/lib/services/theme-page.service";
import { NAV_HREFS, TOGGLEABLE_PAGES, resolveNavOrder } from "@/lib/site-pages";
import { NavOrderList, type NavRow } from "@/components/admin/nav-order-list";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const [settings, housePage, themePages] = await Promise.all([
    getSiteSettings(),
    prisma.page.findUnique({ where: { slug: "la-maison" }, select: { status: true } }),
    listAllThemePages(),
  ]);

  const enabledThemes = themePages.filter((p) => p.enabled);

  const rows: NavRow[] = resolveNavOrder(settings.navOrder).map((key) => {
    if (key === "themes") {
      return {
        key,
        toggleKey: null,
        label: "Pages thématiques",
        href: enabledThemes.length ? enabledThemes.map((p) => `/${p.slug}`).join(", ") : null,
        enabled: enabledThemes.length > 0,
        note: enabledThemes.length
          ? `Affichées ici : ${enabledThemes.map((p) => p.title).join(", ")}.`
          : "Aucune page thématique activée pour l'instant.",
        manageHref: "/admin/pages-thematiques",
      };
    }
    if (key === "giftVouchers") {
      return {
        key,
        toggleKey: "giftVouchers",
        label: "Bons cadeaux",
        href: NAV_HREFS.giftVouchers,
        enabled: settings.giftVouchersEnabled,
        note: "Les bons déjà vendus restent valables ; seule la vente en ligne est suspendue.",
      };
    }
    const page = TOGGLEABLE_PAGES.find((p) => p.key === key)!;
    return {
      key,
      toggleKey: key,
      label: page.label,
      href: page.href,
      enabled: !settings.disabledPages.includes(key),
      note:
        key === "house" && housePage?.status !== "PUBLISHED"
          ? "Le contenu de la page est en brouillon (Contenu du site → Pages) : elle reste masquée tant qu'il n'est pas publié."
          : null,
    };
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Navigation</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-ink-500">
        L&apos;ordre ci-dessous est celui du menu et du pied de page : faites glisser une ligne (ou utilisez les
        flèches) pour la déplacer, l&apos;ordre est enregistré aussitôt. Une page masquée disparaît du menu et du
        pied de page, n&apos;est plus accessible (erreur 404) et sort du plan du site. Rien n&apos;est supprimé.
      </p>
      <NavOrderList rows={rows} />
    </div>
  );
}
