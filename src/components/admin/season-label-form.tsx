"use client";

import { useActionState, useState } from "react";
import { saveSeasonLabelAction, type SeasonLabelState } from "@/app/(admin)/admin/(dashboard)/menus/actions";
import { seasonLabelFor } from "@/lib/validation/house";

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";

/** Libellé daté de la carte, affiché sur la page publique Cartes & Menus. */
export function SeasonLabelForm({ label, labelEn }: { label: string; labelEn: string }) {
  const [state, formAction, pending] = useActionState<SeasonLabelState, FormData>(saveSeasonLabelAction, {});
  const [fr, setFr] = useState(label);
  const [en, setEn] = useState(labelEn);

  return (
    <form action={formAction} className="mt-6 rounded-lg border border-ink-900/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium text-ink-800">Carte du moment</h2>
        <button
          type="button"
          className="text-xs text-wine-700 hover:underline"
          onClick={() => {
            const now = new Date();
            setFr(seasonLabelFor(now, "fr"));
            setEn(seasonLabelFor(now, "en"));
          }}
        >
          Proposer d&apos;après la date du jour
        </button>
      </div>
      <p className="mt-1 text-xs text-ink-500">
        Affiché sous le titre de la page Cartes &amp; Menus. Laisser vide pour ne rien afficher.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input name="label" className={input} value={fr} onChange={(e) => setFr(e.target.value)} placeholder="Carte d'automne · novembre 2026" />
        <input name="labelEn" className={input} value={en} onChange={(e) => setEn(e.target.value)} placeholder="Autumn menu · November 2026" />
      </div>
      <div className="mt-3 flex items-center gap-4">
        <button type="submit" disabled={pending} className="rounded-md bg-wine-700 px-4 py-2 text-sm text-white hover:bg-wine-800">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {state.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
        {state.success ? <span className="text-sm text-green-700">Enregistré.</span> : null}
      </div>
    </form>
  );
}
