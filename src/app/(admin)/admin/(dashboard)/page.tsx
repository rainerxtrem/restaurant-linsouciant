import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getGiftVoucherStats } from "@/lib/services/gift-voucher.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [unread, menus, albums, subscribers, stats] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.menu.count(),
    prisma.galleryAlbum.count(),
    prisma.newsletterSubscriber.count({ where: { confirmedAt: { not: null }, unsubscribedAt: null } }),
    getGiftVoucherStats(),
  ]);

  const tiles = [
    { label: "Messages non lus", value: unread, href: "/admin/messages" },
    { label: "Menus", value: menus, href: "/admin/menus" },
    { label: "Albums photos", value: albums, href: "/admin/photos" },
    { label: "Abonnés newsletter", value: subscribers, href: "/admin/newsletter" },
    { label: "Bons cadeaux actifs", value: stats.byStatus.ACTIVE, href: "/admin/bons-cadeaux" },
    {
      label: "Ventes bons cadeaux",
      value: `${(stats.soldCents / 100).toFixed(0)} €`,
      href: "/admin/bons-cadeaux",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Tableau de bord</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="rounded-lg border border-ink-900/10 bg-white p-5 transition-colors hover:border-wine-600"
          >
            <p className="text-sm text-ink-500">{tile.label}</p>
            <p className="mt-2 font-display text-3xl text-ink-900">{tile.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
