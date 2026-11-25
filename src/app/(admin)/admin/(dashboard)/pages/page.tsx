import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { listPages } from "@/lib/services/page.service";
import { SITE_PAGES } from "@/lib/content/pages";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const [pages, contents] = await Promise.all([
    listPages(),
    prisma.pageContent.findMany({ select: { key: true, updatedAt: true } }),
  ]);
  const updated = new Map(contents.map((c) => [c.key, c.updatedAt]));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Pages</h1>

      <h2 className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Pages du site</h2>
      <p className="mt-1 text-sm text-ink-500">Tous les textes et photos de chaque page, en français et en anglais.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {SITE_PAGES.map((p) => (
          <Link
            key={p.key}
            href={`/admin/pages/site/${p.key}`}
            className="flex items-center justify-between rounded-lg border border-ink-900/10 bg-white px-4 py-3 text-sm hover:border-wine-600"
          >
            <span>
              <span className="block font-medium text-ink-800">{p.label}</span>
              <span className="text-xs text-ink-400">
                {p.path}
                {updated.get(p.key) ? ` · modifiée le ${updated.get(p.key)!.toLocaleDateString("fr-FR")}` : ""}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-ink-400" aria-hidden />
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Pages de texte</h2>
      <p className="mt-1 text-sm text-ink-500">
        Mentions légales, confidentialité, cookies, accessibilité, CGV, et le texte d&apos;introduction de La maison
        (éditeur de texte riche).
      </p>
      <div className="mt-3 space-y-2">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/admin/pages/${page.id}`}
            className="flex items-center justify-between rounded-lg border border-ink-900/10 bg-white px-4 py-3 text-sm hover:border-wine-600"
          >
            <span className="font-medium text-ink-800">{page.title}</span>
            <span className={page.status === "PUBLISHED" ? "text-green-700" : "text-ink-400"}>
              {page.status === "PUBLISHED" ? "Publié" : "Brouillon"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
