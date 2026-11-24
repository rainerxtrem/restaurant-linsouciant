"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";

/**
 * Éditeur générique d'une liste ordonnée (producteurs, distinctions…) :
 * champs texte configurables + une photo par élément, réordonnancement,
 * enregistrement de toute la liste d'un coup via une server action.
 */

export interface ListField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url";
  placeholder?: string;
  required?: boolean;
  /** Occupe toute la largeur de la grille. */
  full?: boolean;
}

type Img = { id: string; url: string } | null;
interface Row {
  key: string;
  values: Record<string, string>;
  image: Img;
}

export type ListActionState = { error?: string; success?: boolean };

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";
const labelCls = "mb-1 block text-xs font-medium text-ink-600";

let seq = 0;
const newKey = () => `r${++seq}`;

export function ListEditor({
  action,
  fields,
  initial,
  itemLabel,
  imageLabel,
  addLabel,
  emptyText,
}: {
  action: (prev: ListActionState, formData: FormData) => Promise<ListActionState>;
  fields: ListField[];
  initial: { values: Record<string, string>; image: Img }[];
  itemLabel: string;
  imageLabel: string;
  addLabel: string;
  emptyText: string;
}) {
  const [state, formAction, pending] = useActionState<ListActionState, FormData>(action, {});
  const [rows, setRows] = useState<Row[]>(initial.map((r) => ({ key: newKey(), ...r })));
  const [picker, setPicker] = useState<number | null>(null);

  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));
  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setValue = (i: number, key: string, value: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, values: { ...r.values, [key]: value } } : r)));
  const move = (i: number, dir: -1 | 1) =>
    setRows((rs) => {
      const j = i + dir;
      if (j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  function handlePick(media: PickedMedia[]) {
    const first = media[0];
    if (picker === null || !first) return;
    update(picker, { image: { id: first.id, url: first.url } });
    setPicker(null);
  }

  const payload = JSON.stringify(rows.map((r) => ({ ...r.values, imageId: r.image?.id ?? null })));

  return (
    <form action={formAction} className="max-w-4xl space-y-4">
      <input type="hidden" name="payload" value={payload} />

      {rows.map((row, i) => (
        <div key={row.key} className="rounded-lg border border-ink-900/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              {itemLabel} {i + 1}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)} className="text-ink-500 disabled:opacity-30">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Descendre"
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
                className="text-ink-500 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" className="ml-2 text-xs text-red-600" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
                Supprimer
              </button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[auto_1fr]">
            <div>
              <span className={labelCls}>{imageLabel}</span>
              <div className="flex items-center gap-3">
                <span className="relative block h-24 w-24 shrink-0 overflow-hidden rounded border border-ink-100 bg-cream-100">
                  {row.image ? <Image src={row.image.url} alt="" fill className="object-cover" sizes="96px" /> : null}
                </span>
                <div className="flex flex-col items-start gap-1">
                  <button type="button" onClick={() => setPicker(i)} className="rounded border border-ink-200 px-3 py-1 text-xs">
                    {row.image ? "Changer" : "Choisir"}
                  </button>
                  {row.image ? (
                    <button type="button" onClick={() => update(i, { image: null })} className="text-xs text-red-600">
                      Retirer
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "sm:col-span-2" : undefined}>
                  <label className={labelCls}>
                    {f.label}
                    {f.required ? " *" : ""}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      className={input}
                      rows={3}
                      value={row.values[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setValue(i, f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className={input}
                      type={f.type === "url" ? "url" : "text"}
                      value={row.values[f.key] ?? ""}
                      placeholder={f.placeholder}
                      required={f.required}
                      onChange={(e) => setValue(i, f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {rows.length === 0 ? <p className="text-sm text-ink-400">{emptyText}</p> : null}

      <button
        type="button"
        className="text-sm text-wine-700 hover:underline"
        onClick={() => setRows((rs) => [...rs, { key: newKey(), values: blank(), image: null }])}
      >
        + {addLabel}
      </button>

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-cta">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-green-700">Enregistré.</p> : null}
      </div>

      <MediaPicker open={picker !== null} onClose={() => setPicker(null)} onSelect={handlePick} />
    </form>
  );
}
