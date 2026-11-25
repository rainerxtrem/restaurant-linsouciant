"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import {
  lookupVoucherAction,
  redeemVoucherAction,
  type CheckState,
  type VoucherCheckView,
} from "@/app/(admin)/admin/controle/actions";

const euro = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
const dateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

const STATE_UI: Record<VoucherCheckView["state"], { label: string; tone: string; Icon: typeof CheckCircle2 }> = {
  VALID: { label: "Bon valable", tone: "border-green-600/30 bg-green-50 text-green-800", Icon: CheckCircle2 },
  REDEEMED: { label: "Déjà utilisé", tone: "border-amber-500/40 bg-amber-50 text-amber-900", Icon: AlertTriangle },
  EXPIRED: { label: "Expiré", tone: "border-red-600/30 bg-red-50 text-red-800", Icon: XCircle },
  UNPAID: { label: "Paiement non finalisé — non valable", tone: "border-red-600/30 bg-red-50 text-red-800", Icon: XCircle },
  CANCELLED: { label: "Annulé — non valable", tone: "border-red-600/30 bg-red-50 text-red-800", Icon: XCircle },
};

/** Écran de salle : saisir un code, voir le bon, le marquer comme utilisé. */
export function VoucherCheck() {
  const [state, formAction, pending] = useActionState<CheckState, FormData>(
    (prev, fd) => (fd.get("intent") === "redeem" ? redeemVoucherAction(prev, fd) : lookupVoucherAction(prev, fd)),
    {}
  );
  const [confirming, setConfirming] = useState(false);
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Nouveau résultat → on referme la confirmation, on remet le code normalisé.
  useEffect(() => {
    setConfirming(false);
    if (state.query) setCode(state.query);
  }, [state]);

  const view = state.view;
  const ui = view ? STATE_UI[view.state] : null;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Vérifier un bon cadeau</h1>
      <p className="mt-1 text-sm text-ink-500">
        Saisissez le code inscrit sur le bon (ex. <span className="whitespace-nowrap font-mono">LINS-7F3K-QX9M</span>).
      </p>

      <form action={formAction} className="mt-6 flex gap-2">
        <input type="hidden" name="intent" value="lookup" />
        <input
          ref={inputRef}
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="LINS-XXXX-XXXX"
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          className="min-w-0 flex-1 rounded-md border border-ink-200 bg-white px-4 py-3 font-mono text-lg uppercase tracking-wider"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-md bg-wine-700 px-5 py-3 text-sm font-medium text-white hover:bg-wine-800 disabled:opacity-60"
        >
          <Search className="h-4 w-4" aria-hidden />
          Vérifier
        </button>
      </form>

      {state.error && !view ? <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}

      {view && ui ? (
        <section className="mt-6 overflow-hidden rounded-lg border border-ink-900/10 bg-white" aria-live="polite">
          <div className={`flex items-center gap-3 border-b px-5 py-4 ${ui.tone}`}>
            <ui.Icon className="h-6 w-6 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">{ui.label}</p>
              <p className="font-mono text-xs opacity-80">{view.code}</p>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            <p className="font-display text-4xl text-ink-900">{euro(view.amountCents)} €</p>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-ink-400">Pour</dt>
              <dd className="text-ink-800">{view.recipientName || view.buyerName}</dd>
              {view.recipientName ? (
                <>
                  <dt className="text-ink-400">Offert par</dt>
                  <dd className="text-ink-800">{view.buyerName}</dd>
                </>
              ) : null}
              {view.selectionLabel ? (
                <>
                  <dt className="text-ink-400">Contenu</dt>
                  <dd className="text-ink-800">{view.selectionLabel}</dd>
                </>
              ) : null}
              {view.expiresAt ? (
                <>
                  <dt className="text-ink-400">{view.state === "EXPIRED" ? "Expiré le" : "Valable jusqu'au"}</dt>
                  <dd className="text-ink-800">{date(view.expiresAt)}</dd>
                </>
              ) : null}
              {view.state === "REDEEMED" ? (
                <>
                  <dt className="text-ink-400">Utilisé le</dt>
                  <dd className="text-ink-800">
                    {dateTime(view.redeemedAt)}
                    {view.redeemedByName ? ` — par ${view.redeemedByName}` : ""}
                  </dd>
                </>
              ) : null}
            </dl>

            {view.message ? (
              <blockquote className="border-l-2 border-gold-400 pl-3 text-sm italic text-ink-600">{view.message}</blockquote>
            ) : null}

            {state.notice ? <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">{state.notice}</p> : null}
            {state.error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}

            {view.state === "VALID" ? (
              confirming ? (
                <form action={formAction} className="rounded-md border border-wine-700/30 bg-cream-100 p-4">
                  <input type="hidden" name="intent" value="redeem" />
                  <input type="hidden" name="id" value={view.id} />
                  <p className="text-sm text-ink-800">
                    Confirmer : le bon de <strong>{euro(view.amountCents)} €</strong> sera marqué comme utilisé. Cette
                    action ne peut être annulée que par un administrateur.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="flex-1 rounded-md border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="flex-1 rounded-md bg-wine-700 px-4 py-3 text-sm font-medium text-white hover:bg-wine-800 disabled:opacity-60"
                    >
                      {pending ? "Validation…" : "Confirmer"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="w-full rounded-md bg-wine-700 px-4 py-4 text-base font-medium text-white hover:bg-wine-800"
                >
                  Marquer comme utilisé
                </button>
              )
            ) : null}

            <button
              type="button"
              onClick={() => {
                setCode("");
                inputRef.current?.focus();
              }}
              className="w-full text-sm text-ink-500 underline-offset-4 hover:underline"
            >
              Vérifier un autre bon
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
