import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/services/settings.service";
import { getPageDef, type ImageField, type LinkField, type TextField } from "@/lib/content/pages";
import { getStoredContent, resolveDefault } from "@/lib/content/page-content";
import { PageContentForm, type FormSection } from "@/components/admin/page-content-form";

export const dynamic = "force-dynamic";

export default async function EditSitePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const def = getPageDef(key);
  if (!def) notFound();

  const [stored, settings, housePage] = await Promise.all([
    getStoredContent(key),
    getSiteSettings(),
    prisma.page.findUnique({ where: { slug: "la-maison" }, select: { id: true } }),
  ]);
  const s = settings as unknown as Record<string, unknown>;

  // Photos actuellement choisies (réglage ou contenu de la page).
  const imageIds = def.sections
    .flatMap((sec) => sec.fields)
    .filter((f): f is ImageField => f.type === "image")
    .map((f) => (f.setting ? (s[f.setting] as string | null) : (stored[f.key]?.mediaId ?? null)))
    .filter((id): id is string => Boolean(id));
  const media = imageIds.length ? await prisma.media.findMany({ where: { id: { in: imageIds } } }) : [];
  const mediaById = new Map(media.map((m) => [m.id, { id: m.id, url: m.url }]));

  const sections: FormSection[] = await Promise.all(
    def.sections.map(async (sec) => ({
      title: sec.title,
      fields: await Promise.all(
        sec.fields.map(async (field) => {
          if (field.type === "link") {
            const f = field as LinkField;
            const href =
              f.href === "/admin/pages?slug=la-maison" && housePage ? `/admin/pages/${housePage.id}` : f.href;
            return { kind: "link" as const, key: f.key, label: f.label, hint: f.hint ?? null, href };
          }
          if (field.type === "image") {
            const f = field as ImageField;
            const id = f.setting ? (s[f.setting] as string | null) : (stored[f.key]?.mediaId ?? null);
            return {
              kind: "image" as const,
              key: f.key,
              label: f.label,
              hint: f.hint ?? null,
              current: id ? (mediaById.get(id) ?? null) : null,
            };
          }
          const f = field as TextField;
          const [defFr, defEn] = await Promise.all([resolveDefault(f.default, "fr"), resolveDefault(f.default, "en")]);
          const value = f.setting
            ? {
                fr: (s[f.setting.fr] as string | null) ?? "",
                en: f.setting.en ? ((s[f.setting.en] as string | null) ?? "") : "",
              }
            : { fr: stored[f.key]?.fr || defFr, en: stored[f.key]?.en || defEn };
          return {
            kind: "text" as const,
            key: f.key,
            label: f.label,
            hint: f.hint ?? null,
            multiline: f.type === "textarea",
            bilingual: !f.setting || Boolean(f.setting.en),
            fromSettings: Boolean(f.setting),
            value,
            defaults: f.setting ? null : { fr: defFr, en: defEn },
          };
        })
      ),
    }))
  );

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/pages" className="text-wine-700 hover:underline">
          ← Pages
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">{def.label}</h1>
        <a href={def.path} target="_blank" rel="noreferrer" className="text-sm text-wine-700 hover:underline">
          Voir la page ↗
        </a>
      </div>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-ink-500">
        Tous les textes et photos de la page. Un texte laissé tel quel suit le texte d&apos;origine ; « Rétablir »
        revient au texte d&apos;origine. Les champs marqués « Réglages » sont partagés avec l&apos;écran Réglages.
      </p>
      <PageContentForm pageKey={key} sections={sections} />
    </div>
  );
}
