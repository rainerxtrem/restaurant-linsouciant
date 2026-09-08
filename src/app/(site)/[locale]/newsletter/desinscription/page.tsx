import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { unsubscribe } from "@/lib/services/newsletter.service";

export const dynamic = "force-dynamic";

export default async function NewsletterUnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");
  const { token } = await searchParams;

  const result = token ? await unsubscribe(token) : { ok: false as const };

  return (
    <div className="bg-cream-50 py-28">
      <div className="container max-w-xl text-center">
        <h1 className="font-display text-3xl text-ink-900">
          {result.ok ? t("unsubscribedTitle") : t("invalidToken")}
        </h1>
        {result.ok ? <p className="mt-4 text-ink-600">{t("unsubscribedBody")}</p> : null}
        <Link href="/" className="btn-cta mt-8">
          {locale === "en" ? "Back to home" : "Retour à l'accueil"}
        </Link>
      </div>
    </div>
  );
}
