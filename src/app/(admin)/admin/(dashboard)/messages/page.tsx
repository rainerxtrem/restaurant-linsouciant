import { prisma } from "@/lib/db/prisma";
import { setMessageStatusAction, deleteMessageAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Messages de contact</h1>
      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <details
            key={m.id}
            className="rounded-lg border border-ink-900/10 bg-white p-4 text-sm"
            open={m.status === "UNREAD"}
          >
            <summary className="flex cursor-pointer items-center justify-between">
              <span>
                <strong className={m.status === "UNREAD" ? "text-ink-900" : "text-ink-500"}>{m.fullName}</strong>
                <span className="ml-2 text-ink-400">{m.subject || "—"}</span>
              </span>
              <span className="text-xs text-ink-400">{m.createdAt.toLocaleDateString("fr-FR")}</span>
            </summary>
            <div className="mt-3 space-y-2 text-ink-700">
              <p>
                <a href={`mailto:${m.email}`} className="text-wine-700 underline">
                  {m.email}
                </a>
                {m.phone ? ` · ${m.phone}` : ""}
              </p>
              <p className="whitespace-pre-wrap rounded bg-cream-100 p-3">{m.message}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Votre message")}`} className="rounded border border-ink-200 px-3 py-1 text-xs hover:border-wine-600">
                  Répondre
                </a>
                {(["READ", "ARCHIVED", "UNREAD"] as const)
                  .filter((s) => s !== m.status)
                  .map((s) => (
                    <form key={s} action={setMessageStatusAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="status" value={s} />
                      <button className="rounded border border-ink-200 px-3 py-1 text-xs hover:border-wine-600">
                        {s === "READ" ? "Marquer lu" : s === "ARCHIVED" ? "Archiver" : "Non lu"}
                      </button>
                    </form>
                  ))}
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:border-red-400">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          </details>
        ))}
        {messages.length === 0 ? <p className="text-sm text-ink-400">Aucun message.</p> : null}
      </div>
    </div>
  );
}
