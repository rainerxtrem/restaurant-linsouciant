import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { UserCreateForm } from "@/components/admin/user-create-form";
import { toggleUserActiveAction, deleteUserAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Administrateurs</h1>
      <div className="mt-6">
        <UserCreateForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium text-ink-800">{u.name}</td>
                <td className="px-4 py-2 text-ink-600">{u.email}</td>
                <td className="px-4 py-2 text-ink-500">
                  {u.role === "SUPER_ADMIN" ? "Super-admin" : "Admin"}
                </td>
                <td className="px-4 py-2">
                  {u.isActive ? <span className="text-green-700">Actif</span> : <span className="text-ink-400">Désactivé</span>}
                </td>
                <td className="px-4 py-2 text-right">
                  {u.id === session.user.id ? (
                    <span className="text-xs text-ink-400">Vous</span>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <form action={toggleUserActiveAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-xs text-wine-700 hover:underline">
                          {u.isActive ? "Désactiver" : "Réactiver"}
                        </button>
                      </form>
                      <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-xs text-red-600 hover:underline">Supprimer</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
