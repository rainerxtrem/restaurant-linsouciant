"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, FileText, Upload, X } from "lucide-react";
import type { MediaLibraryItem } from "@/lib/services/media-library.service";
import { deleteMediaAction, updateMediaAltAction } from "@/app/(admin)/admin/(dashboard)/medias/actions";
import { cn } from "@/lib/utils/cn";

type Filter = "all" | "images" | "documents" | "unused";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "images", label: "Images" },
  { key: "documents", label: "Documents" },
  { key: "unused", label: "Inutilisés" },
];

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

export function MediaLibrary({ items }: { items: MediaLibraryItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(
    () => ({
      all: items.length,
      images: items.filter((m) => m.type === "IMAGE").length,
      documents: items.filter((m) => m.type === "DOCUMENT").length,
      unused: items.filter((m) => m.usages.length === 0).length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => {
      if (filter === "images" && m.type !== "IMAGE") return false;
      if (filter === "documents" && m.type !== "DOCUMENT") return false;
      if (filter === "unused" && m.usages.length > 0) return false;
      if (q && !m.filename.toLowerCase().includes(q) && !m.alt.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, query]);

  const selected = items.find((m) => m.id === selectedId) ?? null;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body }).catch(() => null);
      if (!res?.ok) {
        const data = await res?.json().catch(() => null);
        errors.push(`${file.name} : ${data?.error ?? "erreur d'envoi"}`);
      }
    }
    setUploadErrors(errors);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-md border border-ink-900/10 bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded px-3 py-1.5 text-sm transition-colors",
                filter === f.key ? "bg-wine-700 text-cream-50" : "text-ink-600 hover:bg-cream-100"
              )}
            >
              {f.label} <span className="opacity-60">({counts[f.key]})</span>
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un fichier…"
          className={`${input} max-w-xs`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="ml-auto flex items-center gap-2 rounded-md bg-wine-700 px-4 py-2 text-sm text-white hover:bg-wine-800 disabled:opacity-60"
        >
          <Upload className="h-4 w-4" aria-hidden />
          {uploading ? "Envoi…" : "Envoyer des fichiers"}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/jpeg,image/png,image/webp,image/avif,.avif,image/gif,image/svg+xml,application/pdf"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {uploadErrors.length ? (
        <ul className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedId(m.id)}
            className={cn(
              "group overflow-hidden rounded-lg border bg-white text-left transition-shadow hover:shadow-card",
              selectedId === m.id ? "border-wine-700 ring-2 ring-wine-700/30" : "border-ink-900/10"
            )}
          >
            <div className="relative aspect-square bg-cream-100">
              {m.type === "IMAGE" ? (
                <Image src={m.url} alt={m.alt} fill className="object-cover" sizes="220px" />
              ) : (
                <span className="flex h-full items-center justify-center text-ink-400">
                  <FileText className="h-10 w-10" aria-hidden />
                </span>
              )}
              {m.usages.length === 0 ? (
                <span className="absolute left-2 top-2 rounded bg-ink-900/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-cream-50">
                  Inutilisé
                </span>
              ) : null}
              {m.type === "IMAGE" && !m.alt ? (
                <span className="absolute right-2 top-2 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] text-white" title="Description manquante">
                  sans description
                </span>
              ) : null}
            </div>
            <div className="px-3 py-2">
              <p className="truncate text-xs font-medium text-ink-800">{m.filename}</p>
              <p className="text-[11px] text-ink-400">
                {formatSize(m.size)}
                {m.width && m.height ? ` · ${m.width}×${m.height}` : ""}
              </p>
            </div>
          </button>
        ))}
      </div>
      {visible.length === 0 ? <p className="mt-8 text-center text-sm text-ink-400">Aucun fichier.</p> : null}

      {selected ? <MediaPanel key={selected.id} item={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

function MediaPanel({ item, onClose }: { item: MediaLibraryItem; onClose: () => void }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.alt);
  const [altEn, setAltEn] = useState(item.altEn);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const absoluteUrl = typeof window !== "undefined" ? new URL(item.url, window.location.origin).toString() : item.url;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink-950/30" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-elevated">
        <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <p className="truncate pr-4 text-sm font-medium text-ink-800">{item.filename}</p>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-ink-500 hover:text-ink-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-cream-100">
            {item.type === "IMAGE" ? (
              <Image src={item.url} alt={item.alt} fill className="object-contain" sizes="420px" />
            ) : (
              <span className="flex h-full items-center justify-center text-ink-400">
                <FileText className="h-14 w-14" aria-hidden />
              </span>
            )}
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <dt className="text-ink-400">Type</dt>
            <dd className="text-ink-700">{item.mimeType}</dd>
            <dt className="text-ink-400">Poids</dt>
            <dd className="text-ink-700">{formatSize(item.size)}</dd>
            {item.width && item.height ? (
              <>
                <dt className="text-ink-400">Dimensions</dt>
                <dd className="text-ink-700">
                  {item.width} × {item.height} px
                </dd>
              </>
            ) : null}
            <dt className="text-ink-400">Ajouté le</dt>
            <dd className="text-ink-700">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</dd>
          </dl>

          <div>
            <p className="mb-1 text-xs font-medium text-ink-600">Utilisé sur le site</p>
            {item.usages.length ? (
              <ul className="flex flex-wrap gap-1.5">
                {item.usages.map((u) => (
                  <li key={u} className="rounded bg-cream-100 px-2 py-1 text-xs text-ink-700">
                    {u}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ink-400">Nulle part : ce fichier peut être supprimé sans risque.</p>
            )}
          </div>

          {item.type === "IMAGE" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  const res = await updateMediaAltAction({ id: item.id, alt, altEn });
                  setMessage("error" in res ? res.error ?? "Erreur." : "Description enregistrée.");
                  router.refresh();
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-600">Description de l&apos;image (FR)</label>
                <input className={input} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex. Saint-Jacques snackées, topinambour et noisette" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-600">Description de l&apos;image (EN)</label>
                <input className={input} value={altEn} onChange={(e) => setAltEn(e.target.value)} />
              </div>
              <button type="submit" disabled={pending} className="rounded-md bg-wine-700 px-4 py-2 text-sm text-white hover:bg-wine-800 disabled:opacity-60">
                {pending ? "Enregistrement…" : "Enregistrer la description"}
              </button>
            </form>
          ) : null}

          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(absoluteUrl).then(() => setMessage("Lien copié."));
              }}
              className="flex items-center gap-1.5 text-wine-700 hover:underline"
            >
              <Copy className="h-4 w-4" aria-hidden />
              Copier le lien
            </button>
            <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-wine-700 hover:underline">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Ouvrir l&apos;original
            </a>
          </div>

          {message ? <p className="text-sm text-green-700">{message}</p> : null}

          <div className="border-t border-ink-900/10 pt-5">
            {confirmDelete ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {item.usages.length ? (
                  <p>
                    Ce fichier est utilisé ({item.usages.join(", ")}). Le supprimer le retirera de ces emplacements
                    {item.usages.some((u) => u.startsWith("Galerie")) ? ", y compris de la galerie photos" : ""}.
                  </p>
                ) : (
                  <p>Supprimer définitivement ce fichier ?</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-ink-700">
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteMediaAction(item.id);
                        onClose();
                        router.refresh();
                      })
                    }
                    className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {pending ? "Suppression…" : "Supprimer"}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-red-600 hover:underline">
                Supprimer ce fichier
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
