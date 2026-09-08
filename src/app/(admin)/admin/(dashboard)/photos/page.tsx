import Link from "next/link";
import { listAlbums } from "@/lib/services/gallery.service";
import { createAlbumAction, deleteAlbumAction } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";

export default async function AdminPhotosPage() {
  const albums = await listAlbums();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Photos</h1>

      <form action={createAlbumAction} className="mt-6 grid max-w-2xl gap-3 rounded-lg border border-ink-900/10 bg-white p-5 sm:grid-cols-[1fr_1fr_80px_auto]">
        <input name="title" placeholder="Titre de l'album (FR)" required className={input} />
        <input name="titleEn" placeholder="Titre (EN)" className={input} />
        <input name="order" type="number" defaultValue={0} className={input} />
        <button className="btn-cta">Créer</button>
      </form>

      <div className="mt-6 space-y-2">
        {albums.map((album) => (
          <div key={album.id} className="flex items-center justify-between rounded-lg border border-ink-900/10 bg-white px-4 py-3 text-sm">
            <div>
              <span className="font-medium text-ink-800">{album.title}</span>
              <span className="ml-3 text-ink-400">{album._count.images} photo(s)</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/photos/${album.id}`} className="text-wine-700 hover:underline">
                Gérer
              </Link>
              <form action={deleteAlbumAction}>
                <input type="hidden" name="id" value={album.id} />
                <button className="text-red-600 hover:underline">Supprimer</button>
              </form>
            </div>
          </div>
        ))}
        {albums.length === 0 ? <p className="text-sm text-ink-400">Aucun album.</p> : null}
      </div>
    </div>
  );
}
