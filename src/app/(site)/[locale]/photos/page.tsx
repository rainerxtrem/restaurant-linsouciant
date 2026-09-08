import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
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
      <section className="border-b border-ink-900/10 bg-cream-100 py-20">
        <div className="container max-w-3xl">
          <Reveal>
            <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{t("title")}</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-4 text-ink-600">{t("intro")}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container space-y-16">
          {albums.length === 0 ? (
            <p className="text-center text-sm text-ink-500">{t("empty")}</p>
          ) : (
            albums.map((album) => (
              <div key={album.id} id={album.slug} className="scroll-mt-28">
                <h2 className="mb-6 font-display text-2xl text-ink-900">
                  {localized(album, "title", locale)}
                </h2>
                <LightboxGallery
                  photos={album.images.map((img) => ({
                    id: img.id,
                    url: img.media.url,
                    alt: localized(img.media, "alt", locale) || null,
                  }))}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
