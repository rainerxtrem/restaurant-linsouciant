"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { subscribeNewsletterAction, type NewsletterState } from "@/app/(site)/[locale]/newsletter/actions";

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const action = subscribeNewsletterAction.bind(null, locale);
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(action, {});

  if (state.success) {
    return <p className="max-w-sm text-sm text-gold-300">{t("checkEmail")}</p>;
  }

  return (
    <form action={formAction} className="w-full max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder={t("placeholder")}
          className="w-full rounded-sm border border-cream-50/25 bg-cream-50/5 px-4 py-2.5 text-sm text-cream-50 placeholder:text-cream-100/40 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="whitespace-nowrap rounded-sm bg-gold-400 px-5 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-gold-300 disabled:opacity-60"
        >
          {pending ? t("subscribing") : t("subscribe")}
        </button>
      </div>
      <label className="mt-2 flex items-start gap-2 text-xs text-cream-100/60">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        {t("consent")}
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error ? <p className="mt-2 text-xs text-wine-300">{state.error}</p> : null}
    </form>
  );
}
