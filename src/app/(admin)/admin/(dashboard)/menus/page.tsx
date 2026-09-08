import Link from "next/link";
import { listAllMenus } from "@/lib/services/menu.service";
import { deleteMenuAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const menus = await listAllMenus();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Cartes & menus</h1>
        <Link href="/admin/menus/new" className="btn-cta">
          Nouveau menu
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Sections</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {menus.map((menu) => (
              <tr key={menu.id}>
                <td className="px-4 py-3 font-medium text-ink-800">{menu.name}</td>
                <td className="px-4 py-3">
                  <span className={menu.status === "PUBLISHED" ? "text-green-700" : "text-ink-400"}>
                    {menu.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500">{menu.sections.length}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/menus/${menu.id}`} className="text-wine-700 hover:underline">
                    Modifier
                  </Link>
                  <form action={deleteMenuAction} className="ml-3 inline">
                    <input type="hidden" name="id" value={menu.id} />
                    <button className="text-red-600 hover:underline">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
            {menus.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-400">
                  Aucun menu.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
