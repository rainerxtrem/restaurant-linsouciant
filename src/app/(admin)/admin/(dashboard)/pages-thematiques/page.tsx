import Link from "next/link";
import { listAllThemePages } from "@/lib/services/theme-page.service";
import { toggleThemePageAction, deleteThemePageAction, duplicateThemePageAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminThemePagesPage() {
  const pages = await listAllThemePages();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Pages thématiques</h1>
        <Link href="/admin/pages-thematiques/new" className="btn-cta">
          Nouvelle page
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        Noël, Pâques, traiteur à emporter… Chaque page présente vos produits en encadrés (photo,
        description, tarifs) et les menus que vous y rattachez depuis « Cartes &amp; menus ». Une
        page activée apparaît dans le menu du site.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Adresse</th>
              <th className="px-4 py-3">Contenu</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-ink-800">{p.title}</td>
                <td className="px-4 py-3">
                  {p.enabled ? (
                    <a href={`/${p.slug}`} target="_blank" rel="noreferrer" className="text-wine-700 hover:underline">
                      /{p.slug}
                    </a>
                  ) : (
                    <span className="text-ink-400">/{p.slug}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {p._count.products} produit{p._count.products > 1 ? "s" : ""} · {p._count.menus} menu
                  {p._count.menus > 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleThemePageAction} className="flex items-center gap-3">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="enabled" value={p.enabled ? "false" : "true"} />
                    <span className={p.enabled ? "text-green-700" : "text-ink-400"}>
                      {p.enabled ? "Activée" : "Désactivée"}
                    </span>
                    <button className="text-xs text-wine-700 hover:underline">
                      {p.enabled ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link href={`/admin/pages-thematiques/${p.id}`} className="text-wine-700 hover:underline">
                    Modifier
                  </Link>
                  <form action={duplicateThemePageAction} className="ml-3 inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-wine-700 hover:underline">Dupliquer</button>
                  </form>
                  <form action={deleteThemePageAction} className="ml-3 inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-red-600 hover:underline">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  Aucune page thématique.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
