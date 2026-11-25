"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import {
  savePageContentAction,
  type PageContentState,
} from "@/app/(admin)/admin/(dashboard)/pages/site/actions";

type Img = { id: string; url: string } | null;

export type FormField =
  | {
      kind: "text";
      key: string;
      label: string;
      hint: string | null;
      multiline: boolean;
      bilingual: boolean;
      fromSettings: boolean;
      value: { fr: string; en: string };
      defaults: { fr: string; en: string } | null;
    }
  | { kind: "image"; key: string; label: string; hint: string | null; current: Img }
  | { kind: "link"; key: string; label: string; hint: string | null; href: string };

export interface FormSection {
  title: string;
  fields: FormField[];
}

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";

/** Formulaire d'édition de tout le contenu d'une page du site. */
export function PageContentForm({ pageKey, sections }: { pageKey: string; sections: FormSection[] }) {
  const [state, formAction, pending] = useActionState<PageContentState, FormData>(
    savePageContentAction.bind(null, pageKey),
    {}
  );

  const allFields = sections.flatMap((s) => s.fields);
  const [texts, setTexts] = useState<Record<string, { fr: string; en: string }>>(
    Object.fromEntries(allFields.filter((f) => f.kind === "text").map((f) => [f.key, { ...(f as { value: { fr: string; en: string } }).value }]))
  );
  const [images, setImages] = useState<Record<string, Img>>(
    Object.fromEntries(allFields.filter((f) => f.kind === "image").map((f) => [f.key, (f as { current: Img }).current]))
  );
  const [picker, setPicker] = useState<string | null>(null);

  const setText = (key: string, lang: "fr" | "en", value: string) =>
    setTexts((prev) => ({ ...prev, [key]: { ...prev[key]!, [lang]: value } }));

  function handlePick(media: PickedMedia[]) {
    const first = media[0];
    if (!picker || !first) return;
    setImages((prev) => ({ ...prev, [picker]: { id: first.id, url: first.url } }));
    setPicker(null);
  }

  const payload = JSON.stringify({
    texts,
    images: Object.fromEntries(Object.entries(images).map(([k, v]) => [k, v?.id ?? null])),
  });

  return (
    <form action={formAction} className="max-w-4xl space-y-6 pb-24">
      <input type="hidden" name="payload" value={payload} />

      {sections.map((section) => (
        <section key={section.title} className="rounded-lg border border-ink-900/10 bg-white p-5">
          <h2 className="mb-4 font-medium text-ink-800">{section.title}</h2>
          <div className="space-y-5">
            {section.fields.map((field) => {
              if (field.kind === "link") {
                return (
                  <div key={field.key} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-cream-100 px-4 py-3 text-sm">
                    <div>
                      <p className="text-ink-700">{field.label}</p>
                      {field.hint ? <p className="text-xs text-ink-500">{field.hint}</p> : null}
                    </div>
                    <Link href={field.href} className="flex items-center gap-1 text-wine-700 hover:underline">
                      Modifier <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                );
              }

              if (field.kind === "image") {
                const img = images[field.key] ?? null;
                return (
                  <div key={field.key}>
                    <span className="mb-1 block text-xs font-medium text-ink-600">{field.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="relative block h-24 w-32 shrink-0 overflow-hidden rounded border border-ink-100 bg-cream-100">
                        {img ? <Image src={img.url} alt="" fill className="object-cover" sizes="128px" /> : null}
                      </span>
                      <div className="flex flex-col items-start gap-1">
                        <button type="button" onClick={() => setPicker(field.key)} className="rounded border border-ink-200 px-3 py-1 text-xs">
                          {img ? "Changer la photo" : "Choisir une photo"}
                        </button>
                        {img ? (
                          <button
                            type="button"
                            onClick={() => setImages((p) => ({ ...p, [field.key]: null }))}
                            className="text-xs text-red-600"
                          >
                            Retirer
                          </button>
                        ) : null}
                        {field.hint ? <p className="max-w-xs text-xs text-ink-400">{field.hint}</p> : null}
                      </div>
                    </div>
                  </div>
                );
              }

              const value = texts[field.key]!;
              const isDefault =
                field.defaults !== null && value.fr === field.defaults.fr && value.en === field.defaults.en;
              const Control = field.multiline ? "textarea" : "input";
              return (
                <div key={field.key}>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-ink-600">{field.label}</span>
                    {field.fromSettings ? (
                      <span className="rounded bg-cream-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">Réglages</span>
                    ) : null}
                    {field.defaults && !isDefault ? (
                      <button
                        type="button"
                        onClick={() => setTexts((prev) => ({ ...prev, [field.key]: { ...field.defaults! } }))}
                        className="ml-auto flex items-center gap-1 text-xs text-ink-500 hover:text-wine-700"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden />
                        Rétablir
                      </button>
                    ) : null}
                  </div>
                  <div className={field.bilingual ? "grid gap-2 sm:grid-cols-2" : ""}>
                    <Control
                      className={input}
                      rows={field.multiline ? 4 : undefined}
                      value={value.fr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setText(field.key, "fr", e.target.value)}
                      placeholder={field.bilingual ? "Français" : undefined}
                      aria-label={`${field.label} (FR)`}
                    />
                    {field.bilingual ? (
                      <Control
                        className={input}
                        rows={field.multiline ? 4 : undefined}
                        value={value.en}
                        onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setText(field.key, "en", e.target.value)}
                        placeholder="English"
                        aria-label={`${field.label} (EN)`}
                      />
                    ) : null}
                  </div>
                  {field.hint ? <p className="mt-1 text-xs text-ink-400">{field.hint}</p> : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-1 flex items-center gap-4 border-t border-ink-900/10 bg-cream-100/95 px-1 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn-cta">
          {pending ? "Enregistrement…" : "Enregistrer la page"}
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-green-700">Page enregistrée.</p> : null}
      </div>

      <MediaPicker open={picker !== null} onClose={() => setPicker(null)} onSelect={handlePick} />
    </form>
  );
}
