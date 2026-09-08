"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { purchaseVoucherAction, type GiftVoucherPurchaseState } from "@/app/(site)/[locale]/bons-cadeaux/actions";

const PRESETS = [50, 75, 100, 150];

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
    <form action={formAction} className="space-y-5">
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink-700">{t("amount")}</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setAmount(p)}
              className={`rounded-sm border px-4 py-2 text-sm transition-colors ${
                amount === p ? "border-wine-700 bg-wine-700 text-cream-50" : "border-ink-200 text-ink-700 hover:border-wine-600"
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
            className="w-24 rounded-sm border border-ink-200 px-3 py-2 text-sm"
            aria-label={t("amount")}
          />
        </div>
        <input type="hidden" name="amount" value={amount} />
        {err("amount") ? <p className="mt-1 text-xs text-red-600">{err("amount")}</p> : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">{t("buyerName")}</span>
          <input name="buyerName" required className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
          {err("buyerName") ? <span className="mt-1 block text-xs text-red-600">{err("buyerName")}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">{t("buyerEmail")}</span>
          <input type="email" name="buyerEmail" required className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
          {err("buyerEmail") ? <span className="mt-1 block text-xs text-red-600">{err("buyerEmail")}</span> : null}
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
        {t("isGift")}
      </label>

      {isGift ? (
        <div className="space-y-4 rounded-md border border-ink-100 bg-cream-100 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">{t("recipientName")}</span>
              <input name="recipientName" className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">{t("recipientEmail")}</span>
              <input type="email" name="recipientEmail" className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">{t("personalMessage")}</span>
            <textarea name="message" rows={3} className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
          </label>
        </div>
      ) : null}

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-cta w-full">
        {pending ? t("paying") : t("pay")}
      </button>
      <p className="text-xs text-ink-500">{t("validity")}</p>
    </form>
  );
}
