import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { GiftVoucherForm } from "@/components/site/gift-voucher-form";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "giftVouchers" });
  return buildMetadata({ locale, path: "/bons-cadeaux", title: t("title"), description: t("intro") });
}

export default async function GiftVouchersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="bg-cream-50">
      <section className="border-b border-ink-900/10 bg-cream-100 py-20">
        <div className="container max-w-2xl">
          <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{t("giftVouchers.title")}</h1>
          <p className="mt-4 text-ink-600">{t("giftVouchers.intro")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-2xl">
          <Reveal>
            <div className="rounded-lg border border-ink-100 bg-white p-6 shadow-card sm:p-8">
              <GiftVoucherForm />
            </div>
          </Reveal>
          <p className="mt-6 text-xs text-ink-500">
            <Link href="/cgv" className="link-sweep text-wine-700">
              {locale === "en" ? "Gift voucher terms" : "Conditions générales de vente"}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
