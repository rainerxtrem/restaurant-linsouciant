"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { saveNavOrderAction, togglePageAction } from "@/app/(admin)/admin/(dashboard)/navigation/actions";
import { cn } from "@/lib/utils/cn";

export interface NavRow {
  /** Clé d'ordre (house, menus, themes…). */
  key: string;
  /** Clé envoyée à togglePageAction ; null = pas d'interrupteur ici. */
  toggleKey: string | null;
  label: string;
  href: string | null;
  enabled: boolean;
  note: string | null;
  manageHref?: string;
}

/**
 * Liste du menu : glisser-déposer pour l'ordre (flèches sur mobile / au
 * clavier), bouton Afficher / Masquer par page. L'ordre est enregistré à
 * chaque déplacement.
 */
export function NavOrderList({ rows: initial }: { rows: NavRow[] }) {
  const [rows, setRows] = useState(initial);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();

  // Après « Masquer / Afficher », le serveur renvoie la liste à jour.
  useEffect(() => setRows(initial), [initial]);

  function persist(next: NavRow[]) {
    setRows(next);
    setStatus("saving");
    startTransition(async () => {
      const res = await saveNavOrderAction(next.map((r) => r.key));
      setStatus("ok" in res ? "saved" : "error");
    });
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    persist(next);
  }

  return (
    <div>
      <div className="max-w-3xl overflow-hidden rounded-lg border border-ink-900/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink-900/5 px-5 py-4 text-sm">
          <div>
            <p className="font-medium text-ink-800">Accueil</p>
            <p className="text-xs text-ink-400">/ — toujours en tête et affiché</p>
          </div>
        </div>
        <ul>
          {rows.map((row, i) => (
            <li
              key={row.key}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== i) setOverIndex(i);
              }}
              onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "flex flex-wrap items-center gap-3 border-b border-ink-900/5 px-3 py-4 text-sm last:border-b-0 sm:px-5",
                dragIndex === i && "opacity-40",
                overIndex === i && dragIndex !== null && dragIndex !== i && "bg-cream-100 shadow-[inset_0_2px_0_theme(colors.wine.700)]"
              )}
            >
              <span className="cursor-grab text-ink-300 active:cursor-grabbing" title="Glisser pour déplacer" aria-hidden>
                <GripVertical className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label={`Monter ${row.label}`}
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                  className="text-ink-400 hover:text-ink-800 disabled:opacity-20"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Descendre ${row.label}`}
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, i + 1)}
                  className="text-ink-400 hover:text-ink-800 disabled:opacity-20"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-800">{row.label}</p>
                {row.href ? <p className="text-xs text-ink-400">{row.href}</p> : null}
                {row.note ? <p className="mt-1 max-w-md text-xs text-amber-700">{row.note}</p> : null}
              </div>

              {row.toggleKey ? (
                <form action={togglePageAction} className="flex items-center gap-4">
                  <input type="hidden" name="key" value={row.toggleKey} />
                  <input type="hidden" name="enable" value={row.enabled ? "false" : "true"} />
                  <span className={row.enabled ? "text-xs text-green-700" : "text-xs text-ink-400"}>
                    {row.enabled ? "Affichée" : "Masquée"}
                  </span>
                  <button
                    type="submit"
                    className={
                      row.enabled
                        ? "rounded-md border border-ink-200 px-3 py-1.5 text-xs text-ink-700 hover:bg-cream-100"
                        : "rounded-md bg-wine-700 px-3 py-1.5 text-xs text-white hover:bg-wine-800"
                    }
                  >
                    {row.enabled ? "Masquer" : "Afficher"}
                  </button>
                </form>
              ) : row.manageHref ? (
                <Link href={row.manageHref} className="text-xs text-wine-700 hover:underline">
                  Gérer
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 h-5 text-sm" aria-live="polite">
        {status === "saving" ? <span className="text-ink-500">Enregistrement de l&apos;ordre…</span> : null}
        {status === "saved" ? <span className="text-green-700">Ordre enregistré.</span> : null}
        {status === "error" ? <span className="text-red-600">L&apos;ordre n&apos;a pas pu être enregistré.</span> : null}
      </p>
    </div>
  );
}
