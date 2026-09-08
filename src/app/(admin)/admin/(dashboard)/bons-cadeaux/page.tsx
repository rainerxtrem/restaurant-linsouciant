import { listVouchersAdmin } from "@/lib/services/gift-voucher.service";
import { VoucherCreateForm } from "@/components/admin/voucher-create-form";
import { setVoucherStatusAction, resendVoucherAction, deleteVoucherAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "En attente",
  ACTIVE: "Actif",
  REDEEMED: "Utilisé",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
};

export default async function AdminGiftVouchersPage() {
  const vouchers = await listVouchersAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Bons cadeaux</h1>
        <a href="/api/admin/gift-vouchers/export" className="text-sm text-wine-700 hover:underline">
          Exporter (CSV)
        </a>
      </div>

      <div className="mt-6">
        <VoucherCreateForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-3 py-3">Code</th>
              <th className="px-3 py-3">Montant</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Acheteur</th>
              <th className="px-3 py-3">Expire</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td className="px-3 py-3 font-mono text-xs">{v.code}</td>
                <td className="px-3 py-3">{(v.amountCents / 100).toFixed(2)} €</td>
                <td className="px-3 py-3">{STATUS_LABEL[v.status]}</td>
                <td className="px-3 py-3 text-ink-600">
                  {v.buyerName}
                  <br />
                  <span className="text-xs text-ink-400">{v.buyerEmail}</span>
                </td>
                <td className="px-3 py-3 text-ink-500">
                  {v.expiresAt ? v.expiresAt.toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={`/api/admin/gift-vouchers/${v.id}/pdf`} className="text-xs text-wine-700 hover:underline">
                      PDF
                    </a>
                    <form action={resendVoucherAction}>
                      <input type="hidden" name="id" value={v.id} />
                      <button className="text-xs text-wine-700 hover:underline">Renvoyer</button>
                    </form>
                    <form action={setVoucherStatusAction}>
                      <input type="hidden" name="id" value={v.id} />
                      <select name="status" defaultValue={v.status} className="rounded border border-ink-200 px-1 py-0.5 text-xs">
                        {Object.entries(STATUS_LABEL).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button className="ml-1 text-xs text-wine-700 hover:underline">OK</button>
                    </form>
                    <form action={deleteVoucherAction}>
                      <input type="hidden" name="id" value={v.id} />
                      <button className="text-xs text-red-600 hover:underline">Suppr.</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-ink-400">
                  Aucun bon cadeau.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
