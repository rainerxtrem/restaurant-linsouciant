"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { purchaseVoucherAction, type GiftVoucherPurchaseState } from "@/app/(site)/[locale]/bons-cadeaux/actions";

const PRESETS = [50, 75, 100, 150];

const field =
  "w-full border-0 border-b border-ink-900/20 bg-transparent px-0 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-wine-700 focus:outline-none focus:ring-0";
const label = "block text-[11px] uppercase tracking-[0.15em] text-ink-500";

export function GiftVoucherForm() {
  const t = useTranslations("giftVouchers");
  const [state, formAction, pending] = useActionState<GiftVoucherPurchaseState, FormData>(
    purchaseVoucherAction,
    {}
  );
  const [amount, setAmount] = useState(75);
  const [isGift, setIsGift] = useState(false);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <form action={formAction} className="space-y-9">
      <fieldset>
        <legend className={label}>{t("amount")}</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setAmount(p)}
              className={`h-11 w-16 border text-sm transition-colors ${
                amount === p
                  ? "border-wine-700 bg-wine-700 text-cream-50"
                  : "border-ink-900/20 text-ink-700 hover:border-wine-600"
              }`}
            >
              {p} €
            </button>
          ))}
          <input
            type="number"
            min={10}
            max={500}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-label={t("amount")}
            className="h-11 w-20 border border-ink-900/20 bg-transparent px-3 text-sm focus:border-wine-700 focus:outline-none"
          />
        </div>
        <input type="hidden" name="amount" value={amount} />
        {err("amount") ? <p className="mt-1 text-xs text-red-600">{err("amount")}</p> : null}
      </fieldset>

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
        disabled={pending}
        className="w-full bg-wine-700 px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-wine-800 disabled:opacity-60"
      >
        {pending ? t("paying") : t("pay")}
      </button>
      <p className="text-xs leading-relaxed text-ink-400">{t("validity")}</p>
    </form>
  );
}
