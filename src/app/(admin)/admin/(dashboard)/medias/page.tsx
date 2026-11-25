import { listMediaLibrary } from "@/lib/services/media-library.service";
import { MediaLibrary } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const items = await listMediaLibrary();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Médiathèque</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        Toutes les images et documents envoyés sur le site. Cliquez sur un fichier pour renseigner sa description
        (lue par les lecteurs d&apos;écran et Google), copier son lien ou le supprimer.
      </p>
      <MediaLibrary items={items} />
    </div>
  );
}
