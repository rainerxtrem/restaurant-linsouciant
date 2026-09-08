import Link from "next/link";
import { listPages } from "@/lib/services/page.service";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await listPages();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Pages</h1>
      <p className="mt-1 text-sm text-ink-500">Mentions légales, confidentialité, cookies, accessibilité, CGV.</p>
      <div className="mt-6 space-y-2">
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
