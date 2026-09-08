"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm, type ContactFormState } from "@/app/(site)/[locale]/contact/actions";

export function ContactForm() {
  const t = useTranslations("contact");
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(submitContactForm, {});

  if (state.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-5 text-sm text-green-800">
        {t("success")}
      </div>
    );
  }

  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">{t("fullName")}</span>
          <input name="fullName" required className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-wine-600 focus:outline-none" />
          {err("fullName") ? <span className="mt-1 block text-xs text-red-600">{err("fullName")}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Email</span>
          <input type="email" name="email" required className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-wine-600 focus:outline-none" />
          {err("email") ? <span className="mt-1 block text-xs text-red-600">{err("email")}</span> : null}
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">{t("subject")}</span>
          <input name="subject" className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-wine-600 focus:outline-none" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Tél.</span>
          <input name="phone" className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-wine-600 focus:outline-none" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink-700">{t("message")}</span>
        <textarea name="message" required rows={5} className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-wine-600 focus:outline-none" />
        {err("message") ? <span className="mt-1 block text-xs text-red-600">{err("message")}</span> : null}
      </label>
      <label className="flex items-start gap-2 text-xs text-ink-600">
        <input type="checkbox" name="consentGdpr" required className="mt-0.5" />
        {t("consent")}
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-cta w-full sm:w-auto"
      >
        {pending ? t("sending") : t("send")}
      </button>
    </form>
  );
}
