import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations();
  return (
    <div className="bg-cream-50 py-32">
      <div className="container max-w-lg text-center">
        <p className="font-display text-6xl text-gold-400">404</p>
        <h1 className="mt-4 font-display text-2xl text-ink-900">{t("notFound.title")}</h1>
        <p className="mt-3 text-ink-600">{t("notFound.body")}</p>
        <Link href="/" className="btn-cta mt-8">
          {t("common.backHome")}
        </Link>
      </div>
    </div>
  );
}
