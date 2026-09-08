import { useTranslations } from "next-intl";
import { Facebook, Instagram } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SiteSettings, OpeningDay } from "@/lib/services/settings.service";
import { OpeningHours } from "@/components/site/opening-hours";
import { NewsletterForm } from "@/components/site/newsletter-form";

const LEGAL_LINKS = [
  { href: "/mentions-legales", key: "mentions-legales" },
  { href: "/politique-de-confidentialite", key: "politique-de-confidentialite" },
  { href: "/politique-cookies", key: "politique-cookies" },
  { href: "/accessibilite", key: "accessibilite" },
  { href: "/cgv", key: "cgv" },
] as const;

const LEGAL_LABELS: Record<string, { fr: string; en: string }> = {
  "mentions-legales": { fr: "Mentions légales", en: "Legal notice" },
  "politique-de-confidentialite": { fr: "Politique de confidentialité", en: "Privacy policy" },
  "politique-cookies": { fr: "Politique cookies", en: "Cookie policy" },
  accessibilite: { fr: "Accessibilité", en: "Accessibility" },
  cgv: { fr: "CGV bons cadeaux", en: "Gift voucher terms" },
};

const NAV_LINKS = [
  { href: "/menus", key: "menus" },
  { href: "/photos", key: "photos" },
  { href: "/bons-cadeaux", key: "giftVouchers" },
  { href: "/reservation", key: "book" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteFooter({
  settings,
  hours,
  locale,
}: {
  settings: SiteSettings;
  hours: OpeningDay[];
  locale: "fr" | "en";
}) {
  const t = useTranslations();
  const siteName = locale === "en" && settings.siteNameEn ? settings.siteNameEn : settings.siteName;

  return (
    <footer className="bg-ink-950 text-cream-100">
      <div className="container grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl text-cream-50">{siteName}</p>
          <p className="mt-3 font-display italic text-gold-400">
            {locale === "en" && settings.taglineEn ? settings.taglineEn : settings.tagline}
          </p>
          <address className="mt-5 space-y-1 text-sm not-italic text-cream-100/70">
            {settings.addressLine ? <p>{settings.addressLine}</p> : null}
            {settings.postalCode || settings.city ? (
              <p>
                {settings.postalCode} {settings.city}
              </p>
            ) : null}
            {settings.phone ? (
              <p>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-gold-300">
                  {settings.phone}
                </a>
              </p>
            ) : null}
            {settings.email ? (
              <p>
                <a href={`mailto:${settings.email}`} className="hover:text-gold-300">
                  {settings.email}
                </a>
              </p>
            ) : null}
          </address>
          {(settings.facebookUrl || settings.instagramUrl) && (
            <div className="mt-5 flex gap-3">
              {settings.facebookUrl ? (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-cream-100/70 hover:text-gold-300">
                  <Facebook className="h-5 w-5" />
                </a>
              ) : null}
              {settings.instagramUrl ? (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-cream-100/70 hover:text-gold-300">
                  <Instagram className="h-5 w-5" />
                </a>
              ) : null}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow text-cream-100/70">{t("footer.navTitle")}</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-cream-100/80">
            {NAV_LINKS.map((l) => (
              <Link key={l.key} href={l.href} className="w-fit hover:text-gold-300">
                {t(`nav.${l.key}`)}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="eyebrow text-cream-100/70">{t("common.openingHours")}</p>
          <div className="mt-4 text-cream-100/80">
            <OpeningHours hours={hours} showStatus={false} />
          </div>
        </div>

        <div>
          <p className="eyebrow text-cream-100/70">{t("footer.legalTitle")}</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-cream-100/80">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.key} href={l.href} className="w-fit hover:text-gold-300">
                {(LEGAL_LABELS[l.key] ?? { fr: l.key, en: l.key })[locale]}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow text-cream-100/70">{t("home.newsletterTitle")}</p>
            <p className="mt-2 max-w-xs text-sm text-cream-100/60">{t("home.newsletterIntro")}</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container py-6 text-xs text-cream-100/40">
          © {new Date().getFullYear()} {siteName} — {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
