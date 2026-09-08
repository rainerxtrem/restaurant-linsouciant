"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm, type ContactFormState } from "@/app/(site)/[locale]/contact/actions";

const field =
  "w-full border-0 border-b border-ink-900/20 bg-transparent px-0 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-wine-700 focus:outline-none focus:ring-0";
const label = "block text-[11px] uppercase tracking-[0.15em] text-ink-500";

export function ContactForm() {
  const t = useTranslations("contact");
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(submitContactForm, {});

  if (state.success) {
    return (
      <div className="border-l-2 border-green-500 bg-green-50/60 p-5 text-sm text-green-800">
        {t("success")}
      </div>
    );
  }

  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <form action={formAction} className="space-y-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{t("fullName")}</span>
          <input name="fullName" required className={field} />
          {err("fullName") ? <span className="mt-1 block text-xs text-red-600">{err("fullName")}</span> : null}
        </label>
        <label className="block">
          <span className={label}>Email</span>
          <input type="email" name="email" required className={field} />
          {err("email") ? <span className="mt-1 block text-xs text-red-600">{err("email")}</span> : null}
        </label>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{t("subject")}</span>
          <input name="subject" className={field} />
        </label>
        <label className="block">
          <span className={label}>Tél.</span>
          <input name="phone" className={field} />
        </label>
      </div>
      <label className="block">
        <span className={label}>{t("message")}</span>
        <textarea name="message" required rows={4} className={field} />
        {err("message") ? <span className="mt-1 block text-xs text-red-600">{err("message")}</span> : null}
      </label>
      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-500">
        <input type="checkbox" name="consentGdpr" required className="mt-0.5" />
        {t("consent")}
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-wine-700 px-10 py-4 text-xs uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-wine-800 disabled:opacity-60"
      >
        {pending ? t("sending") : t("send")}
      </button>
    </form>
  );
}
