"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import {
  addImagesAction,
  reorderImagesAction,
  removeImageAction,
} from "@/app/(admin)/admin/(dashboard)/photos/actions";

interface AlbumImage {
  id: string;
  url: string;
  alt: string | null;
}

export function GalleryManager({ albumId, initialImages }: { albumId: string; initialImages: AlbumImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleSelected(media: PickedMedia[]) {
    const ids = media.map((m) => m.id);
    startTransition(async () => {
      await addImagesAction(albumId, ids);
      location.reload();
    });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    setImages(next);
    startTransition(() => reorderImagesAction(albumId, next.map((i) => i.id)));
  }

  function remove(id: string) {
    setImages((prev) => prev.filter((x) => x.id !== id));
    const fd = new FormData();
    fd.set("id", id);
    startTransition(() => removeImageAction(fd));
  }

  return (
    <div>
      <button type="button" onClick={() => setPickerOpen(true)} className="btn-cta">
        Ajouter des photos
      </button>
      <MediaPicker open={pickerOpen} multiple onClose={() => setPickerOpen(false)} onSelect={handleSelected} />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border border-ink-100">
            <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="200px" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 p-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} aria-label="Reculer">◀</button>
              <button type="button" onClick={() => remove(img.id)} aria-label="Retirer">✕</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Avancer">▶</button>
            </div>
          </div>
        ))}
        {images.length === 0 ? <p className="text-sm text-ink-400">Aucune photo dans cet album.</p> : null}
      </div>
    </div>
  );
}
