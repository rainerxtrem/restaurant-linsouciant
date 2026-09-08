import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const [confirmed, pending, subscribers] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { confirmedAt: { not: null }, unsubscribedAt: null } }),
    prisma.newsletterSubscriber.count({ where: { confirmedAt: null, unsubscribedAt: null } }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 300 }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Newsletter</h1>
        <a href="/api/admin/newsletter/export" className="text-sm text-wine-700 hover:underline">
          Exporter les abonnés confirmés (CSV)
        </a>
      </div>
      <p className="mt-2 text-sm text-ink-500">
        {confirmed} abonné(s) confirmé(s) · {pending} en attente de confirmation.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Langue</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2 uppercase text-ink-500">{s.locale}</td>
                <td className="px-4 py-2">
                  {s.unsubscribedAt ? (
                    <span className="text-ink-400">Désinscrit</span>
                  ) : s.confirmedAt ? (
                    <span className="text-green-700">Confirmé</span>
                  ) : (
                    <span className="text-gold-600">En attente</span>
                  )}
                </td>
                <td className="px-4 py-2 text-ink-500">{s.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
