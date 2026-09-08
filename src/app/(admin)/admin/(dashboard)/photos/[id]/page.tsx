import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbum } from "@/lib/services/gallery.service";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";

export default async function AdminAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  return (
    <div>
      <Link href="/admin/photos" className="text-sm text-wine-700 hover:underline">
        ← Tous les albums
      </Link>
      <h1 className="mt-2 font-display text-2xl text-ink-900">{album.title}</h1>
      <p className="mb-6 text-sm text-ink-500">Ajoutez des photos depuis la médiathèque, réordonnez-les au survol.</p>
      <GalleryManager
        albumId={album.id}
        initialImages={album.images.map((img) => ({ id: img.id, url: img.media.url, alt: img.media.alt }))}
      />
    </div>
  );
}
