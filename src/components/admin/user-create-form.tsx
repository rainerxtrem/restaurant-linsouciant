"use client";

import { useActionState } from "react";
import { createUserAction, type UserActionState } from "@/app/(admin)/admin/(dashboard)/administrateurs/actions";

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";

export function UserCreateForm() {
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(createUserAction, {});
  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-ink-900/10 bg-white p-5 sm:grid-cols-2">
      <input name="name" placeholder="Nom" required className={input} />
      <input name="email" type="email" placeholder="Email" required className={input} />
      <input name="password" type="password" placeholder="Mot de passe (12+ car., Maj/min/chiffre)" required className={input} />
      <select name="role" defaultValue="ADMIN" className={input}>
        <option value="ADMIN">Administrateur</option>
        <option value="SUPER_ADMIN">Super-administrateur</option>
      </select>
      <div className="sm:col-span-2">
        <button disabled={pending} className="btn-cta">
          {pending ? "Création…" : "Créer le compte"}
        </button>
        {state.error ? <span className="ml-3 text-sm text-red-600">{state.error}</span> : null}
        {state.success ? <span className="ml-3 text-sm text-green-700">{state.success}</span> : null}
      </div>
    </form>
  );
}
