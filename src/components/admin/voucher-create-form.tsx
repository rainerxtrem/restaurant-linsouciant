"use client";

import { useActionState } from "react";
import { createVoucherAction, type VoucherActionState } from "@/app/(admin)/admin/(dashboard)/bons-cadeaux/actions";

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";

export function VoucherCreateForm() {
  const [state, formAction, pending] = useActionState<VoucherActionState, FormData>(createVoucherAction, {});

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-ink-900/10 bg-white p-5 sm:grid-cols-2">
      <input name="amount" type="number" min={10} max={500} placeholder="Montant (€)" required className={input} />
      <input name="buyerName" placeholder="Nom de l'acheteur" required className={input} />
      <input name="buyerEmail" type="email" placeholder="Email de l'acheteur" required className={input} />
      <input name="recipientName" placeholder="Bénéficiaire (facultatif)" className={input} />
      <input name="recipientEmail" type="email" placeholder="Email bénéficiaire (facultatif)" className={input} />
      <input name="message" placeholder="Message (facultatif)" className={input} />
      <label className="flex items-center gap-2 text-sm text-ink-600">
        <input type="checkbox" name="sendEmail" defaultChecked /> Envoyer le bon par email
      </label>
      <div className="sm:col-span-2">
        <button disabled={pending} className="btn-cta">
          {pending ? "Création…" : "Créer un bon cadeau"}
        </button>
        {state.error ? <span className="ml-3 text-sm text-red-600">{state.error}</span> : null}
        {state.success ? <span className="ml-3 text-sm text-green-700">{state.success}</span> : null}
      </div>
    </form>
  );
}
