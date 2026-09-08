"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { Announcement } from "@/lib/services/announcement.service";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import {
  saveAnnouncementAction,
  type AnnouncementActionState,
} from "@/app/(admin)/admin/(dashboard)/annonce/actions";

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";
const label = "mb-1 block text-xs font-medium text-ink-600";

/** yyyy-MM-ddThh:mm pour <input type="datetime-local">. */
function toLocalInput(d: Date | null) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AnnouncementForm({ announcement }: { announcement: Announcement }) {
  const a = announcement;
  const [state, formAction, pending] = useActionState<AnnouncementActionState, FormData>(
    saveAnnouncementAction,
    {}
  );

  const [enabled, setEnabled] = useState(a.enabled);
  const [startsAt, setStartsAt] = useState(toLocalInput(a.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(a.endsAt));
  const [content, setContent] = useState(a.content);
  const [contentEn, setContentEn] = useState(a.contentEn ?? "");
  const [buttonLabel, setButtonLabel] = useState(a.buttonLabel ?? "");
  const [buttonLabelEn, setButtonLabelEn] = useState(a.buttonLabelEn ?? "");
  const [buttonUrl, setButtonUrl] = useState(a.buttonUrl ?? "");
  const [dismissDays, setDismissDays] = useState(String(a.dismissDays));
  const [img, setImg] = useState<{ id: string; url: string } | null>(
    a.image ? { id: a.image.id, url: a.image.url } : null
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  function pick(media: PickedMedia[]) {
    const first = media[0];
    if (first) setImg({ id: first.id, url: first.url });
    setPickerOpen(false);
  }

  const payload = () =>
    JSON.stringify({
      enabled,
      startsAt,
      endsAt,
      imageId: img?.id ?? null,
      content,
      contentEn,
      buttonLabel,
      buttonLabelEn,
      buttonUrl,
      dismissDays: Number(dismissDays) || 0,
    });

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="payload" value={payload()} />

      <label className="flex items-center gap-2.5 rounded-lg border border-ink-900/10 bg-white p-4 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Afficher le pop-up d&apos;accueil
      </label>

      <section className="grid gap-4 rounded-lg border border-ink-900/10 bg-white p-5 sm:grid-cols-3">
        <div>
          <label className={label}>Du (facultatif)</label>
          <input type="datetime-local" className={input} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div>
          <label className={label}>Au (facultatif)</label>
          <input type="datetime-local" className={input} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
        <div>
          <label className={label}>Ne plus afficher pendant (jours)</label>
          <input type="number" min={0} max={365} className={input} value={dismissDays} onChange={(e) => setDismissDays(e.target.value)} />
        </div>
      </section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <label className={label}>Image (facultative)</label>
        <div className="flex items-center gap-3">
          {img ? (
            <span className="relative h-16 w-24 overflow-hidden rounded border border-ink-100">
              <Image src={img.url} alt="" fill className="object-cover" sizes="96px" />
            </span>
          ) : null}
          <button type="button" onClick={() => setPickerOpen(true)} className="rounded border border-ink-200 px-3 py-1 text-xs">
            Choisir
          </button>
          {img ? (
            <button type="button" onClick={() => setImg(null)} className="text-xs text-red-600">
              Retirer
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <label className={label}>Contenu (FR) — gras, italique, taille (H1/H2/H3), alignement…</label>
        <RichTextEditor value={content} onChange={setContent} placeholder="Ex. Fermeture exceptionnelle du 24 au 26 décembre." />
        <label className={`${label} mt-4`}>Contenu (EN)</label>
        <RichTextEditor value={contentEn} onChange={setContentEn} />
      </section>

      <section className="grid gap-4 rounded-lg border border-ink-900/10 bg-white p-5 sm:grid-cols-3">
        <div>
          <label className={label}>Bouton — texte (FR)</label>
          <input className={input} value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} />
        </div>
        <div>
          <label className={label}>Bouton — texte (EN)</label>
          <input className={input} value={buttonLabelEn} onChange={(e) => setButtonLabelEn(e.target.value)} />
        </div>
        <div>
          <label className={label}>Bouton — lien</label>
          <input className={input} value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="/reservation" />
        </div>
      </section>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={pick} />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-cta">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {state.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
        {state.success ? <span className="text-sm text-green-700">Annonce enregistrée.</span> : null}
      </div>
    </form>
  );
}
