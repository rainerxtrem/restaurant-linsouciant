import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** 404 du site public (dans le layout : en-tête et pied de page présents). */
export default function NotFound() {
  const t = useTranslations();

  const links = [
    { href: "/menus", label: t("nav.menus") },
    { href: "/la-maison", label: t("nav.house") },
    { href: "/reservation", label: t("nav.book") },
    { href: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden bg-cream-50 px-6 py-28">
      {/* Filigrane, comme le chiffre romain des cartes de menus */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[13rem] font-light leading-none text-ink-900/[0.035] sm:text-[22rem]"
      >
        404
      </span>

      <div className="page-fade relative max-w-xl text-center">
        <p className="kicker">{t("notFound.kicker")}</p>
        <h1 className="mt-6 font-display text-4xl font-light italic tracking-tight text-ink-900 sm:text-5xl">
          {t("notFound.title")}
        </h1>
        <span aria-hidden className="mx-auto mt-8 block h-px w-14 bg-gold-500/60" />
        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink-600">{t("notFound.body")}</p>

        <Link href="/" className="btn-cta mt-10">
          {t("common.backHome")}
        </Link>

        <nav aria-label={t("notFound.elsewhere")} className="mt-14">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink-400">{t("notFound.elsewhere")}</p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-sweep font-display text-lg font-light text-ink-800">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
