import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { localized } from "@/lib/i18n";
import type { ProducerWithImage } from "@/lib/services/house.service";
import { Reveal } from "@/components/public/reveal";

/** Section « Nos producteurs » de la page La maison (masquée si vide). */
export function ProducersSection({ producers, locale }: { producers: ProducerWithImage[]; locale: Locale }) {
  if (producers.length === 0) return null;

  return (
    <section id="producteurs" className="border-t border-ink-900/10 py-24 sm:py-32">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker">{locale === "en" ? "Our producers" : "Nos producteurs"}</p>
          <h2 className="mt-5 font-display text-3xl font-light tracking-tight text-ink-900 sm:text-4xl">
            {locale === "en" ? "The hands behind our produce" : "Ceux qui font notre cuisine"}
          </h2>
          <span className="mx-auto mt-7 block h-px w-14 bg-gold-500/60" />
        </Reveal>

        <div className="mt-16 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {producers.map((p, i) => {
            const craft = localized(p, "craft", locale);
            const description = localized(p, "description", locale);
            return (
              <Reveal key={p.id} delay={(i % 3) * 90}>
                <article className="group">
                  {p.image ? (
                    <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                      <Image
                        src={p.image.url}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.04]"
                        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className={p.image ? "mt-6" : "border-t border-gold-500/40 pt-6"}>
                    {craft ? <p className="text-[11px] uppercase tracking-[0.25em] text-gold-600">{craft}</p> : null}
                    <h3 className="mt-2 font-display text-2xl font-light tracking-tight text-ink-900">{p.name}</h3>
                    {p.location ? <p className="mt-1 font-display text-sm italic text-ink-500">{p.location}</p> : null}
                    {description ? <p className="mt-4 text-sm leading-relaxed text-ink-600">{description}</p> : null}
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline mt-4 inline-block text-xs uppercase tracking-[0.18em] text-ink-800"
                      >
                        {locale === "en" ? "Visit" : "Découvrir"}
                      </a>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
