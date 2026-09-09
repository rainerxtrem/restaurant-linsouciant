"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { purchaseVoucherAction, type GiftVoucherPurchaseState } from "@/app/(site)/[locale]/bons-cadeaux/actions";

export interface MenuOffer {
  menuName: string;
  menuNameEn: string | null;
  options: { id: string; label: string; labelEn: string | null; priceCents: number }[];
}

const PRESETS = [50, 75, 100, 150];

const field =
  "w-full border-0 border-b border-ink-900/20 bg-transparent px-0 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-wine-700 focus:outline-none focus:ring-0";
const label = "block text-[11px] uppercase tracking-[0.15em] text-ink-500";

function splitLabel(s: string) {
  const m = s.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  return m ? { main: m[1]!.trim(), detail: m[2]!.trim() } : { main: s, detail: null };
}

export function GiftVoucherForm({ offers, locale }: { offers: MenuOffer[]; locale: "fr" | "en" }) {
  const t = useTranslations("giftVouchers");
  const L = (fr: string, en: string | null) => (locale === "en" && en ? en : fr);
  const [state, formAction, pending] = useActionState<GiftVoucherPurchaseState, FormData>(
    purchaseVoucherAction,
    {}
  );

  const hasOffers = offers.length > 0;
  const [mode, setMode] = useState<"amount" | "menus">("amount");
  const [amount, setAmount] = useState(75);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [isGift, setIsGift] = useState(false);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  const setQ = (id: string, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, (q[id] ?? 0) + delta)) }));

  const { menusTotalCents, selectionLabel } = useMemo(() => {
    let cents = 0;
    const parts: string[] = [];
    for (const offer of offers) {
      for (const opt of offer.options) {
        const n = qty[opt.id] ?? 0;
        if (n > 0) {
          cents += n * opt.priceCents;
          parts.push(`${n} × ${L(offer.menuName, offer.menuNameEn)} — ${L(opt.label, opt.labelEn)}`);
        }
      }
    }
    return { menusTotalCents: cents, selectionLabel: parts.join(" · ") };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, offers, locale]);

  const finalAmount = mode === "menus" ? Math.round(menusTotalCents / 100) : amount;
  const menusEmpty = mode === "menus" && menusTotalCents === 0;

  return (
    <form action={formAction} className="space-y-9">
      {/* Choix du mode */}
      {hasOffers ? (
        <div className="grid grid-cols-2 border border-ink-900/15 text-center text-[11px] uppercase tracking-[0.12em]">
          {(["amount", "menus"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-3 transition-colors",
                mode === m ? "bg-wine-700 text-cream-50" : "text-ink-500 hover:text-ink-800"
              )}
            >
              {m === "amount" ? t("modeAmount") : t("modeMenus")}
            </button>
          ))}
        </div>
      ) : null}

      {/* Mode montant libre */}
      {mode === "amount" ? (
        <fieldset>
          <legend className={label}>{t("amount")}</legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setAmount(p)}
                className={cn(
                  "h-11 w-16 border text-sm transition-colors",
                  amount === p
                    ? "border-wine-700 bg-wine-700 text-cream-50"
                    : "border-ink-900/20 text-ink-700 hover:border-wine-600"
                )}
              >
                {p} €
              </button>
            ))}
            <input
              type="number"
              min={10}
              max={2000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-label={t("amount")}
              className="h-11 w-20 border border-ink-900/20 bg-transparent px-3 text-sm focus:border-wine-700 focus:outline-none"
            />
          </div>
          {err("amount") ? <p className="mt-1 text-xs text-red-600">{err("amount")}</p> : null}
        </fieldset>
      ) : (
        /* Mode menus */
        <div>
          <p className="text-xs leading-relaxed text-ink-500">{t("menusHint")}</p>
          <div className="mt-5 space-y-7">
            {offers.map((offer) => (
              <div key={offer.menuName}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold-600">
                  {L(offer.menuName, offer.menuNameEn)}
                </p>
                <ul className="mt-3 divide-y divide-ink-900/8">
                  {offer.options.map((opt) => {
                    const { main, detail } = splitLabel(L(opt.label, opt.labelEn));
                    const n = qty[opt.id] ?? 0;
                    return (
                      <li key={opt.id} className="flex items-center justify-between gap-4 py-3">
                        <span className="min-w-0">
                          <span className="text-sm text-ink-800">{main}</span>
                          {detail ? (
                            <span className="block text-xs text-ink-400">{detail}</span>
                          ) : null}
                          <span className="mt-0.5 block font-display text-sm text-wine-700">
                            {(opt.priceCents / 100).toLocaleString("fr-FR")} €
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center border border-ink-900/20">
                          <button
                            type="button"
                            onClick={() => setQ(opt.id, -1)}
                            className="h-9 w-9 text-ink-500 hover:text-ink-900"
                            aria-label="−"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{n}</span>
                          <button
                            type="button"
                            onClick={() => setQ(opt.id, 1)}
                            className="h-9 w-9 text-ink-500 hover:text-ink-900"
                            aria-label="+"
                          >
                            +
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-baseline justify-between border-t border-ink-900/15 pt-4">
            <span className={label}>{t("voucherTotal")}</span>
            <span className="font-display text-2xl text-wine-700">
              {(menusTotalCents / 100).toLocaleString("fr-FR")} €
            </span>
          </div>
          {menusEmpty ? <p className="mt-1 text-xs text-ink-400">{t("emptySelection")}</p> : null}
        </div>
      )}

      <input type="hidden" name="amount" value={finalAmount} />
      <input
        type="hidden"
        name="selectionLabel"
        value={mode === "menus" ? selectionLabel : ""}
      />

      {/* Coordonnées acheteur */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{t("buyerName")}</span>
          <input name="buyerName" required className={field} />
          {err("buyerName") ? <span className="mt-1 block text-xs text-red-600">{err("buyerName")}</span> : null}
        </label>
        <label className="block">
          <span className={label}>{t("buyerEmail")}</span>
          <input type="email" name="buyerEmail" required className={field} />
          {err("buyerEmail") ? <span className="mt-1 block text-xs text-red-600">{err("buyerEmail")}</span> : null}
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink-700">
        <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
        {t("isGift")}
      </label>

      {isGift ? (
        <div className="space-y-6 border-l border-gold-300/60 pl-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t("recipientName")}</span>
              <input name="recipientName" className={field} />
            </label>
            <label className="block">
              <span className={label}>{t("recipientEmail")}</span>
              <input type="email" name="recipientEmail" className={field} />
            </label>
          </div>
          <label className="block">
            <span className={label}>{t("personalMessage")}</span>
            <textarea name="message" rows={2} className={field} />
          </label>
        </div>
      ) : null}

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending || menusEmpty}
        className="w-full bg-wine-700 px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-wine-800 disabled:opacity-60"
      >
        {pending ? t("paying") : `${t("pay")}${finalAmount > 0 ? ` — ${finalAmount} €` : ""}`}
      </button>
      <p className="text-xs leading-relaxed text-ink-400">{t("validity")}</p>
    </form>
  );
}
