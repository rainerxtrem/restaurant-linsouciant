import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { EditorialGallery } from "@/components/site/editorial-gallery";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "photos" });
  return buildMetadata({ locale, path: "/photos", title: t("title"), description: t("intro") });
}

export default async function PhotosPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("photos");
  const albums = (await listAlbumsWithImages()).filter((a) => a.images.length > 0);

  return (
    <div className="bg-cream-50">
      <section className="py-28 text-center sm:py-36">
        <div className="container max-w-xl">
          <Reveal>
            <p className="kicker">{t("title")}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl font-light tracking-tight text-ink-900 sm:text-5xl">
              {t("intro")}
            </h1>
          </Reveal>
        </div>
      </section>

      {albums.length === 0 ? (
        <p className="pb-32 text-center text-sm text-ink-500">{t("empty")}</p>
      ) : (
        <div className="space-y-24 pb-32 sm:space-y-36">
          {albums.map((album) => (
            <section key={album.id} id={album.slug} className="scroll-mt-24">
              <div className="container">
                <div className="mb-10 flex items-center gap-6">
                  <h2 className="font-display text-xl font-light tracking-[0.15em] text-ink-900">
                    {localized(album, "title", locale)}
                  </h2>
                  <span className="h-px flex-1 bg-ink-900/15" />
                  <span className="text-xs tabular-nums text-ink-400">
                    {String(album.images.length).padStart(2, "0")}
                  </span>
                </div>
                <EditorialGallery
                  photos={album.images.map((img) => ({
                    id: img.id,
                    url: img.media.url,
                    alt: localized(img.media, "alt", locale) || null,
                  }))}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
