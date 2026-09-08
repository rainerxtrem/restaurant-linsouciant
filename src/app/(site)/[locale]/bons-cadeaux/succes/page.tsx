import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function GiftVoucherSuccessPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="bg-cream-50 py-28">
      <div className="container max-w-xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden />
        <h1 className="mt-6 font-display text-3xl text-ink-900">{t("giftVouchers.successTitle")}</h1>
        <p className="mt-4 text-ink-600">{t("giftVouchers.successBody")}</p>
        <Link href="/" className="btn-cta mt-8">
          {t("common.backHome")}
        </Link>
      </div>
    </div>
  );
}
