import { getAnnouncement } from "@/lib/services/announcement.service";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementPage() {
  const announcement = await getAnnouncement();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Annonce / pop-up d&apos;accueil</h1>
      <p className="mt-1 text-sm text-ink-500">
        Fenêtre affichée à l&apos;arrivée sur le site, que le visiteur peut fermer. Planifiable entre
        deux dates.
      </p>
      <div className="mt-6">
        <AnnouncementForm announcement={announcement} />
      </div>
    </div>
  );
}
