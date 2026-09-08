"use client";

import { useActionState, useState } from "react";
import type { MenuWithRelations } from "@/lib/services/menu.service";
import { saveMenuAction, type MenuActionState } from "@/app/(admin)/admin/(dashboard)/menus/actions";

type PriceKind = "FORMULA" | "WINE_PAIRING";
interface PriceRow {
  kind: PriceKind;
  label: string;
  labelEn: string;
  priceEuros: string;
}
interface DishRow {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
}
interface SectionRow {
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  dishes: DishRow[];
}

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";
const label = "mb-1 block text-xs font-medium text-ink-600";

export function MenuForm({ menu }: { menu: MenuWithRelations | null }) {
  const [state, formAction, pending] = useActionState<MenuActionState, FormData>(
    saveMenuAction.bind(null, menu?.id ?? null),
    {}
  );

  const [name, setName] = useState(menu?.name ?? "");
  const [nameEn, setNameEn] = useState(menu?.nameEn ?? "");
  const [description, setDescription] = useState(menu?.description ?? "");
  const [descriptionEn, setDescriptionEn] = useState(menu?.descriptionEn ?? "");
  const [availabilityNote, setAvailabilityNote] = useState(menu?.availabilityNote ?? "");
  const [availabilityNoteEn, setAvailabilityNoteEn] = useState(menu?.availabilityNoteEn ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(menu?.status ?? "DRAFT");
  const [order, setOrder] = useState(String(menu?.order ?? 0));

  const [prices, setPrices] = useState<PriceRow[]>(
    menu?.prices.map((p) => ({
      kind: p.kind,
      label: p.label,
      labelEn: p.labelEn ?? "",
      priceEuros: (p.priceCents / 100).toString(),
    })) ?? []
  );
  const [sections, setSections] = useState<SectionRow[]>(
    menu?.sections.map((s) => ({
      title: s.title,
      titleEn: s.titleEn ?? "",
      subtitle: s.subtitle ?? "",
      subtitleEn: s.subtitleEn ?? "",
      dishes: s.dishes.map((d) => ({
        name: d.name,
        nameEn: d.nameEn ?? "",
        description: d.description ?? "",
        descriptionEn: d.descriptionEn ?? "",
      })),
    })) ?? []
  );

  function buildPayload() {
    return JSON.stringify({
      name,
      nameEn,
      description,
      descriptionEn,
      availabilityNote,
      availabilityNoteEn,
      status,
      order: Number(order) || 0,
      prices: prices.map((p) => ({
        kind: p.kind,
        label: p.label,
        labelEn: p.labelEn,
        priceCents: Math.round((Number(p.priceEuros) || 0) * 100),
      })),
      sections: sections.map((s) => ({
        title: s.title,
        titleEn: s.titleEn,
        subtitle: s.subtitle,
        subtitleEn: s.subtitleEn,
        dishes: s.dishes,
      })),
    });
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <input type="hidden" name="payload" value={buildPayload()} />

      <section className="space-y-4 rounded-lg border border-ink-900/10 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Nom du menu (FR)</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={label}>Nom du menu (EN)</label>
            <input className={input} value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div>
            <label className={label}>Disponibilité (FR)</label>
            <input className={input} value={availabilityNote} onChange={(e) => setAvailabilityNote(e.target.value)} />
          </div>
          <div>
            <label className={label}>Disponibilité (EN)</label>
            <input className={input} value={availabilityNoteEn} onChange={(e) => setAvailabilityNoteEn(e.target.value)} />
          </div>
          <div>
            <label className={label}>Description (FR)</label>
            <textarea className={input} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className={label}>Description (EN)</label>
            <textarea className={input} rows={2} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
          </div>
          <div>
            <label className={label}>Statut</label>
            <select className={input} value={status} onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
          </div>
          <div>
            <label className={label}>Ordre d&apos;affichage</label>
            <input type="number" className={input} value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-ink-800">Prix (formules & accords mets-vins)</h2>
          <button
            type="button"
            className="text-sm text-wine-700 hover:underline"
            onClick={() => setPrices((p) => [...p, { kind: "FORMULA", label: "", labelEn: "", priceEuros: "" }])}
          >
            + Ajouter une ligne
          </button>
        </div>
        <div className="space-y-2">
          {prices.map((price, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[130px_1fr_1fr_90px_auto]">
              <select
                className={input}
                value={price.kind}
                onChange={(e) => setPrices((p) => p.map((x, j) => (j === i ? { ...x, kind: e.target.value as PriceKind } : x)))}
              >
                <option value="FORMULA">Formule</option>
                <option value="WINE_PAIRING">Accord vins</option>
              </select>
              <input
                className={input}
                placeholder="Libellé FR"
                value={price.label}
                onChange={(e) => setPrices((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              <input
                className={input}
                placeholder="Libellé EN"
                value={price.labelEn}
                onChange={(e) => setPrices((p) => p.map((x, j) => (j === i ? { ...x, labelEn: e.target.value } : x)))}
              />
              <input
                className={input}
                type="number"
                placeholder="€"
                value={price.priceEuros}
                onChange={(e) => setPrices((p) => p.map((x, j) => (j === i ? { ...x, priceEuros: e.target.value } : x)))}
              />
              <button type="button" className="text-sm text-red-600" onClick={() => setPrices((p) => p.filter((_, j) => j !== i))}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-ink-800">Sections & plats</h2>
          <button
            type="button"
            className="text-sm text-wine-700 hover:underline"
            onClick={() =>
              setSections((s) => [...s, { title: "", titleEn: "", subtitle: "", subtitleEn: "", dishes: [] }])
            }
          >
            + Ajouter une section
          </button>
        </div>
        <div className="space-y-5">
          {sections.map((section, si) => (
            <div key={si} className="rounded-md border border-ink-100 bg-cream-100 p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={input}
                  placeholder="Titre section FR"
                  value={section.title}
                  onChange={(e) => setSections((s) => s.map((x, j) => (j === si ? { ...x, title: e.target.value } : x)))}
                />
                <input
                  className={input}
                  placeholder="Titre section EN"
                  value={section.titleEn}
                  onChange={(e) => setSections((s) => s.map((x, j) => (j === si ? { ...x, titleEn: e.target.value } : x)))}
                />
                <input
                  className={input}
                  placeholder="Sous-titre FR"
                  value={section.subtitle}
                  onChange={(e) => setSections((s) => s.map((x, j) => (j === si ? { ...x, subtitle: e.target.value } : x)))}
                />
                <input
                  className={input}
                  placeholder="Sous-titre EN"
                  value={section.subtitleEn}
                  onChange={(e) => setSections((s) => s.map((x, j) => (j === si ? { ...x, subtitleEn: e.target.value } : x)))}
                />
              </div>

              <div className="mt-3 space-y-2">
                {section.dishes.map((dish, di) => (
                  <div key={di} className="grid gap-2 rounded border border-ink-100 bg-white p-2 sm:grid-cols-2">
                    <input
                      className={input}
                      placeholder="Plat FR"
                      value={dish.name}
                      onChange={(e) =>
                        setSections((s) =>
                          s.map((x, j) =>
                            j === si
                              ? { ...x, dishes: x.dishes.map((d, k) => (k === di ? { ...d, name: e.target.value } : d)) }
                              : x
                          )
                        )
                      }
                    />
                    <input
                      className={input}
                      placeholder="Plat EN"
                      value={dish.nameEn}
                      onChange={(e) =>
                        setSections((s) =>
                          s.map((x, j) =>
                            j === si
                              ? { ...x, dishes: x.dishes.map((d, k) => (k === di ? { ...d, nameEn: e.target.value } : d)) }
                              : x
                          )
                        )
                      }
                    />
                    <textarea
                      className={input}
                      rows={2}
                      placeholder="Description FR"
                      value={dish.description}
                      onChange={(e) =>
                        setSections((s) =>
                          s.map((x, j) =>
                            j === si
                              ? { ...x, dishes: x.dishes.map((d, k) => (k === di ? { ...d, description: e.target.value } : d)) }
                              : x
                          )
                        )
                      }
                    />
                    <textarea
                      className={input}
                      rows={2}
                      placeholder="Description EN"
                      value={dish.descriptionEn}
                      onChange={(e) =>
                        setSections((s) =>
                          s.map((x, j) =>
                            j === si
                              ? { ...x, dishes: x.dishes.map((d, k) => (k === di ? { ...d, descriptionEn: e.target.value } : d)) }
                              : x
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      className="justify-self-start text-xs text-red-600"
                      onClick={() =>
                        setSections((s) =>
                          s.map((x, j) => (j === si ? { ...x, dishes: x.dishes.filter((_, k) => k !== di) } : x))
                        )
                      }
                    >
                      Retirer le plat
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm text-wine-700 hover:underline"
                  onClick={() =>
                    setSections((s) =>
                      s.map((x, j) =>
                        j === si
                          ? { ...x, dishes: [...x.dishes, { name: "", nameEn: "", description: "", descriptionEn: "" }] }
                          : x
                      )
                    )
                  }
                >
                  + Ajouter un plat
                </button>
              </div>

              <button
                type="button"
                className="mt-3 text-xs text-red-600"
                onClick={() => setSections((s) => s.filter((_, j) => j !== si))}
              >
                Supprimer la section
              </button>
            </div>
          ))}
        </div>
      </section>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-cta">
        {pending ? "Enregistrement…" : "Enregistrer le menu"}
      </button>
    </form>
  );
}
