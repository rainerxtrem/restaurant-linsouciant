"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ThemePageWithProducts } from "@/lib/services/theme-page.service";
import { parseProductPrices } from "@/lib/validation/theme-page";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import {
  saveThemePageAction,
  type ThemePageActionState,
} from "@/app/(admin)/admin/(dashboard)/pages-thematiques/actions";

type Img = { id: string; url: string } | null;
interface PriceRow {
  label: string;
  labelEn: string;
  priceEuros: string;
}
interface ProductRow {
  key: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: Img;
  prices: PriceRow[];
}

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";
const label = "mb-1 block text-xs font-medium text-ink-600";

let keySeq = 0;
const newKey = () => `p${++keySeq}`;

function ImagePick({ media, onPick, onClear, size = 72 }: { media: Img; onPick: () => void; onClear: () => void; size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="relative block shrink-0 overflow-hidden rounded border border-ink-100 bg-cream-100"
        style={{ width: size, height: size }}
      >
        {media ? <Image src={media.url} alt="" fill className="object-cover" sizes={`${size}px`} /> : null}
      </span>
      <div className="flex flex-col items-start gap-1">
        <button type="button" onClick={onPick} className="rounded border border-ink-200 px-3 py-1 text-xs">
          {media ? "Changer la photo" : "Choisir une photo"}
        </button>
        {media ? (
          <button type="button" onClick={onClear} className="text-xs text-red-600">
            Retirer
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ThemePageForm({ page }: { page: ThemePageWithProducts | null }) {
  const [state, formAction, pending] = useActionState<ThemePageActionState, FormData>(
    saveThemePageAction.bind(null, page?.id ?? null),
    {}
  );

  const [f, setF] = useState({
    title: page?.title ?? "",
    titleEn: page?.titleEn ?? "",
    slug: page?.slug ?? "",
    navLabel: page?.navLabel ?? "",
    navLabelEn: page?.navLabelEn ?? "",
    intro: page?.intro ?? "",
    introEn: page?.introEn ?? "",
    orderInfo: page?.orderInfo ?? "",
    orderInfoEn: page?.orderInfoEn ?? "",
    order: String(page?.order ?? 0),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const [enabled, setEnabled] = useState(page?.enabled ?? false);
  const [hero, setHero] = useState<Img>(page?.heroImage ? { id: page.heroImage.id, url: page.heroImage.url } : null);
  const [products, setProducts] = useState<ProductRow[]>(
    page?.products.map((p) => ({
      key: newKey(),
      name: p.name,
      nameEn: p.nameEn ?? "",
      description: p.description ?? "",
      descriptionEn: p.descriptionEn ?? "",
      image: p.image ? { id: p.image.id, url: p.image.url } : null,
      prices: parseProductPrices(p.prices).map((x) => ({
        label: x.label,
        labelEn: x.labelEn ?? "",
        priceEuros: (x.priceCents / 100).toString(),
      })),
    })) ?? []
  );

  // "hero" ou index du produit dont on choisit la photo.
  const [picker, setPicker] = useState<null | "hero" | number>(null);

  function handlePick(media: PickedMedia[]) {
    const first = media[0];
    if (picker === null || !first) return;
    const img = { id: first.id, url: first.url };
    if (picker === "hero") setHero(img);
    else setProducts((ps) => ps.map((p, i) => (i === picker ? { ...p, image: img } : p)));
    setPicker(null);
  }

  const updateProduct = (i: number, patch: Partial<ProductRow>) =>
    setProducts((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const updatePrice = (i: number, k: number, patch: Partial<PriceRow>) =>
    setProducts((ps) =>
      ps.map((p, j) => (j === i ? { ...p, prices: p.prices.map((x, l) => (l === k ? { ...x, ...patch } : x)) } : p))
    );
  const move = (i: number, dir: -1 | 1) =>
    setProducts((ps) => {
      const j = i + dir;
      if (j < 0 || j >= ps.length) return ps;
      const next = [...ps];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  function payload() {
    return JSON.stringify({
      ...f,
      order: Number(f.order) || 0,
      enabled,
      heroImageId: hero?.id ?? null,
      products: products.map((p) => ({
        name: p.name,
        nameEn: p.nameEn,
        description: p.description,
        descriptionEn: p.descriptionEn,
        imageId: p.image?.id ?? null,
        prices: p.prices.map((x) => ({
          label: x.label,
          labelEn: x.labelEn,
          priceCents: Math.round((Number(x.priceEuros.replace(",", ".")) || 0) * 100),
        })),
      })),
    });
  }

  return (
    <form action={formAction} className="max-w-4xl space-y-8">
      <input type="hidden" name="payload" value={payload()} />

      <section className="space-y-4 rounded-lg border border-ink-900/10 bg-white p-5">
        <label className="flex items-center gap-3 text-sm font-medium text-ink-800">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Page activée (visible sur le site et dans le menu)
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Titre (FR) — ex. « Noël à emporter »</label>
            <input className={input} value={f.title} onChange={set("title")} required />
          </div>
          <div>
            <label className={label}>Titre (EN)</label>
            <input className={input} value={f.titleEn} onChange={set("titleEn")} />
          </div>
          <div>
            <label className={label}>Libellé dans le menu du site (FR) — facultatif</label>
            <input className={input} value={f.navLabel} onChange={set("navLabel")} placeholder="Par défaut : le titre" />
          </div>
          <div>
            <label className={label}>Libellé dans le menu du site (EN)</label>
            <input className={input} value={f.navLabelEn} onChange={set("navLabelEn")} />
          </div>
          <div>
            <label className={label}>Adresse de la page</label>
            <div className="flex items-center gap-1 text-sm text-ink-500">
              <span>/</span>
              <input className={input} value={f.slug} onChange={set("slug")} placeholder="noel (générée depuis le titre si vide)" />
            </div>
          </div>
          <div>
            <label className={label}>Ordre dans le menu</label>
            <input type="number" className={input} value={f.order} onChange={set("order")} />
          </div>
          <div>
            <label className={label}>Présentation (FR)</label>
            <textarea className={input} rows={4} value={f.intro} onChange={set("intro")} />
          </div>
          <div>
            <label className={label}>Présentation (EN)</label>
            <textarea className={input} rows={4} value={f.introEn} onChange={set("introEn")} />
          </div>
          <div>
            <label className={label}>Comment commander (FR) — dates limites, retrait…</label>
            <textarea
              className={input}
              rows={4}
              value={f.orderInfo}
              onChange={set("orderInfo")}
              placeholder={"Commandes jusqu'au 20 décembre.\nRetrait au restaurant le 24 décembre, de 10 h à 16 h."}
            />
          </div>
          <div>
            <label className={label}>Comment commander (EN)</label>
            <textarea className={input} rows={4} value={f.orderInfoEn} onChange={set("orderInfoEn")} />
          </div>
        </div>
        <div>
          <span className={label}>Photo du bandeau</span>
          <ImagePick media={hero} onPick={() => setPicker("hero")} onClear={() => setHero(null)} size={96} />
        </div>
      </section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-medium text-ink-800">Produits (encadrés)</h2>
          <button
            type="button"
            className="text-sm text-wine-700 hover:underline"
            onClick={() =>
              setProducts((ps) => [
                ...ps,
                {
                  key: newKey(),
                  name: "",
                  nameEn: "",
                  description: "",
                  descriptionEn: "",
                  image: null,
                  prices: [{ label: "", labelEn: "", priceEuros: "" }],
                },
              ])
            }
          >
            + Ajouter un produit
          </button>
        </div>
        <p className="mb-4 text-xs text-ink-500">
          Ex. « Foie gras de canard mi-cuit » avec sa photo et ses tarifs (« La tranche de 80 g » 12 €,
          « Le lobe de 500 g » 65 €). Le menu de Noël se crée dans « Cartes &amp; menus » puis se
          rattache à cette page.
        </p>

        <div className="space-y-4">
          {products.map((p, i) => (
            <div key={p.key} className="rounded-md border border-ink-100 bg-cream-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-500">Produit {i + 1}</span>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)} className="text-ink-500 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre"
                    disabled={i === products.length - 1}
                    onClick={() => move(i, 1)}
                    className="text-ink-500 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="ml-2 text-xs text-red-600"
                    onClick={() => setProducts((ps) => ps.filter((_, j) => j !== i))}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                <ImagePick
                  media={p.image}
                  onPick={() => setPicker(i)}
                  onClear={() => updateProduct(i, { image: null })}
                  size={112}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className={input} placeholder="Nom FR (ex. Foie gras mi-cuit)" value={p.name} onChange={(e) => updateProduct(i, { name: e.target.value })} />
                  <input className={input} placeholder="Nom EN" value={p.nameEn} onChange={(e) => updateProduct(i, { nameEn: e.target.value })} />
                  <textarea className={input} rows={3} placeholder="Description FR" value={p.description} onChange={(e) => updateProduct(i, { description: e.target.value })} />
                  <textarea className={input} rows={3} placeholder="Description EN" value={p.descriptionEn} onChange={(e) => updateProduct(i, { descriptionEn: e.target.value })} />
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <span className={label}>Tarifs</span>
                {p.prices.map((x, k) => (
                  <div key={k} className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
                    <input className={input} placeholder="Format FR (ex. Le lobe de 500 g)" value={x.label} onChange={(e) => updatePrice(i, k, { label: e.target.value })} />
                    <input className={input} placeholder="Format EN" value={x.labelEn} onChange={(e) => updatePrice(i, k, { labelEn: e.target.value })} />
                    <input className={input} inputMode="decimal" placeholder="€" value={x.priceEuros} onChange={(e) => updatePrice(i, k, { priceEuros: e.target.value })} />
                    <button
                      type="button"
                      className="text-sm text-red-600"
                      onClick={() => updateProduct(i, { prices: p.prices.filter((_, l) => l !== k) })}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm text-wine-700 hover:underline"
                  onClick={() => updateProduct(i, { prices: [...p.prices, { label: "", labelEn: "", priceEuros: "" }] })}
                >
                  + Ajouter un tarif
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 ? <p className="text-sm text-ink-400">Aucun produit pour l&apos;instant.</p> : null}
        </div>
      </section>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-cta">
        {pending ? "Enregistrement…" : "Enregistrer la page"}
      </button>

      <MediaPicker open={picker !== null} onClose={() => setPicker(null)} onSelect={handlePick} />
    </form>
  );
}
